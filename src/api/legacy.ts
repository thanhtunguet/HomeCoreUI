/**
 * URLs of the legacy single-device API (`GET /api/turn-on`, `/api/turn-off`, `/api/is-online`),
 * for configuring old apps that predate multi-device support. Docs: ADR-017.
 */
import type { Device } from '../types';

export interface LegacyEndpoint {
  key: 'turnOn' | 'turnOff' | 'isOnline';
  label: string;
  /** What the old app receives. */
  hint: string;
  url: string;
}

/**
 * The value of the `device` query parameter: the device id when it is an integer (the old
 * numbering), otherwise the device name. Ids issued by the Controller are UUIDs, so in practice the
 * name is used; the Controller resolves a name case-insensitively.
 */
export const legacyDeviceRef = (device: Pick<Device, 'id' | 'name'>): string =>
  /^\d+$/.test(device.id) ? device.id : device.name;

/** The three endpoints of one device. `origin` is the Controller's base URL without a trailing slash. */
export const legacyEndpoints = (
  device: Pick<Device, 'id' | 'name'>,
  origin: string
): LegacyEndpoint[] => {
  const base = origin.replace(/\/+$/, '');
  const q = `?device=${encodeURIComponent(legacyDeviceRef(device))}`;
  return [
    { key: 'turnOn', label: 'Turn on', hint: 'Wake-on-LAN; answers true', url: `${base}/api/turn-on${q}` },
    { key: 'turnOff', label: 'Turn off', hint: 'Signed shutdown; answers true', url: `${base}/api/turn-off${q}` },
    { key: 'isOnline', label: 'Is online', hint: 'Answers true or false', url: `${base}/api/is-online${q}` }
  ];
};
