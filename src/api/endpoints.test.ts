import { beforeEach, describe, expect, it } from 'vitest';
import { json, mockFetch, mockFetchAll, putSession, stubLocalStorage } from '../test/helpers';
import { createDevice, getDeviceHistory, listCloudflareRecords, listCloudflareZones, listCommands, listDevices, removeDeviceAgent } from './endpoints';

const dev = (id: string, name: string) => ({ id, name });

beforeEach(() => {
  const store = stubLocalStorage();
  putSession(store, { accessToken: 'tok', refreshToken: 'ref', expiresAt: Date.now() + 600_000 });
});

describe('cursor pagination', () => {
  it('follows next_cursor until it is absent and keeps the server order', async () => {
    const { calls } = mockFetch(
      json({ items: [dev('1', 'alpha'), dev('2', 'Bravo')], next_cursor: 'c1' }),
      json({ items: [dev('3', 'charlie')], next_cursor: 'c2' }),
      json({ items: [dev('4', 'delta')] }),
    );

    const all = await listDevices();

    expect(all.map(d => d.id)).toEqual(['1', '2', '3', '4']); // concatenated in page order, not re-sorted
    expect(calls).toHaveLength(3);
    expect(calls[0].query.get('limit')).toBe('200'); // spec maximum
    expect(calls[0].query.has('cursor')).toBe(false);
    expect(calls[1].query.get('cursor')).toBe('c1');
    expect(calls[2].query.get('cursor')).toBe('c2');
  });

  it('stops after one page when there is no next_cursor', async () => {
    const { calls } = mockFetch(json({ items: [dev('1', 'a')] }));
    await listDevices();
    expect(calls).toHaveLength(1);
  });

  it('stops following once `max` items are collected and trims to max', async () => {
    const cmd = (id: string) => ({ id, device_id: 'd', type: 'wake', status: 'completed' });
    const { calls } = mockFetch(
      json({ items: [cmd('1'), cmd('2')], next_cursor: 'c1' }),
      json({ items: [cmd('3'), cmd('4')], next_cursor: 'c2' }),
    );
    const out = await listCommands({ max: 3, deviceId: 'dev-1', status: 'failed' });
    expect(out.map(c => c.id)).toEqual(['1', '2', '3']);
    expect(calls).toHaveLength(2);
    expect(calls[0].query.get('device_id')).toBe('dev-1');
    expect(calls[0].query.get('status')).toBe('failed');
  });

  it('gives up on a cursor loop after 50 pages', async () => {
    const { calls } = mockFetchAll(() => json({ items: [dev('x', 'x')], next_cursor: 'again' }));
    const all = await listDevices();
    expect(calls).toHaveLength(50);
    expect(all).toHaveLength(50);
  });

  it('history respects its own max', async () => {
    mockFetch(json({ items: [{ status: 'online', changed_at: 't1' }, { status: 'offline', changed_at: 't2' }], next_cursor: 'c' }));
    expect(await getDeviceHistory('d1', 1)).toHaveLength(1);
  });
});

describe('request shapes', () => {
  it('removeDeviceAgent is DELETE /devices/{id}/agent', async () => {
    const { calls } = mockFetch(new Response(null, { status: 204 }));
    await removeDeviceAgent('d1');
    expect(`${calls[0].method} ${calls[0].path}`).toBe('DELETE /api/v1/devices/d1/agent');
  });

  it('createDevice posts the body unchanged', async () => {
    const { calls } = mockFetch(json({ id: 'd1' }, { status: 201 }));
    await createDevice({ name: 'NAS', ip_address: '10.0.0.2', monitor_port: 22 });
    expect(calls[0].body).toEqual({ name: 'NAS', ip_address: '10.0.0.2', monitor_port: 22 });
  });

  it('Cloudflare lookups POST the credentials in the body (never the URL) and unwrap items', async () => {
    const { calls } = mockFetch(
      json({ items: [{ id: 'z1', name: 'example.com' }] }),
      json({ items: [{ id: 'r1', name: 'home.example.com', type: 'A', content: '1.2.3.4', proxied: false, ttl: 1 }] }),
    );

    const zones = await listCloudflareZones({ api_token: 'secret-token' });
    const records = await listCloudflareRecords('zone/1', { config_id: 'cfg-1' });

    expect(zones).toEqual([{ id: 'z1', name: 'example.com' }]);
    expect(records[0].content).toBe('1.2.3.4');
    expect(calls[0]).toMatchObject({ method: 'POST', path: '/api/v1/ddns/cloudflare/zones', body: { api_token: 'secret-token' } });
    expect(calls[1]).toMatchObject({ method: 'POST', path: '/api/v1/ddns/cloudflare/zones/zone%2F1/records', body: { config_id: 'cfg-1' } });
    expect(calls.every(c => !c.url.includes('secret-token'))).toBe(true);
  });
});
