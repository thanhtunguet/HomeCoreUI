import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Shield,
  Network,
  Activity,
  Terminal,
  KeyRound,
  ExternalLink,
  Check,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Moon,
  Sun
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    theme,
    toggleTheme,
    setActiveTab
  } = useApp();

  const [serverName, setServerName] = useState(settings.general.serverName);
  const [timezone, setTimezone] = useState(settings.general.timezone);
  const [language, setLanguage] = useState(settings.general.language);

  const [httpPort, setHttpPort] = useState(settings.network.httpPort);
  const [bindAddress, setBindAddress] = useState(settings.network.bindAddress);

  const [defaultInterval, setDefaultInterval] = useState(settings.monitoring.defaultIntervalSec);
  const [defaultTimeout, setDefaultTimeout] = useState(settings.monitoring.defaultTimeoutMs);
  const [maxRetries, setMaxRetries] = useState(settings.monitoring.maxRetries);

  const [username, setUsername] = useState(settings.security.username);
  const [agentToken, setAgentToken] = useState('');
  const [trustedSubnets, setTrustedSubnets] = useState(settings.security.trustedControllers.join(', '));

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [apiDocsOpen, setApiDocsOpen] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      general: {
        ...settings.general,
        serverName,
        timezone,
        language
      },
      network: {
        ...settings.network,
        httpPort: Number(httpPort),
        bindAddress
      },
      monitoring: {
        defaultIntervalSec: Number(defaultInterval),
        defaultTimeoutMs: Number(defaultTimeout),
        maxRetries: Number(maxRetries)
      },
      security: {
        ...settings.security,
        username,
        trustedControllers: trustedSubnets.split(',').map(s => s.trim()).filter(Boolean),
        agentSecretTokenMasked: agentToken ? `hc_sec_••••••••••••${agentToken.slice(-4)}` : settings.security.agentSecretTokenMasked
      }
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetFactory = () => {
    if (window.confirm('Reset all HomeCore configuration to factory defaults? Local changes will be reloaded.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            System Settings & Security
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Configure server identity, network listeners, security authentication, and API endpoints.
          </p>
        </div>

        {savedSuccess && (
          <div className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <Check size={14} />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6 text-xs">
        {/* 1. General Settings */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Sliders size={16} className="text-neutral-500" />
              <span>General Configuration</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Server Display Name
              </label>
              <input
                type="text"
                value={serverName}
                onChange={e => setServerName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Time Zone
              </label>
              <input
                type="text"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                System Interface Theme
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                    theme === 'dark'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <Moon size={14} />
                  <span>Dark (OLED Neutral)</span>
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                    theme === 'light'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <Sun size={14} />
                  <span>Light</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Display Language
              </label>
              <input
                type="text"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>
          </div>
        </section>

        {/* 2. Network Listener Settings */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Network size={16} className="text-neutral-500" />
              <span>HTTP Listener & Subnets</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Listen Address
              </label>
              <input
                type="text"
                value={bindAddress}
                onChange={e => setBindAddress(e.target.value)}
                className="w-full font-mono px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Default 0.0.0.0 binds to all local Ethernet, Wi-Fi, and Tailscale adapters.
              </p>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                HTTP Port
              </label>
              <input
                type="number"
                value={httpPort}
                onChange={e => setHttpPort(Number(e.target.value))}
                className="w-full font-mono px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>
          </div>
        </section>

        {/* 3. Monitoring Engine Parameters */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Activity size={16} className="text-neutral-500" />
              <span>TCP Health Monitoring Engine</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Default Interval (Seconds)
              </label>
              <input
                type="number"
                min="5"
                max="3600"
                value={defaultInterval}
                onChange={e => setDefaultInterval(Number(e.target.value))}
                className="w-full font-mono px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Probe Timeout (ms)
              </label>
              <input
                type="number"
                min="200"
                max="10000"
                step="100"
                value={defaultTimeout}
                onChange={e => setDefaultTimeout(Number(e.target.value))}
                className="w-full font-mono px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Retry Threshold Before Offline
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxRetries}
                onChange={e => setMaxRetries(Number(e.target.value))}
                className="w-full font-mono px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>
          </div>
        </section>

        {/* 4. Security & Agent Credentials */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Shield size={16} className="text-neutral-500" />
              <span>Authentication & Shutdown Agent Security</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Administrator Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full font-mono px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Global Agent Secret Token (HMAC SHA-256)
              </label>
              <input
                type="password"
                placeholder={settings.security.agentSecretTokenMasked}
                value={agentToken}
                onChange={e => setAgentToken(e.target.value)}
                className="w-full font-mono px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Never shared over plaintext HTTP. Stored masked.
              </p>
            </div>

            <div className="col-span-2">
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Trusted Controller Subnets
              </label>
              <input
                type="text"
                value={trustedSubnets}
                onChange={e => setTrustedSubnets(e.target.value)}
                className="w-full font-mono px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Comma-separated CIDR blocks permitted to invoke remote shutdown.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Developer & Diagnostics */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 flex items-center justify-between">
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Terminal size={16} className="text-neutral-500" />
              <span>Developer & API Documentation</span>
            </h2>
            <span className="font-mono text-[11px] text-neutral-400">
              v{settings.developer.version}
            </span>
          </div>

          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                OpenAPI 3.0 / Swagger UI Specification
              </span>
              <p className="text-neutral-500 text-[11px] mt-0.5">
                Inspect raw REST endpoints for device management, Wake-on-LAN sockets, and DDNS cron triggers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setApiDocsOpen(!apiDocsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shrink-0 hover:bg-neutral-50"
            >
              <span>{apiDocsOpen ? 'Hide API Explorer' : 'Explore /api/docs'}</span>
              <ExternalLink size={13} />
            </button>
          </div>

          {/* Interactive Swagger/OpenAPI Preview */}
          {apiDocsOpen && (
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 font-mono text-[11px] space-y-3 animate-in fade-in duration-150">
              <div className="text-neutral-400 font-bold border-b border-neutral-800 pb-2">
                HomeCore REST API Endpoints (/api/v1)
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">GET</span>
                  <span className="text-neutral-300">/api/v1/summary</span>
                  <span className="text-neutral-500">— Dashboard health & device counts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">GET</span>
                  <span className="text-neutral-300">/api/v1/devices</span>
                  <span className="text-neutral-500">— List all registered devices</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">POST</span>
                  <span className="text-neutral-300">/api/v1/devices/:id/wol</span>
                  <span className="text-neutral-500">— Broadcast Wake-on-LAN magic packet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">POST</span>
                  <span className="text-neutral-300">/api/v1/devices/:id/shutdown</span>
                  <span className="text-neutral-500">— Dispatch authenticated ACPI poweroff</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">POST</span>
                  <span className="text-neutral-300">/api/v1/ddns/sync</span>
                  <span className="text-neutral-500">— Trigger Cloudflare DNS synchronization</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">GET</span>
                  <span className="text-neutral-300">/api/v1/system/metrics</span>
                  <span className="text-neutral-500">— Hardware CPU, memory, and Go stats</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">
              Need to start clean? Reset mock environment to initial seed.
            </span>
            <button
              type="button"
              onClick={handleResetFactory}
              className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium"
            >
              <RotateCcw size={13} />
              <span>Reset Demo State</span>
            </button>
          </div>
        </section>

        {/* Save Bar */}
        <div className="flex justify-end pt-2 pb-8">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
};
