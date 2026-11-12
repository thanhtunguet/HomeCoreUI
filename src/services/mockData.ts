import { Device, DDNSConfig, CloudflareZone, CloudflareRecordOption, ActivityEvent, SystemMetrics, AppSettings } from '../types';

export const initialDevices: Device[] = [
  {
    id: 'dev-01',
    name: 'Workstation Rig (Win11)',
    description: 'Custom desktop PC for CAD, rendering & gaming',
    type: 'desktop',
    os: 'windows',
    ip: '192.168.1.110',
    mac: '00:D8:61:4B:92:01',
    status: 'online',
    lastSeen: 'Just now',
    monitoring: {
      enabled: true,
      port: 3389,
      protocolPreset: 'RDP',
      intervalSeconds: 30,
      timeoutMs: 1500,
      lastLatencyMs: 4,
      lastCheckedAt: new Date(Date.now() - 1000 * 18).toISOString(),
      consecutiveFailures: 0
    },
    wol: {
      enabled: true,
      macAddress: '00:D8:61:4B:92:01',
      broadcastAddress: '192.168.1.255',
      port: 9
    },
    shutdown: {
      enabled: true,
      agentHost: '192.168.1.110',
      agentPort: 8080,
      authConfigured: true,
      agentStatus: 'ready',
      agentVersion: 'v1.4.2 (x86_64)'
    },
    createdAt: '2026-01-10T14:22:00Z'
  },
  {
    id: 'dev-02',
    name: 'Vault NAS (TrueNAS Core)',
    description: 'Storage pool & backup server (RAID-Z2 40TB)',
    type: 'nas',
    os: 'linux',
    ip: '192.168.1.10',
    mac: 'D4:5D:64:82:1A:3F',
    status: 'online',
    lastSeen: 'Just now',
    monitoring: {
      enabled: true,
      port: 22,
      protocolPreset: 'SSH',
      intervalSeconds: 15,
      timeoutMs: 1000,
      lastLatencyMs: 1,
      lastCheckedAt: new Date(Date.now() - 1000 * 5).toISOString(),
      consecutiveFailures: 0
    },
    wol: {
      enabled: true,
      macAddress: 'D4:5D:64:82:1A:3F',
      broadcastAddress: '192.168.1.255',
      port: 9
    },
    shutdown: {
      enabled: true,
      agentHost: '192.168.1.10',
      agentPort: 8080,
      authConfigured: true,
      agentStatus: 'ready',
      agentVersion: 'v1.4.2 (linux-amd64)'
    },
    createdAt: '2025-11-04T09:15:00Z'
  },
  {
    id: 'dev-03',
    name: 'Living Room Media HTPC',
    description: 'Mini PC connected to receiver & projector',
    type: 'desktop',
    os: 'linux',
    ip: '192.168.1.120',
    mac: 'B8:27:EB:4A:11:82',
    status: 'offline',
    lastSeen: '4 hours ago',
    monitoring: {
      enabled: true,
      port: 22,
      protocolPreset: 'SSH',
      intervalSeconds: 60,
      timeoutMs: 2000,
      lastLatencyMs: undefined,
      lastCheckedAt: new Date(Date.now() - 1000 * 35).toISOString(),
      consecutiveFailures: 4
    },
    wol: {
      enabled: true,
      macAddress: 'B8:27:EB:4A:11:82',
      broadcastAddress: '192.168.1.255',
      port: 9
    },
    shutdown: {
      enabled: true,
      agentHost: '192.168.1.120',
      agentPort: 8080,
      authConfigured: true,
      agentStatus: 'unreachable',
      agentVersion: 'v1.4.2'
    },
    createdAt: '2026-02-14T20:10:00Z'
  },
  {
    id: 'dev-04',
    name: 'Home Assistant Green',
    description: 'Zigbee coordinator & home automation core',
    type: 'iot',
    os: 'linux',
    ip: '192.168.1.15',
    mac: 'DC:A6:32:98:2C:19',
    status: 'online',
    lastSeen: 'Just now',
    monitoring: {
      enabled: true,
      port: 80,
      protocolPreset: 'HTTP',
      intervalSeconds: 30,
      timeoutMs: 1500,
      lastLatencyMs: 3,
      lastCheckedAt: new Date(Date.now() - 1000 * 12).toISOString(),
      consecutiveFailures: 0
    },
    wol: {
      enabled: false,
      macAddress: 'DC:A6:32:98:2C:19',
      broadcastAddress: '192.168.1.255',
      port: 9
    },
    shutdown: {
      enabled: false,
      agentHost: '',
      agentPort: 8080,
      authConfigured: false,
      agentStatus: 'not_configured'
    },
    createdAt: '2025-10-01T11:00:00Z'
  },
  {
    id: 'dev-05',
    name: 'MacBook Pro M2 (Studio)',
    description: 'Work laptop on desktop dock',
    type: 'laptop',
    os: 'macos',
    ip: '192.168.1.145',
    mac: '3C:06:30:19:B4:72',
    status: 'offline',
    lastSeen: '12 hours ago',
    monitoring: {
      enabled: true,
      port: 22,
      protocolPreset: 'SSH',
      intervalSeconds: 120,
      timeoutMs: 2000,
      lastLatencyMs: undefined,
      lastCheckedAt: new Date(Date.now() - 1000 * 90).toISOString(),
      consecutiveFailures: 2
    },
    wol: {
      enabled: true,
      macAddress: '3C:06:30:19:B4:72',
      broadcastAddress: '192.168.1.255',
      port: 9
    },
    shutdown: {
      enabled: false,
      agentHost: '',
      agentPort: 8080,
      authConfigured: false,
      agentStatus: 'not_configured'
    },
    createdAt: '2026-03-01T18:40:00Z'
  },
  {
    id: 'dev-06',
    name: 'Living Room OLED TV (C3)',
    description: 'LG webOS Smart TV',
    type: 'tv',
    os: 'embedded',
    ip: '192.168.1.180',
    mac: 'A4:77:33:DE:52:6A',
    status: 'online',
    lastSeen: '1 min ago',
    monitoring: {
      enabled: true,
      port: 80,
      protocolPreset: 'HTTP',
      intervalSeconds: 60,
      timeoutMs: 2000,
      lastLatencyMs: 14,
      lastCheckedAt: new Date(Date.now() - 1000 * 45).toISOString(),
      consecutiveFailures: 0
    },
    wol: {
      enabled: true,
      macAddress: 'A4:77:33:DE:52:6A',
      broadcastAddress: '192.168.1.255',
      port: 9
    },
    shutdown: {
      enabled: false,
      agentHost: '',
      agentPort: 8080,
      authConfigured: false,
      agentStatus: 'not_configured'
    },
    createdAt: '2026-01-20T16:00:00Z'
  }
];

export const initialCloudflareZones: CloudflareZone[] = [
  { id: 'zone-01', name: 'homecore-network.dev', status: 'active' },
  { id: 'zone-02', name: 'alexsmith.dev', status: 'active' },
  { id: 'zone-03', name: 'homelab-internal.org', status: 'active' }
];

export const initialCloudflareRecords: CloudflareRecordOption[] = [
  { id: 'rec-01', zoneId: 'zone-01', name: 'core.homecore-network.dev', type: 'A', content: '203.0.113.88', proxied: true },
  { id: 'rec-02', zoneId: 'zone-01', name: 'home.homecore-network.dev', type: 'A', content: '203.0.113.88', proxied: true },
  { id: 'rec-03', zoneId: 'zone-01', name: 'gateway.homecore-network.dev', type: 'A', content: '203.0.113.88', proxied: false },
  { id: 'rec-04', zoneId: 'zone-02', name: 'home.alexsmith.dev', type: 'A', content: '203.0.113.88', proxied: true },
  { id: 'rec-05', zoneId: 'zone-02', name: 'vpn.alexsmith.dev', type: 'A', content: '203.0.113.88', proxied: false },
  { id: 'rec-06', zoneId: 'zone-03', name: 'remote.homelab-internal.org', type: 'A', content: '203.0.113.88', proxied: false }
];

export const initialDDNSConfig: DDNSConfig = {
  provider: 'cloudflare',
  apiTokenMasked: 'c7••••••••••••••••••••••••••••9e1a',
  tokenConfigured: true,
  selectedZoneId: 'zone-01',
  selectedZoneName: 'homecore-network.dev',
  selectedRecordId: 'rec-01',
  selectedRecordName: 'core.homecore-network.dev',
  recordType: 'A',
  proxied: true,
  currentDnsValue: '203.0.113.88',
  currentIpv4: '203.0.113.88',
  currentIpv6: '2400:cb00:2048:1::c629:d7a2',
  syncIntervalMinutes: 10,
  autoSyncEnabled: true,
  lastCheckTime: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  lastSyncTime: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  status: 'synced',
  lastSyncMessage: 'DNS record value matches current WAN IP (203.0.113.88)'
};

export const initialActivities: ActivityEvent[] = [
  {
    id: 'act-01',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    category: 'ddns',
    title: 'Cloudflare DDNS Sync Completed',
    description: 'Verified alias record core.homecore-network.dev matching public IP 203.0.113.88.',
    outcome: 'success',
    details: {
      endpoint: '/api/v1/ddns/sync',
      method: 'POST',
      latencyMs: 382,
      responseCode: 200,
      requestPayload: { force: false, zoneId: 'e89c10447fae322199bca2b0' },
      rawOutput: 'OK: 4 records verified matching current WAN IP (latency 382ms)'
    }
  },
  {
    id: 'act-02',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    category: 'device',
    deviceId: 'dev-01',
    deviceName: 'Workstation Rig (Win11)',
    title: 'TCP Health Probe Passed',
    description: 'Probe to 192.168.1.110:3389 (RDP) succeeded in 4ms.',
    outcome: 'success',
    details: {
      endpoint: '/api/v1/devices/dev-01/probe',
      method: 'POST',
      latencyMs: 4,
      responseCode: 200,
      rawOutput: 'TCP_SYN_ACK received within 4.12ms'
    }
  },
  {
    id: 'act-03',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    category: 'device',
    deviceId: 'dev-03',
    deviceName: 'Living Room Media HTPC',
    title: 'Device Transitioned Offline',
    description: '3 consecutive TCP probes to port 22 timed out after 2000ms.',
    outcome: 'warning',
    details: {
      endpoint: '/api/v1/monitoring/event',
      method: 'POST',
      responseCode: 200,
      rawOutput: 'STATUS_CHANGED: online -> offline (target: 192.168.1.120:22)'
    }
  },
  {
    id: 'act-04',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    category: 'wol',
    deviceId: 'dev-01',
    deviceName: 'Workstation Rig (Win11)',
    title: 'Wake-on-LAN Packet Dispatched',
    description: 'Magic packet delivered via UDP broadcast 192.168.1.255:9 to MAC 00:D8:61:4B:92:01.',
    outcome: 'success',
    details: {
      endpoint: '/api/v1/devices/dev-01/wol',
      method: 'POST',
      latencyMs: 12,
      responseCode: 202,
      requestPayload: { mac: '00:D8:61:4B:92:01', broadcast: '192.168.1.255', port: 9 },
      rawOutput: 'UDP broadcast sent (102 bytes) -> target verified online 42s later'
    }
  },
  {
    id: 'act-05',
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(),
    category: 'shutdown',
    deviceId: 'dev-03',
    deviceName: 'Living Room Media HTPC',
    title: 'Remote Shutdown Executed',
    description: 'HomeCore Agent acknowledged shutdown command. Host initiated graceful poweroff.',
    outcome: 'success',
    details: {
      endpoint: '/api/v1/devices/dev-03/shutdown',
      method: 'POST',
      latencyMs: 65,
      responseCode: 200,
      requestPayload: { targetHost: '192.168.1.120', port: 8080, force: false },
      rawOutput: 'AGENT_ACK: "Initiating system poweroff sequence (exit code 0)"'
    }
  },
  {
    id: 'act-06',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    category: 'system',
    title: 'HomeCore Server Started',
    description: 'Go runtime initialized on Linux 5.15.0-arm64 (Android TV Box Host).',
    outcome: 'info',
    details: {
      endpoint: '/api/v1/system/bootstrap',
      method: 'GET',
      responseCode: 200,
      rawOutput: 'HomeCore v1.4.2 started on 0.0.0.0:3000 (Go 1.23.2, 8 goroutines)'
    }
  }
];

export const initialSystemMetrics: SystemMetrics = {
  host: {
    os: 'Linux (Armbian / Android TV Box)',
    arch: 'aarch64 (ARMv8-A Quad-Core)',
    hostname: 'homecore-node1',
    kernel: '5.15.0-aml-arm64 #1 SMP PREEMPT',
    uptimeSeconds: 345600, // 4 days
    cpuUsagePercent: 14.8,
    cpuCores: 4,
    memoryUsedBytes: 1288490188, // ~1.2 GB
    memoryTotalBytes: 3979837440, // ~3.7 GB (4GB Box)
    diskUsedBytes: 18454937600, // ~17.2 GB
    diskTotalBytes: 62454937600, // ~58 GB eMMC
    isAndroidHost: true,
    restrictedMetrics: ['hardware_thermal_zone_4', 'selinux_audit_sysfs'],
    networkInterfaces: [
      {
        name: 'eth0',
        ip: '192.168.1.2',
        mac: '00:1A:79:AB:02:44',
        rxBytes: 8493021142,
        txBytes: 4210492810,
        isDefault: true
      },
      {
        name: 'wlan0',
        ip: '192.168.1.3',
        mac: '00:1A:79:AB:02:45',
        rxBytes: 2049102,
        txBytes: 849201,
        isDefault: false
      },
      {
        name: 'tailscale0',
        ip: '100.84.12.9',
        mac: '00:00:00:00:00:00',
        rxBytes: 492049182,
        txBytes: 194820194,
        isDefault: false
      }
    ]
  },
  process: {
    version: 'HomeCore v1.4.2 (go1.23.2 linux/arm64)',
    pid: 1422,
    uptimeSeconds: 345600,
    memoryRssBytes: 38797312, // ~37 MB RSS! Very lightweight
    goroutines: 12,
    heapAllocBytes: 18432000 // ~17.5 MB
  }
};

export const initialAppSettings: AppSettings = {
  general: {
    serverName: 'HomeCore Gateway',
    language: 'English (US)',
    theme: 'dark',
    timezone: 'America/Los_Angeles (UTC-8)'
  },
  network: {
    httpPort: 3000,
    bindAddress: '0.0.0.0',
    allowSubnets: ['192.168.1.0/24', '100.64.0.0/10'],
    localIp: '192.168.1.2'
  },
  monitoring: {
    defaultIntervalSec: 30,
    defaultTimeoutMs: 1500,
    maxRetries: 3
  },
  security: {
    username: 'admin',
    sessionTimeoutMinutes: 1440,
    agentSecretTokenMasked: 'hc_sec_••••••••••••••••94b7',
    trustedControllers: ['192.168.1.0/24', '100.84.12.0/24']
  },
  developer: {
    apiDocsUrl: '/api/docs',
    version: '1.4.2-static',
    debugLogging: false,
    simulateAndroidHost: true
  }
};
