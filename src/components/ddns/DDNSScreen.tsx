import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomSelect, SelectOption } from '../common/CustomSelect';
import {
  Globe,
  RefreshCw,
  Shield,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Clock,
  KeyRound,
  Sliders,
  Check,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const DDNSScreen: React.FC = () => {
  const {
    ddnsConfig,
    availableZones,
    availableRecords,
    triggerDDNSSync,
    updateDDNSConfig,
    selectZone,
    selectRecord
  } = useApp();

  const [apiTokenInput, setApiTokenInput] = useState('');
  const [editingToken, setEditingToken] = useState(false);
  const [customRecordName, setCustomRecordName] = useState('');
  const [isCustomRecord, setIsCustomRecord] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filter records available for the currently selected zone
  const zoneRecords = availableRecords.filter(r => r.zoneId === ddnsConfig.selectedZoneId);

  // Prepare options for Zone CustomSelect
  const zoneOptions: SelectOption[] = availableZones.map(zone => ({
    value: zone.id,
    label: zone.name,
    badge: zone.status.toUpperCase(),
    icon: <Globe size={13} className="text-emerald-500" />
  }));

  // Prepare options for Record CustomSelect
  const recordOptions: SelectOption[] = [
    ...zoneRecords.map(rec => ({
      value: rec.id,
      label: rec.name,
      sublabel: `Current: ${rec.content}`,
      badge: rec.type,
      icon: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
    })),
    {
      value: 'custom',
      label: '+ Custom Subdomain...',
      sublabel: `Under ${ddnsConfig.selectedZoneName}`,
      badge: 'NEW',
      icon: <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
    }
  ];

  // Prepare options for Sync Interval CustomSelect
  const intervalOptions: SelectOption[] = [
    { value: '5', label: 'Every 5 minutes' },
    { value: '10', label: 'Every 10 minutes (Recommended)' },
    { value: '15', label: 'Every 15 minutes' },
    { value: '30', label: 'Every 30 minutes' },
    { value: '60', label: 'Every 1 hour' }
  ];

  const handleZoneChange = (zoneId: string) => {
    setIsCustomRecord(false);
    selectZone(zoneId);
  };

  const handleRecordChange = (recordId: string) => {
    if (recordId === 'custom') {
      setIsCustomRecord(true);
      const defaultCustom = `home.${ddnsConfig.selectedZoneName}`;
      setCustomRecordName(defaultCustom);
      selectRecord('custom', defaultCustom);
    } else {
      setIsCustomRecord(false);
      selectRecord(recordId);
    }
  };

  const handleCustomNameChange = (name: string) => {
    setCustomRecordName(name);
    selectRecord('custom', name);
  };

  const handleSaveToken = () => {
    if (apiTokenInput.trim()) {
      const masked = `${apiTokenInput.slice(0, 2)}••••••••••••••••••••••••${apiTokenInput.slice(-4)}`;
      updateDDNSConfig({
        apiTokenMasked: masked,
        tokenConfigured: true
      });
      setApiTokenInput('');
      setEditingToken(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  // Simulation: Test ISP assigning a dynamic WAN IP
  const handleSimulateIpChange = () => {
    const randomOctet = Math.floor(Math.random() * 200) + 20;
    const newIp = `203.0.113.${randomOctet}`;
    updateDDNSConfig({
      currentIpv4: newIp,
      status: 'mismatch',
      lastSyncMessage: `WAN IP changed to ${newIp}. Synchronization needed.`
    });
  };

  const isMatched = ddnsConfig.currentDnsValue === ddnsConfig.currentIpv4;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Cloudflare DDNS Alias
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Link this home server to 1 Cloudflare API token, 1 DNS zone, and 1 record alias for dynamic WAN IP updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerDDNSSync()}
            disabled={ddnsConfig.status === 'updating'}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={ddnsConfig.status === 'updating' ? 'animate-spin' : ''} />
            <span>{ddnsConfig.status === 'updating' ? 'Synchronizing...' : 'Sync DNS Now'}</span>
          </button>
        </div>
      </div>

      {/* Primary Alias State Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              isMatched ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-500'
            }`}>
              <Globe size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {ddnsConfig.selectedRecordName}
                </span>
                {ddnsConfig.proxied ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    <Cloud size={12} className="text-amber-500" />
                    <span>Proxied</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">
                    <span>DNS Only</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Zone: <strong className="font-mono text-neutral-700 dark:text-neutral-300">{ddnsConfig.selectedZoneName}</strong> ({ddnsConfig.recordType} Record)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {ddnsConfig.status === 'updating' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-500">
                <RefreshCw size={13} className="animate-spin" />
                <span>Updating Cloudflare...</span>
              </span>
            ) : isMatched ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={15} />
                <span>Synchronized with WAN IP</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle size={15} />
                <span>WAN IP Mismatch (Sync Required)</span>
              </span>
            )}
          </div>
        </div>

        {/* IP Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Detected Public WAN IP */}
          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <span className="text-neutral-500 block text-[11px]">Detected Public WAN IP</span>
            <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 block">
              {ddnsConfig.currentIpv4}
            </span>
            <span className="text-[10px] text-neutral-400 block">
              Checked: {new Date(ddnsConfig.lastCheckTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Cloudflare DNS Value */}
          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <span className="text-neutral-500 block text-[11px]">Cloudflare Resolved IP</span>
            <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 block">
              {ddnsConfig.currentDnsValue}
            </span>
            <span className="text-[10px] text-neutral-400 block">
              Target Record: {ddnsConfig.recordType}
            </span>
          </div>

          {/* Sync Cadence */}
          <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-1">
            <span className="text-neutral-500 block text-[11px]">Automatic Cron Cadence</span>
            <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 block">
              Every {ddnsConfig.syncIntervalMinutes} minutes
            </span>
            <span className="text-[10px] text-emerald-500 flex items-center gap-1">
              <CheckCircle2 size={11} />
              <span>Daemon scheduler active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Cloudflare Settings Form */}
      {/* Align: On lg screens -> 3 columns; on smaller screens -> 3 rows */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Sliders size={16} className="text-neutral-500" />
              <span>Cloudflare Configuration</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Select your Cloudflare DNS Zone and pick the DNS record to use as the alias for this server.
            </p>
          </div>

          {savedSuccess && (
            <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
              <Check size={14} />
              <span>Saved</span>
            </span>
          )}
        </div>

        {/* 3-Column Responsive Grid: 1 col on small screens, 3 cols on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start text-xs">
          {/* Column 1: Cloudflare API Token */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center h-5">
              <label className="font-medium text-neutral-700 dark:text-neutral-300">
                1. API Token
              </label>
              {!editingToken && (
                <button
                  type="button"
                  onClick={() => setEditingToken(true)}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] font-medium"
                >
                  Change Token
                </button>
              )}
            </div>

            {editingToken ? (
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Enter token..."
                  value={apiTokenInput}
                  onChange={e => setApiTokenInput(e.target.value)}
                  className="w-full font-mono px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveToken}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingToken(false)}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 min-h-[42px]">
                <div className="flex items-center gap-2 truncate">
                  <KeyRound size={14} className="text-neutral-400 shrink-0" />
                  <span className="font-mono text-neutral-700 dark:text-neutral-300 truncate">
                    {ddnsConfig.apiTokenMasked}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium shrink-0 ml-1">
                  <Check size={12} />
                  <span>Valid</span>
                </span>
              </div>
            )}
            <p className="text-[11px] text-neutral-400">
              Requires Zone:DNS:Edit permissions.
            </p>
          </div>

          {/* Column 2: DNS Zone (Custom HTML Dropdown) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center h-5">
              <label className="font-medium text-neutral-700 dark:text-neutral-300">
                2. DNS Zone (Domain)
              </label>
              <span className="text-[11px] text-neutral-400">
                {availableZones.length} available
              </span>
            </div>

            <CustomSelect
              value={ddnsConfig.selectedZoneId}
              onChange={handleZoneChange}
              options={zoneOptions}
              placeholder="Select DNS Zone..."
            />

            <p className="text-[11px] text-neutral-400">
              Fetched from authenticated Cloudflare account.
            </p>
          </div>

          {/* Column 3: Record Alias (Custom HTML Dropdown + Subdomain) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center h-5">
              <label className="font-medium text-neutral-700 dark:text-neutral-300">
                3. Server Alias Record
              </label>
              <span className="text-[11px] text-neutral-400">
                {zoneRecords.length} in zone
              </span>
            </div>

            <CustomSelect
              value={isCustomRecord ? 'custom' : ddnsConfig.selectedRecordId}
              onChange={handleRecordChange}
              options={recordOptions}
              placeholder="Select Alias Record..."
            />

            {/* Custom record name input if selected */}
            {isCustomRecord ? (
              <div className="pt-1 space-y-1">
                <input
                  type="text"
                  value={customRecordName}
                  onChange={e => handleCustomNameChange(e.target.value)}
                  placeholder={`subdomain.${ddnsConfig.selectedZoneName}`}
                  className="w-full font-mono px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 text-xs focus:border-emerald-500 focus:outline-hidden"
                />
              </div>
            ) : (
              <p className="text-[11px] text-neutral-400">
                The DNS record dynamically updated to point to your WAN IP.
              </p>
            )}
          </div>
        </div>

        {/* Secondary Options: Proxy Mode & Auto-sync Interval */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Cloudflare Proxy Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateDDNSConfig({ proxied: true })}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  ddnsConfig.proxied
                    ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Cloud size={14} className={ddnsConfig.proxied ? 'text-amber-500' : 'text-neutral-400'} />
                <span>Proxied (CDN)</span>
              </button>

              <button
                type="button"
                onClick={() => updateDDNSConfig({ proxied: false })}
                className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  !ddnsConfig.proxied
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Globe size={14} className={!ddnsConfig.proxied ? 'text-emerald-500' : 'text-neutral-400'} />
                <span>DNS Only (Direct)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Background Sync Interval
            </label>
            <CustomSelect
              value={String(ddnsConfig.syncIntervalMinutes)}
              onChange={val => updateDDNSConfig({ syncIntervalMinutes: Number(val) })}
              options={intervalOptions}
            />
          </div>
        </div>
      </div>

      {/* Simulator Helper */}
      <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-500" />
            <span>Simulate Dynamic WAN IP Change</span>
          </span>
          <p className="text-neutral-500 text-[11px]">
            Test how HomeCore detects when your ISP changes the public IP and triggers synchronization.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSimulateIpChange}
          className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
        >
          Simulate New WAN IP
        </button>
      </div>
    </div>
  );
};
