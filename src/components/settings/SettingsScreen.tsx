import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Server,
  KeyRound,
  ExternalLink,
  Check,
  RotateCcw,
  Sliders,
  Moon,
  Sun,
  LogOut,
  Info
} from 'lucide-react';

const inputCls =
  'w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs font-mono';
const cardCls =
  'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4';
const headCls = 'border-b border-neutral-200 dark:border-neutral-800 pb-3';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    theme,
    toggleTheme,
    username,
    role,
    canManage,
    logout,
    serverHealth,
    systemMetrics,
    controllerKey,
    controllerKeyError,
    loadControllerKey
  } = useApp();

  const [defaultInterval, setDefaultInterval] = useState(settings.monitoring.defaultIntervalSec);
  const [defaultTimeout, setDefaultTimeout] = useState(settings.monitoring.defaultTimeoutMs);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  useEffect(() => {
    if (canManage && !controllerKey) void loadControllerKey();
  }, [canManage]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      monitoring: { defaultIntervalSec: Number(defaultInterval), defaultTimeoutMs: Number(defaultTimeout) }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetLocal = () => {
    if (window.confirm('Clear all HomeCore data stored in this browser (preferences, device icons) and sign out?')) {
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith('homecore_'))
          .forEach(k => localStorage.removeItem(k));
      } catch {
        /* ignore */
      }
      window.location.reload();
    }
  };

  const copyKey = async () => {
    if (!controllerKey) return;
    try {
      await navigator.clipboard.writeText(controllerKey.public_key);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } catch {
      /* clipboard unavailable: the key is selectable text */
    }
  };

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between items-center gap-3 py-1 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <span className="text-neutral-500">{label}</span>
      <span className="font-mono text-neutral-800 dark:text-neutral-200 truncate">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-xs">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">Settings & Security</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Your account, the Controller you are connected to, agent trust, and browser preferences.
        </p>
      </div>

      <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-start gap-2.5 text-[11px] text-neutral-500 dark:text-neutral-400">
        <Info size={14} className="shrink-0 mt-0.5 text-neutral-400" />
        <span>
          Network listeners, allowed origins, session lifetime and monitoring defaults on the server are set in the Controller's
          YAML configuration file; the API does not expose or change them.
        </span>
      </div>

      {/* Account */}
      <section className={cardCls}>
        <div className={headCls}>
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Shield size={16} className="text-neutral-500" />
            <span>Account</span>
          </h2>
        </div>
        <div>
          {row('Signed in as', username)}
          {row('Role', role)}
        </div>
        {!canManage && (
          <p className="text-[11px] text-neutral-400">
            The viewer role is read-only: adding devices, Wake-on-LAN, shutdown and DDNS need an admin.
          </p>
        )}
        <button
          type="button"
          onClick={() => void logout()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </section>

      {/* Controller */}
      <section className={cardCls}>
        <div className={headCls}>
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Server size={16} className="text-neutral-500" />
            <span>Controller</span>
          </h2>
        </div>
        <div>
          {row('Version', serverHealth?.version ?? '—')}
          {row('Status', serverHealth?.status ?? 'unreachable')}
          {row('Platform', systemMetrics?.platform ?? '—')}
          {row('Hostname', systemMetrics?.hostname ?? '—')}
          {row('Server clock', serverHealth ? new Date(serverHealth.time).toLocaleString() : '—')}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/docs/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors"
          >
            <ExternalLink size={13} />
            <span>Swagger UI (/api/docs)</span>
          </a>
          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <ExternalLink size={13} />
            <span>openapi.json</span>
          </a>
        </div>
      </section>

      {/* Agent trust (admin) */}
      {canManage && (
        <section className={cardCls}>
          <div className={headCls}>
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <KeyRound size={16} className="text-neutral-500" />
              <span>Agent Trust: Controller Signing Key</span>
            </h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Shutdown commands are signed with this Ed25519 key. Add the public key to each Agent's <code>trusted_controllers</code>.
            </p>
          </div>
          {controllerKey ? (
            <div className="space-y-1.5">
              {row('Key id', controllerKey.key_id)}
              {row('Algorithm', controllerKey.algorithm)}
              <div className="flex items-start justify-between gap-3 pt-1">
                <span className="font-mono text-[11px] break-all text-neutral-700 dark:text-neutral-300 select-all">{controllerKey.public_key}</span>
                <button type="button" onClick={copyKey} className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] font-medium shrink-0">
                  {keyCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-neutral-400">{controllerKeyError ?? 'Loading…'}</p>
          )}
        </section>
      )}

      {/* Browser preferences */}
      <form onSubmit={handleSave} className={cardCls}>
        <div className={`${headCls} flex items-center justify-between`}>
          <div>
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Sliders size={16} className="text-neutral-500" />
              <span>Browser Preferences</span>
            </h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">Stored in this browser only.</p>
          </div>
          {savedSuccess && (
            <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
              <Check size={14} />
              <span>Saved</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 space-y-1">
            <span>Default probe interval for new devices (s)</span>
            <input type="number" min={5} max={3600} value={defaultInterval} onChange={e => setDefaultInterval(Number(e.target.value))} className={inputCls} />
          </label>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 space-y-1">
            <span>Default probe timeout for new devices (ms)</span>
            <input type="number" min={100} max={10000} step={100} value={defaultTimeout} onChange={e => setDefaultTimeout(Number(e.target.value))} className={inputCls} />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
          >
            Save preferences
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}</span>
          </button>
          <button
            type="button"
            onClick={handleResetLocal}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <RotateCcw size={14} />
            <span>Clear browser data</span>
          </button>
        </div>
      </form>
    </div>
  );
};
