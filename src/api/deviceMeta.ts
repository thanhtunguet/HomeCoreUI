/**
 * UI-only device metadata (icon type and OS) that the Controller does not model.
 *
 * Stored per browser in localStorage, keyed by device id, so it is NOT shared between browsers or
 * users. This is a known gap: see docs/reports/frontend-api-integration.md (GAP-DEV-01).
 */
import type { DeviceType, OperatingSystem } from '../types';

export interface DeviceMeta {
  type: DeviceType;
  os: OperatingSystem;
}

const KEY = 'homecore_device_meta_v1';
export const DEFAULT_META: DeviceMeta = { type: 'desktop', os: 'linux' };

function readAll(): Record<string, DeviceMeta> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, DeviceMeta>;
  } catch {
    return {};
  }
}

export function getDeviceMeta(id: string): DeviceMeta {
  return readAll()[id] ?? DEFAULT_META;
}

export function setDeviceMeta(id: string, meta: DeviceMeta): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [id]: meta }));
  } catch {
    /* storage unavailable: falls back to defaults */
  }
}

export function removeDeviceMeta(id: string): void {
  const all = readAll();
  delete all[id];
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}
