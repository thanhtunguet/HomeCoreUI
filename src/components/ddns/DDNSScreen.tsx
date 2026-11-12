import React, { useEffect, useState } from 'react';
import { useApp, DDNSDraft } from '../../context/AppContext';
import { CustomSelect } from '../common/CustomSelect';
import { DDNSConfig } from '../../types';
import {
  Globe,
  RefreshCw,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Sliders,
  Check,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';

const inputCls =
  'w-full font-mono px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs focus:border-emerald-500 focus:outline-hidden';
const cardCls = 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4';

const INTERVALS = [
  { value: '60', label: 'Every 1 minute' },
  { value: '300', label: 'Every 5 minutes (Default)' },
  { value: '600', label: 'Every 10 minutes' },
  { value: '900', label: 'Every 15 minutes' },
  { value: '1800', label: 'Every 30 minutes' },
  { value: '3600', label: 'Every 1 hour' }
];

const emptyDraft = (): DDNSDraft => ({
  name: '',
  zone_id: '',
  record_name: '',
  record_type: 'A',
  proxied: false,
  ttl: 1,
  interval_seconds: 300,
  enabled: true,
  api_token: ''
});

const fromConfig = (c: DDNSConfig): DDNSDraft => ({
  name: c.name,
  zone_id: c.zoneId,
  record_name: c.recordName,
  record_type: c.recordType,
  proxied: c.proxied,
  ttl: c.ttl,
  interval_seconds: c.intervalSeconds,
  enabled: c.enabled,
  api_token: ''
});

export const DDNSScreen: React.FC = () => {
  const { ddnsConfigs, ddnsConfig, setActiveDdnsId, triggerDDNSSync, saveDdns, deleteDdns, canManage } = useApp();

  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<DDNSDraft>(emptyDraft());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // (Re)load the form when the selected record changes or "new" is toggled.
  useEffect(() => {
    setDraft(creating || !ddnsConfig ? emptyDraft() : fromConfig(ddnsConfig));
    setError(null);
  }, [creating, ddnsConfig?.id]); // not on every poll: that would wipe edits in progress

  if (!canManage) {
    return (
      <div className="max-w-5xl mx-auto p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
        <AlertCircle size={14} />
        <span>Cloudflare DDNS settings contain credentials and are available to administrators only.</span>
      </div>
    );
  }

  const isNew = creating || !ddnsConfig;
  const set = <K extends keyof DDNSDraft>(k: K, v: DDNSDraft[K]) => setDraft(d => ({ ...d, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const err = await saveDdns(isNew ? null : ddnsConfig!.id, {
      ...draft,
      name: draft.name.trim(),
      zone_id: draft.zone_id.trim(),
      record_name: draft.record_name.trim()
    });
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    setCreating(false);
    set('api_token', '');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDelete = async () => {
    if (!ddnsConfig || !window.confirm(`Stop updating ${ddnsConfig.recordName}? The DNS record itself is not deleted.`)) return;
    const err = await deleteDdns(ddnsConfig.id);
    if (err) setError(err);
  };

  const statusLine = (c: DDNSConfig) => {
    switch (c.status) {
      case 'updating':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500">
            <RefreshCw size={13} className="animate-spin" />
            <span>Updating Cloudflare...</span>
          </span>
        );
      case 'synced':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={15} />
            <span>Record up to date</span>
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
            <AlertTriangle size={15} />
            <span>Last sync failed</span>
          </span>
        );
      case 'disabled':
        return <span className="text-xs font-medium text-neutral-500">Automatic sync disabled</span>;
      default:
        return <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Waiting for first sync</span>;
    }
  };

  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Cloudflare DDNS</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            The Controller keeps each configured Cloudflare DNS record pointed at this network's public IP.
          </p>
        </div>

        {ddnsConfig && !creating && (
          <button
            onClick={() => triggerDDNSSync(ddnsConfig.id)}
            disabled={ddnsConfig.status === 'updating'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors disabled:opacity-50 self-start sm:self-auto"
          >
            <RefreshCw size={14} className={ddnsConfig.status === 'updating' ? 'animate-spin' : ''} />
            <span>{ddnsConfig.status === 'updating' ? 'Synchronizing...' : 'Sync DNS Now'}</span>
          </button>
        )}
      </div>

      {/* Record switcher */}
      {(ddnsConfigs.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {ddnsConfigs.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCreating(false);
                setActiveDdnsId(c.id);
              }}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                !creating && ddnsConfig?.id === c.id
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              {c.recordName}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              creating ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            <Plus size={13} />
            <span>Add record</span>
          </button>
        </div>
      )}

      {/* Status card */}
      {ddnsConfig && !creating && (
        <div className={cardCls}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${ddnsConfig.status === 'synced' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ddnsConfig.status === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                <Globe size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">{ddnsConfig.recordName}</span>
                  {ddnsConfig.proxied ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      <Cloud size={12} className="text-amber-500" />
                      <span>Proxied</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">DNS Only</span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {ddnsConfig.name} · {ddnsConfig.recordType} record · zone <span className="font-mono">{ddnsConfig.zoneId}</span>
                </p>
              </div>
            </div>
            {statusLine(ddnsConfig)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-500 block text-[11px]">Last IP pushed to Cloudflare</span>
              <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 block">{ddnsConfig.lastIp ?? '—'}</span>
              <span className="text-[10px] text-neutral-400 block">Synced: {fmt(ddnsConfig.lastSyncedAt)}</span>
              {ddnsConfig.detectedIp && (
                <span className={`text-[10px] block font-mono ${ddnsConfig.lastIp && ddnsConfig.detectedIp !== ddnsConfig.lastIp ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'}`}>
                  WAN now: {ddnsConfig.detectedIp}
                  {ddnsConfig.lastIp && ddnsConfig.detectedIp !== ddnsConfig.lastIp ? ' (changed, sync needed)' : ''}
                  {ddnsConfig.dnsValue && ddnsConfig.dnsValue !== ddnsConfig.detectedIp ? ` · DNS: ${ddnsConfig.dnsValue}` : ''}
                </span>
              )}
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-500 block text-[11px]">Sync cadence</span>
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">
                {ddnsConfig.enabled ? `Every ${Math.round(ddnsConfig.intervalSeconds / 60)} minutes` : 'Disabled'}
              </span>
              <span className="text-[10px] text-neutral-400 block">TTL: {ddnsConfig.ttl === 1 ? 'Auto' : `${ddnsConfig.ttl}s`}</span>
            </div>
            <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-1">
              <span className="text-neutral-500 block text-[11px]">Last error</span>
              <span className={`text-sm font-semibold block break-words ${ddnsConfig.lastError ? 'text-red-600 dark:text-red-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                {ddnsConfig.lastError ?? 'None'}
              </span>
              <span className="text-[10px] text-neutral-400 block">{ddnsConfig.lastError ? fmt(ddnsConfig.lastErrorAt) : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className={cardCls}>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Sliders size={16} className="text-neutral-500" />
              <span>{isNew ? 'Add a Cloudflare record' : 'Cloudflare Configuration'}</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              The record must already exist in the zone. Zone and record are entered by hand: the API does not list Cloudflare zones.
            </p>
          </div>
          {saved && (
            <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
              <Check size={14} />
              <span>Saved</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 space-y-1">
            <span>Name</span>
            <input className={inputCls} value={draft.name} onChange={e => set('name', e.target.value)} maxLength={100} placeholder="Home server" required />
          </label>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 space-y-1">
            <span>Record name (FQDN)</span>
            <input className={inputCls} value={draft.record_name} onChange={e => set('record_name', e.target.value)} maxLength={253} placeholder="home.example.com" required />
          </label>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 space-y-1">
            <span>Zone ID</span>
            <input className={inputCls} value={draft.zone_id} onChange={e => set('zone_id', e.target.value)} placeholder="32-character id from the Cloudflare dashboard" required />
          </label>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <KeyRound size={12} />
                <span>API token</span>
              </span>
              {!isNew && ddnsConfig && (
                <span className="text-[11px] text-neutral-400">{ddnsConfig.hasApiToken ? 'A token is stored' : 'No token stored'}</span>
              )}
            </div>
            <input
              type="password"
              className={inputCls}
              value={draft.api_token ?? ''}
              onChange={e => set('api_token', e.target.value)}
              placeholder={isNew ? 'Zone:DNS:Edit token' : 'Leave blank to keep the stored token'}
              autoComplete="off"
              required={isNew}
            />
            <p className="text-[11px] text-neutral-400">Write-only: the Controller never returns it.</p>
          </div>
          <div className="space-y-1">
            <span className="block font-medium text-neutral-700 dark:text-neutral-300">Record type</span>
            <CustomSelect
              value={draft.record_type}
              onChange={v => set('record_type', v as 'A' | 'AAAA')}
              options={[
                { value: 'A', label: 'A (IPv4)' },
                { value: 'AAAA', label: 'AAAA (IPv6)' }
              ]}
            />
          </div>
          <div className="space-y-1">
            <span className="block font-medium text-neutral-700 dark:text-neutral-300">Background sync interval</span>
            <CustomSelect
              value={String(draft.interval_seconds)}
              onChange={v => set('interval_seconds', Number(v))}
              options={INTERVALS.some(o => o.value === String(draft.interval_seconds)) ? INTERVALS : [{ value: String(draft.interval_seconds), label: `Every ${draft.interval_seconds}s` }, ...INTERVALS]}
            />
          </div>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 space-y-1">
            <span>TTL (seconds, 1 = automatic)</span>
            <input type="number" min={1} max={86400} className={inputCls} value={draft.ttl ?? 1} onChange={e => set('ttl', Number(e.target.value))} />
          </label>
          <div className="space-y-1">
            <span className="block font-medium text-neutral-700 dark:text-neutral-300">Cloudflare proxy mode</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => set('proxied', true)}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  draft.proxied ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Cloud size={14} className={draft.proxied ? 'text-amber-500' : 'text-neutral-400'} />
                <span>Proxied (CDN)</span>
              </button>
              <button
                type="button"
                onClick={() => set('proxied', false)}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  !draft.proxied ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold' : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Globe size={14} className={!draft.proxied ? 'text-emerald-500' : 'text-neutral-400'} />
                <span>DNS Only</span>
              </button>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs">
          <input type="checkbox" checked={draft.enabled ?? true} onChange={e => set('enabled', e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
          <span className="font-medium text-neutral-800 dark:text-neutral-200">Keep this record updated automatically</span>
        </label>

        {error && (
          <div role="alert" className="flex items-start gap-2 p-2.5 rounded-lg text-xs bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2.5">
          {!isNew ? (
            <button type="button" onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <Trash2 size={14} />
              <span>Remove</span>
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            {creating && (
              <button type="button" onClick={() => setCreating(false)} className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                Cancel
              </button>
            )}
            <button type="submit" disabled={busy} className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors disabled:opacity-50">
              {busy ? 'Saving…' : isNew ? 'Add record' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
