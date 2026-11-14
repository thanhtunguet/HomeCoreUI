/**
 * Spec contract: every function of `endpoints.ts` is named after an operationId of
 * `api/openapi.yaml` and must request exactly that operation's method and path. If the spec
 * renames, moves or drops an operation (or the UI calls something the spec does not have), this
 * fails, so drift cannot go unnoticed. Needs the spec file, not a running Controller.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { json, mockFetchAll, putSession, stubLocalStorage, tokenPair } from '../test/helpers';
import * as endpoints from './endpoints';

const SPEC_PATH = process.env.HOMECORE_SPEC
  ? path.resolve(process.env.HOMECORE_SPEC)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../api/openapi.yaml');

interface Operation {
  operationId: string;
  method: string;
  path: string;
  responses: Record<string, unknown>;
}

const METHODS = ['get', 'put', 'post', 'delete', 'patch'];

/** Parsed YAML: loosely typed on purpose, the assertions are the schema. */
let spec: any;
const ops = new Map<string, Operation>();

beforeAll(() => {
  if (!existsSync(SPEC_PATH)) {
    throw new Error(`OpenAPI spec not found at ${SPEC_PATH}. The UI is built inside the SmartHomeCore repository (frontend/); set HOMECORE_SPEC to point at api/openapi.yaml.`);
  }
  spec = parse(readFileSync(SPEC_PATH, 'utf8'));
  for (const [p, item] of Object.entries<Record<string, any>>(spec.paths)) {
    for (const m of METHODS) {
      const op = item[m];
      if (op?.operationId) ops.set(op.operationId, { operationId: op.operationId, method: m.toUpperCase(), path: p, responses: op.responses ?? {} });
    }
  }
});

/** `/api/v1/devices/{id}/wake` -> /^\/api\/v1\/devices\/[^/]+\/wake$/ */
const templateToRegExp = (tpl: string) => new RegExp(`^${tpl.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{[^}]+\}/g, '[^/]+')}$`);

/** Dummy arguments for every endpoint function. A new function without an entry fails the test. */
const ID = '0190c0de-0000-7000-8000-000000000001';
const calls: Record<string, () => Promise<unknown>> = {
  getHealthz: () => endpoints.getHealthz(),
  login: () => endpoints.login('u', 'p'),
  logout: () => endpoints.logout('refresh'),
  getCurrentUser: () => endpoints.getCurrentUser(),
  listDevices: () => endpoints.listDevices(),
  createDevice: () => endpoints.createDevice({ name: 'n', ip_address: '10.0.0.2', monitor_port: 22 }),
  updateDevice: () => endpoints.updateDevice(ID, { name: 'n' }),
  deleteDevice: () => endpoints.deleteDevice(ID),
  removeDeviceAgent: () => endpoints.removeDeviceAgent(ID),
  wakeDevice: () => endpoints.wakeDevice(ID),
  shutdownDevice: () => endpoints.shutdownDevice(ID),
  probeDevice: () => endpoints.probeDevice(ID),
  getDeviceHistory: () => endpoints.getDeviceHistory(ID),
  listCommands: () => endpoints.listCommands(),
  listActivity: () => endpoints.listActivity({ category: 'device', deviceId: ID }),
  getCommand: () => endpoints.getCommand(ID),
  getSystemMetrics: () => endpoints.getSystemMetrics(),
  getSystemInfo: () => endpoints.getSystemInfo(),
  getControllerKey: () => endpoints.getControllerKey(),
  listDdnsConfigs: () => endpoints.listDdnsConfigs(),
  createDdnsConfig: () =>
    endpoints.createDdnsConfig({ name: 'n', zone_id: 'z', record_id: 'r', record_name: 'h.example.com', record_type: 'A', api_token: 't' }),
  updateDdnsConfig: () => endpoints.updateDdnsConfig(ID, { enabled: false }),
  deleteDdnsConfig: () => endpoints.deleteDdnsConfig(ID),
  syncDdnsConfig: () => endpoints.syncDdnsConfig(ID),
  listCloudflareZones: () => endpoints.listCloudflareZones({ api_token: 't' }),
  listCloudflareRecords: () => endpoints.listCloudflareRecords('zone-1', { config_id: ID }),
};

let store: Map<string, string>;
beforeEach(() => {
  store = stubLocalStorage();
  putSession(store, { accessToken: 'tok', refreshToken: 'ref', expiresAt: Date.now() + 600_000 });
});

describe('endpoints.ts vs api/openapi.yaml', () => {
  it('has a dummy call for every exported endpoint function (and nothing stale)', () => {
    const exported = Object.entries(endpoints)
      .filter(([, v]) => typeof v === 'function')
      .map(([k]) => k)
      .sort();
    expect(Object.keys(calls).sort()).toEqual(exported);
  });

  it.each(Object.keys(calls))('%s is an operation of the spec and requests its method and path', async name => {
    const op = ops.get(name);
    expect(op, `operationId "${name}" is not in ${SPEC_PATH}`).toBeDefined();

    const { calls: recorded } = mockFetchAll(() => json({ items: [] }));
    await calls[name]();

    const first = recorded[0];
    expect(first.method, `${name}: method`).toBe(op!.method);
    expect(first.path, `${name}: path ${first.path} vs spec ${op!.path}`).toMatch(templateToRegExp(op!.path));
  });

  it('the client refresh call is the spec operation refreshToken', async () => {
    const op = ops.get('refreshToken');
    expect(op).toBeDefined();
    const { request } = await import('./client');
    putSession(store, { accessToken: 'old', refreshToken: 'ref', expiresAt: Date.now() + 1_000 }); // forces a refresh
    const { calls: recorded } = mockFetchAll(call => (call.path === op!.path ? json(tokenPair('n')) : json({ id: 'u', username: 'a' })));
    await request('/api/v1/auth/me');
    expect(recorded[0].method).toBe(op!.method);
    expect(recorded[0].path).toBe(op!.path);
  });
});

describe('spec facts the UI relies on', () => {
  it('has no roles: User carries id and username only', () => {
    expect(Object.keys(spec.components.schemas.User.properties).sort()).toEqual(['id', 'username']);
    expect(spec.components.schemas.Role).toBeUndefined();
  });

  it('wake and shutdown can answer 202, 409 and 429, and 429 documents Retry-After', () => {
    for (const id of ['wakeDevice', 'shutdownDevice']) {
      const codes = Object.keys(ops.get(id)!.responses);
      expect(codes, id).toEqual(expect.arrayContaining(['202', '409', '429']));
    }
    expect(spec.components.responses.TooManyRequests.headers['Retry-After']).toBeDefined();
  });

  it('agent status fields are read-only and optional', () => {
    const a = spec.components.schemas.AgentBinding;
    expect(a.required).toEqual(['agent_id', 'port']);
    for (const f of ['status', 'version', 'last_ok_at']) expect(a.properties[f].readOnly, f).toBe(true);
    expect(a.properties.status.enum).toEqual(['ready', 'unreachable', 'unknown']);
  });

  it('zone and record are picked from Cloudflare: record_id is required on create and on DdnsConfig', () => {
    expect(spec.components.schemas.DdnsConfigCreate.required).toEqual(expect.arrayContaining(['zone_id', 'record_id', 'record_name', 'record_type']));
    expect(spec.components.schemas.DdnsConfig.required).toContain('record_id');
    expect(spec.components.schemas.DdnsConfigUpdate.properties.record_id).toBeDefined();
  });

  it('listActivity filters are the ones the UI sends: device_id and category', () => {
    const params = spec.paths['/api/v1/activity'].get.parameters.map((x: { $ref?: string; name?: string }) => x.name ?? x.$ref);
    expect(params).toEqual(expect.arrayContaining(['device_id', 'category']));
    expect(spec.components.schemas.ActivityCategory.enum).toEqual(['auth', 'device', 'command', 'ddns', 'user', 'system']);
    expect(spec.components.schemas.ActivityItem.required).toEqual(['id', 'at', 'category', 'action', 'result', 'message']);
  });

  it('Cloudflare lookups take api_token or config_id', () => {
    expect(Object.keys(spec.components.schemas.CloudflareLookup.properties).sort()).toEqual(['api_token', 'config_id']);
  });
});
