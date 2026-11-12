/**
 * Wire types of the HomeCore Controller REST API.
 *
 * Hand-maintained mirror of `api/openapi.yaml` in the SmartHomeCore repository (the spec is the
 * source of truth). Keep field names exactly as on the wire (snake_case); the UI model lives in
 * `src/types` and is converted in `mappers.ts`.
 *
 * Last synced with openapi.yaml 0.1.0 (2026-11-12).
 */

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export interface Health {
  status: string;
  /** Server clock (RFC 3339). */
  time: string;
  version: string;
}

export type Role = 'admin' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  /** Access token lifetime in seconds. */
  expires_in: number;
}

export type ApiDeviceStatus = 'unknown' | 'online' | 'offline';
export type PowerTransition = 'none' | 'waking' | 'shutting_down';

export interface AgentBinding {
  agent_id: string;
  port: number;
  scheme?: 'http' | 'https';
}

export interface ApiDevice {
  id: string;
  name: string;
  description?: string;
  hostname?: string;
  ip_address: string;
  mac_address?: string;
  wol_broadcast_address?: string;
  wol_port?: number;
  monitor_port: number;
  monitor_interval_seconds: number;
  monitor_timeout_ms: number;
  enabled: boolean;
  status: ApiDeviceStatus;
  power_transition: PowerTransition;
  agent?: AgentBinding;
  last_seen_at?: string;
  last_checked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DeviceCreate {
  name: string;
  description?: string;
  hostname?: string;
  ip_address: string;
  mac_address?: string;
  wol_broadcast_address?: string;
  wol_port?: number;
  monitor_port: number;
  monitor_interval_seconds?: number;
  monitor_timeout_ms?: number;
  enabled?: boolean;
  agent?: AgentBinding;
}

export type DeviceUpdate = Partial<DeviceCreate>;

export interface Page<T> {
  items: T[];
  next_cursor?: string;
}

export interface StatusChange {
  status: ApiDeviceStatus;
  previous_status?: ApiDeviceStatus;
  changed_at: string;
  reason?: string;
}

export interface ProbeResult {
  device_id: string;
  reachable: boolean;
  latency_ms?: number;
  status: ApiDeviceStatus;
  checked_at: string;
  error?: string;
}

export type CommandType = 'wake' | 'shutdown';
export type CommandStatus = 'pending' | 'sent' | 'acknowledged' | 'completed' | 'failed' | 'timed_out';

export interface ApiCommand {
  id: string;
  device_id: string;
  type: CommandType;
  status: CommandStatus;
  requested_by?: string;
  error_code?: string;
  error?: string;
  deadline_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiSystemMetrics {
  collected_at: string;
  /** e.g. `linux/arm64` */
  platform: string;
  hostname?: string;
  uptime_seconds?: number;
  cpu_percent?: number;
  memory?: { total_bytes?: number; available_bytes?: number; used_bytes?: number };
  disk?: { path?: string; total_bytes?: number; free_bytes?: number; used_bytes?: number };
  local_ips?: string[];
  process?: { rss_bytes?: number; goroutines?: number; heap_alloc_bytes?: number };
}

export interface ControllerKey {
  key_id: string;
  algorithm: 'ed25519';
  /** Standard base64 of the 32-byte public key. */
  public_key: string;
}

export type DnsRecordType = 'A' | 'AAAA';

export interface ApiDdnsConfig {
  id: string;
  name: string;
  zone_id: string;
  record_name: string;
  record_type: DnsRecordType;
  proxied: boolean;
  /** 1 = automatic */
  ttl: number;
  interval_seconds: number;
  enabled: boolean;
  has_api_token: boolean;
  last_ip?: string;
  last_synced_at?: string;
  last_error?: string;
  last_error_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DdnsConfigCreate {
  name: string;
  zone_id: string;
  record_name: string;
  record_type: DnsRecordType;
  proxied?: boolean;
  ttl?: number;
  interval_seconds?: number;
  enabled?: boolean;
  /** Write-only. */
  api_token: string;
}

export type DdnsConfigUpdate = Partial<DdnsConfigCreate>;

export interface DdnsSyncResult {
  config_id: string;
  result: 'updated' | 'unchanged' | 'failed';
  ip?: string;
  error?: string;
  synced_at: string;
}
