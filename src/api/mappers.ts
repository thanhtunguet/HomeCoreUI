/**
 * Conversion between wire types (`schema.ts`, snake_case, as in the OpenAPI spec) and the UI
 * model (`../types`). Everything the API cannot express is either derived here or flagged as a
 * gap in docs/reports/frontend-api-integration.md.
 */
import type {
  ActivityEvent,
  DDNSConfig,
  DDNSState,
  Device,
  DeviceMonitoring,
  SystemMetrics,
} from '../types';
import type {
  ApiCommand,
  ApiDdnsConfig,
  ApiDevice,
  ApiSystemMetrics,
  DeviceCreate,
  DeviceUpdate,
} from './schema';
import { formatRelative } from './format';

// ---- devices -------------------------------------------------------------------------------

const PRESET_PORTS: Record<number, DeviceMonitoring['protocolPreset']> = {
  22: 'SSH',
  3389: 'RDP',
  80: 'HTTP',
  443: 'HTTPS',
};

export const presetForPort = (port: number): DeviceMonitoring['protocolPreset'] => PRESET_PORTS[port] ?? 'CUSTOM';

/** `latencyMs` is a fresher figure from a probe made in this session; it wins over the stored one. */
export function toDevice(d: ApiDevice, latencyMs?: number): Device {
  const hasAgent = Boolean(d.agent);
  return {
    id: d.id,
    name: d.name,
    description: d.description ?? '',
    type: d.device_type ?? 'desktop',
    os: d.os ?? 'linux',
    ip: d.ip_address,
    mac: (d.mac_address ?? '').toUpperCase(),
    status: d.status,
    powerTransition: d.power_transition,
    lastSeen: formatRelative(d.last_seen_at),
    monitoring: {
      enabled: d.enabled,
      port: d.monitor_port,
      protocolPreset: presetForPort(d.monitor_port),
      intervalSeconds: d.monitor_interval_seconds,
      timeoutMs: d.monitor_timeout_ms,
      lastLatencyMs: latencyMs ?? d.last_latency_ms,
      lastCheckedAt: d.last_checked_at,
    },
    wol: {
      enabled: Boolean(d.mac_address),
      macAddress: (d.mac_address ?? '').toUpperCase(),
      broadcastAddress: d.wol_broadcast_address ?? '',
      port: d.wol_port ?? 9,
    },
    shutdown: {
      enabled: hasAgent,
      agentId: d.agent?.agent_id ?? '',
      agentPort: d.agent?.port ?? 9750,
      agentScheme: d.agent?.scheme ?? 'http',
      agentStatus: !hasAgent ? 'not_configured' : d.status === 'online' ? 'ready' : 'unreachable',
    },
    createdAt: d.created_at,
  };
}

/** Form data (UI model) → POST body. Optional blanks are omitted so server defaults apply. */
export function toDeviceCreate(f: Partial<Device>): DeviceCreate {
  const body: DeviceCreate = {
    name: (f.name ?? '').trim(),
    ip_address: (f.ip ?? '').trim(),
    monitor_port: f.monitoring?.port ?? 22,
  };
  if (f.description?.trim()) body.description = f.description.trim();
  if (f.type) body.device_type = f.type;
  if (f.os) body.os = f.os;
  if (f.monitoring) {
    body.monitor_interval_seconds = f.monitoring.intervalSeconds;
    body.monitor_timeout_ms = f.monitoring.timeoutMs;
    body.enabled = f.monitoring.enabled;
  }
  if (f.wol?.enabled && f.wol.macAddress.trim()) {
    body.mac_address = normalizeMac(f.wol.macAddress);
    if (f.wol.broadcastAddress.trim()) body.wol_broadcast_address = f.wol.broadcastAddress.trim();
    body.wol_port = f.wol.port;
  }
  if (f.shutdown?.enabled && f.shutdown.agentId.trim()) {
    body.agent = {
      agent_id: f.shutdown.agentId.trim(),
      port: f.shutdown.agentPort,
      scheme: f.shutdown.agentScheme,
    };
  }
  return body;
}

/**
 * Form data → PATCH body. Per the spec an empty string clears `description`, `mac_address` and
 * `wol_broadcast_address`; omitted fields are unchanged. The agent binding is removed with a
 * separate call (`removeDeviceAgent`), see `needsAgentRemoval`.
 */
export function toDeviceUpdate(f: Partial<Device>, prev: Device): DeviceUpdate {
  const body = toDeviceCreate(f) as DeviceUpdate;
  if (!f.wol?.enabled && prev.wol.enabled) body.mac_address = '';
  if (f.wol?.enabled && !f.wol.broadcastAddress.trim() && prev.wol.broadcastAddress) body.wol_broadcast_address = '';
  if (f.description !== undefined && !f.description.trim() && prev.description) body.description = '';
  return body;
}

/** True when the user switched remote shutdown off for a device that had a binding. */
export function needsAgentRemoval(f: Partial<Device>, prev: Device): boolean {
  return prev.shutdown.enabled && f.shutdown?.enabled === false;
}

export function normalizeMac(mac: string): string {
  const hex = mac.replace(/[^0-9a-fA-F]/g, '').toLowerCase();
  return hex.length === 12 ? hex.match(/../g)!.join(':') : mac.trim().toLowerCase();
}

// ---- commands → activity -------------------------------------------------------------------

const COMMAND_TITLE: Record<ApiCommand['type'], Record<ApiCommand['status'], string>> = {
  wake: {
    pending: 'Wake-on-LAN Queued',
    sent: 'Wake-on-LAN Packet Sent',
    acknowledged: 'Wake-on-LAN Acknowledged',
    completed: 'Wake-on-LAN Completed',
    failed: 'Wake-on-LAN Failed',
    timed_out: 'Wake-on-LAN Timed Out',
  },
  shutdown: {
    pending: 'Shutdown Queued',
    sent: 'Shutdown Sent to Agent',
    acknowledged: 'Shutdown Acknowledged by Agent',
    completed: 'Remote Shutdown Completed',
    failed: 'Remote Shutdown Failed',
    timed_out: 'Remote Shutdown Timed Out',
  },
};

export function commandToActivity(c: ApiCommand, deviceName?: string): ActivityEvent {
  const outcome: ActivityEvent['outcome'] =
    c.status === 'completed' ? 'success' : c.status === 'failed' ? 'error' : c.status === 'timed_out' ? 'warning' : 'info';
  const action = c.type === 'wake' ? 'wake' : 'shutdown';
  return {
    id: `cmd-${c.id}`,
    timestamp: c.completed_at ?? c.updated_at ?? c.created_at,
    category: c.type === 'wake' ? 'wol' : 'shutdown',
    deviceId: c.device_id,
    deviceName,
    title: COMMAND_TITLE[c.type][c.status],
    description:
      c.error ??
      (c.status === 'completed'
        ? c.type === 'wake'
          ? 'Device confirmed online by the monitor.'
          : 'Device confirmed offline by the monitor.'
        : `Command ${c.id} is ${c.status.replace('_', ' ')}.`),
    outcome,
    details: {
      endpoint: `/api/v1/devices/${c.device_id}/${action}`,
      method: 'POST',
      rawOutput: [`command_id=${c.id}`, `status=${c.status}`, c.error_code && `error_code=${c.error_code}`, c.error && `error=${c.error}`]
        .filter(Boolean)
        .join('\n'),
    },
  };
}

// ---- system --------------------------------------------------------------------------------

export function toSystemMetrics(m: ApiSystemMetrics): SystemMetrics {
  const [os = m.platform, arch = ''] = m.platform.split('/');
  return {
    collectedAt: m.collected_at,
    platform: m.platform,
    os,
    arch,
    hostname: m.hostname,
    uptimeSeconds: m.uptime_seconds,
    cpuPercent: m.cpu_percent,
    memoryUsedBytes: m.memory?.used_bytes,
    memoryTotalBytes: m.memory?.total_bytes,
    diskPath: m.disk?.path,
    diskUsedBytes: m.disk?.used_bytes,
    diskTotalBytes: m.disk?.total_bytes,
    localIps: m.local_ips ?? [],
    cpuCores: m.cpu_cores,
    loadAverage: m.load_average,
    kernel: m.kernel,
    restricted: m.restricted ?? [],
    isAndroidHost: os === 'android',
    process: {
      pid: m.process?.pid,
      uptimeSeconds: m.process?.uptime_seconds,
      rssBytes: m.process?.rss_bytes,
      goroutines: m.process?.goroutines,
      heapAllocBytes: m.process?.heap_alloc_bytes,
    },
  };
}

// ---- ddns ----------------------------------------------------------------------------------

export function toDDNSConfig(c: ApiDdnsConfig, updating = false): DDNSConfig {
  const state: DDNSState = updating
    ? 'updating'
    : !c.enabled
      ? 'disabled'
      : c.last_error && (!c.last_synced_at || (c.last_error_at ?? '') > c.last_synced_at)
        ? 'error'
        : c.last_synced_at
          ? 'synced'
          : 'never_synced';
  return {
    id: c.id,
    name: c.name,
    zoneId: c.zone_id,
    recordName: c.record_name,
    recordType: c.record_type,
    proxied: c.proxied,
    ttl: c.ttl,
    intervalSeconds: c.interval_seconds,
    enabled: c.enabled,
    hasApiToken: c.has_api_token,
    lastIp: c.last_ip,
    detectedIp: c.detected_ip,
    dnsValue: c.dns_value,
    lastCheckedAt: c.last_checked_at,
    lastSyncedAt: c.last_synced_at,
    lastError: c.last_error,
    lastErrorAt: c.last_error_at,
    status: state,
  };
}
