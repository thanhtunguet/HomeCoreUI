export type DeviceType = 'desktop' | 'server' | 'laptop' | 'tv' | 'nas' | 'iot' | 'router';

export type OperatingSystem = 'windows' | 'linux' | 'macos' | 'android' | 'freebsd' | 'embedded';

export type DeviceStatus = 'online' | 'offline' | 'unknown';

export interface DeviceMonitoring {
  enabled: boolean;
  port: number;
  protocolPreset: 'SSH' | 'RDP' | 'HTTP' | 'HTTPS' | 'CUSTOM';
  intervalSeconds: number;
  timeoutMs: number;
  lastLatencyMs?: number;
  lastCheckedAt?: string;
  consecutiveFailures?: number;
}

export interface DeviceWOL {
  enabled: boolean;
  macAddress: string;
  broadcastAddress: string;
  port: number; // default 9
}

export interface DeviceShutdown {
  enabled: boolean;
  agentHost: string;
  agentPort: number;
  authConfigured: boolean;
  agentStatus: 'ready' | 'unreachable' | 'not_configured';
  agentVersion?: string;
}

export interface Device {
  id: string;
  name: string;
  description: string;
  type: DeviceType;
  os: OperatingSystem;
  ip: string;
  mac: string;
  status: DeviceStatus;
  lastSeen: string;
  monitoring: DeviceMonitoring;
  wol: DeviceWOL;
  shutdown: DeviceShutdown;
  createdAt: string;
}

export interface CloudflareZone {
  id: string;
  name: string;
  status: 'active' | 'pending';
}

export interface CloudflareRecordOption {
  id: string;
  zoneId: string;
  name: string;
  type: 'A' | 'AAAA';
  content: string;
  proxied: boolean;
}

export interface DDNSConfig {
  provider: 'cloudflare';
  apiTokenMasked: string;
  tokenConfigured: boolean;
  selectedZoneId: string;
  selectedZoneName: string;
  selectedRecordId: string;
  selectedRecordName: string;
  recordType: 'A' | 'AAAA';
  proxied: boolean;
  currentDnsValue: string;
  currentIpv4: string;
  currentIpv6?: string;
  syncIntervalMinutes: number;
  autoSyncEnabled: boolean;
  lastCheckTime: string;
  lastSyncTime: string;
  status: 'synced' | 'mismatch' | 'updating' | 'error';
  lastSyncMessage?: string;
}

export type ActivityCategory = 'device' | 'wol' | 'shutdown' | 'ddns' | 'auth' | 'system';
export type ActivityOutcome = 'success' | 'warning' | 'error' | 'info';

export interface ActivityEvent {
  id: string;
  timestamp: string;
  category: ActivityCategory;
  deviceId?: string;
  deviceName?: string;
  title: string;
  description: string;
  outcome: ActivityOutcome;
  details?: {
    endpoint?: string;
    method?: string;
    requestPayload?: Record<string, unknown>;
    responseCode?: number;
    latencyMs?: number;
    rawOutput?: string;
  };
}

export interface NetworkInterface {
  name: string;
  ip: string;
  mac: string;
  rxBytes: number;
  txBytes: number;
  isDefault?: boolean;
}

export interface HostMetrics {
  os: string;
  arch: string;
  hostname: string;
  kernel: string;
  uptimeSeconds: number;
  cpuUsagePercent: number;
  cpuCores: number;
  memoryUsedBytes: number;
  memoryTotalBytes: number;
  diskUsedBytes: number;
  diskTotalBytes: number;
  networkInterfaces: NetworkInterface[];
  isAndroidHost: boolean;
  restrictedMetrics?: string[];
}

export interface ProcessMetrics {
  version: string;
  pid: number;
  uptimeSeconds: number;
  memoryRssBytes: number;
  goroutines: number;
  heapAllocBytes: number;
}

export interface SystemMetrics {
  host: HostMetrics;
  process: ProcessMetrics;
}

export interface AppSettings {
  general: {
    serverName: string;
    language: string;
    theme: 'dark' | 'light' | 'system';
    timezone: string;
  };
  network: {
    httpPort: number;
    bindAddress: string;
    allowSubnets: string[];
    localIp: string;
  };
  monitoring: {
    defaultIntervalSec: number;
    defaultTimeoutMs: number;
    maxRetries: number;
  };
  security: {
    username: string;
    sessionTimeoutMinutes: number;
    agentSecretTokenMasked: string;
    trustedControllers: string[];
  };
  developer: {
    apiDocsUrl: string;
    version: string;
    debugLogging: boolean;
    simulateAndroidHost: boolean;
  };
}

export type WakeFlowStep = 
  | 'idle' 
  | 'generating' 
  | 'transmitting' 
  | 'probing' 
  | 'online_confirmed' 
  | 'packet_sent_probing_timeout' 
  | 'failed';

export interface WakeFlowState {
  active: boolean;
  deviceId: string | null;
  deviceName: string;
  step: WakeFlowStep;
  message: string;
  progressPercent: number;
  logs: string[];
}

export type ShutdownFlowStep =
  | 'idle'
  | 'confirming'
  | 'connecting'
  | 'authenticating'
  | 'acknowledged'
  | 'waiting_offline'
  | 'offline_verified'
  | 'failed';

export interface ShutdownFlowState {
  active: boolean;
  deviceId: string | null;
  deviceName: string;
  step: ShutdownFlowStep;
  message: string;
  progressPercent: number;
  logs: string[];
}
