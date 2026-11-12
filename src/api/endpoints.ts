/** One function per operationId of api/openapi.yaml. */
import { request } from './client';
import type {
  AgentBinding,
  ApiCommand,
  ApiDdnsConfig,
  ApiDevice,
  ApiSystemMetrics,
  CommandStatus,
  ControllerKey,
  DdnsConfigCreate,
  DdnsConfigUpdate,
  DdnsSyncResult,
  DeviceCreate,
  DeviceUpdate,
  Health,
  Page,
  ProbeResult,
  StatusChange,
  TokenPair,
  User,
} from './schema';

export type { AgentBinding };

const PAGE_LIMIT = 200; // spec maximum
const MAX_PAGES = 50; // safety net against a cursor loop

/** Follow `next_cursor` until exhausted (or `max` items collected). */
async function collect<T>(path: string, query: Record<string, string | number | undefined> = {}, max = Infinity): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | undefined;
  for (let i = 0; i < MAX_PAGES; i++) {
    const page = await request<Page<T>>(path, { query: { ...query, limit: PAGE_LIMIT, cursor } });
    all.push(...page.items);
    cursor = page.next_cursor;
    if (!cursor || all.length >= max) break;
  }
  return all.slice(0, max);
}

// health (public)
export const getHealthz = () => request<Health>('/healthz', { anonymous: true });

// auth
export const login = (username: string, password: string) =>
  request<TokenPair>('/api/v1/auth/login', { method: 'POST', body: { username, password }, anonymous: true });
export const logout = (refreshToken: string) =>
  request<void>('/api/v1/auth/logout', { method: 'POST', body: { refresh_token: refreshToken } });
export const getCurrentUser = () => request<User>('/api/v1/auth/me');

// devices
export const listDevices = () => collect<ApiDevice>('/api/v1/devices');
export const createDevice = (body: DeviceCreate) => request<ApiDevice>('/api/v1/devices', { method: 'POST', body });
export const updateDevice = (id: string, body: DeviceUpdate) =>
  request<ApiDevice>(`/api/v1/devices/${id}`, { method: 'PATCH', body });
export const deleteDevice = (id: string) => request<void>(`/api/v1/devices/${id}`, { method: 'DELETE' });
export const wakeDevice = (id: string) => request<ApiCommand>(`/api/v1/devices/${id}/wake`, { method: 'POST' });
export const shutdownDevice = (id: string) => request<ApiCommand>(`/api/v1/devices/${id}/shutdown`, { method: 'POST' });
export const probeDevice = (id: string) => request<ProbeResult>(`/api/v1/devices/${id}/probe`, { method: 'POST' });
export const getDeviceHistory = (id: string, max = 50) => collect<StatusChange>(`/api/v1/devices/${id}/history`, {}, max);

// commands
export const listCommands = (opts: { deviceId?: string; status?: CommandStatus; max?: number } = {}) =>
  collect<ApiCommand>('/api/v1/commands', { device_id: opts.deviceId, status: opts.status }, opts.max ?? 100);
export const getCommand = (id: string) => request<ApiCommand>(`/api/v1/commands/${id}`);

// system
export const getSystemMetrics = () => request<ApiSystemMetrics>('/api/v1/system/metrics');
export const getControllerKey = () => request<ControllerKey>('/api/v1/system/controller-key');

// ddns (admin only)
export const listDdnsConfigs = () => request<{ items: ApiDdnsConfig[] }>('/api/v1/ddns').then(r => r.items);
export const createDdnsConfig = (body: DdnsConfigCreate) => request<ApiDdnsConfig>('/api/v1/ddns', { method: 'POST', body });
export const updateDdnsConfig = (id: string, body: DdnsConfigUpdate) =>
  request<ApiDdnsConfig>(`/api/v1/ddns/${id}`, { method: 'PATCH', body });
export const deleteDdnsConfig = (id: string) => request<void>(`/api/v1/ddns/${id}`, { method: 'DELETE' });
export const syncDdnsConfig = (id: string) => request<DdnsSyncResult>(`/api/v1/ddns/${id}/sync`, { method: 'POST' });
