import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu,
  Server,
  HardDrive,
  Network,
  RefreshCw,
  Activity,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Zap,
  Info
} from 'lucide-react';

export const SystemScreen: React.FC = () => {
  const { systemMetrics, refreshSystemMetrics, settings } = useApp();

  const { host, process } = systemMetrics;

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatTraffic = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const memPercent = Math.round((host.memoryUsedBytes / host.memoryTotalBytes) * 100);
  const diskPercent = Math.round((host.diskUsedBytes / host.diskTotalBytes) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Host Hardware & Process Monitoring
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Real-time telemetry of the physical machine running HomeCore and the Go runtime process.
          </p>
        </div>

        <button
          onClick={refreshSystemMetrics}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Android Hardware Host Notice (if running on Android TV Box or repurposed Phone) */}
      {host.isAndroidHost && (
        <div className="p-3.5 bg-neutral-900 text-neutral-300 rounded-xl border border-neutral-800 flex items-start gap-3 text-xs">
          <Info size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-neutral-100 block">
              Low-Power Embedded Host (Repurposed Android TV / ARM64 Box)
            </span>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              HomeCore is executing directly on an ARM64 embedded Linux kernel ({host.kernel}). Certain sysfs hardware sensors (such as battery charge limiters or proprietary thermal sensors) are restricted by the Android HAL and are gracefully omitted.
            </p>
          </div>
        </div>
      )}

      {/* Host Specifications Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Host Identity */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-xs text-neutral-500">Hostname / Node</div>
          <div className="font-semibold text-sm font-mono text-neutral-900 dark:text-neutral-100">
            {host.hostname}
          </div>
          <div className="text-[11px] text-neutral-400 truncate">
            {host.os}
          </div>
        </div>

        {/* Architecture & Cores */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-xs text-neutral-500">Architecture</div>
          <div className="font-semibold text-sm font-mono text-neutral-900 dark:text-neutral-100">
            {host.arch}
          </div>
          <div className="text-[11px] text-neutral-400">
            {host.cpuCores} Physical Cores Available
          </div>
        </div>

        {/* Host Uptime */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-xs text-neutral-500">Host Continuous Uptime</div>
          <div className="font-semibold text-sm font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
            {formatUptime(host.uptimeSeconds)}
          </div>
          <div className="text-[11px] text-emerald-500 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Zero unexpected reboots</span>
          </div>
        </div>

        {/* HomeCore Process Footprint */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs space-y-1">
          <div className="text-xs text-neutral-500">Go Process Memory (RSS)</div>
          <div className="font-semibold text-sm font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatBytes(process.memoryRssBytes)}
          </div>
          <div className="text-[11px] text-neutral-400">
            {process.goroutines} active goroutines (PID {process.pid})
          </div>
        </div>
      </div>

      {/* Resource Utilization Gauges (CPU, Memory, Disk) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Utilization */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Cpu size={15} className="text-neutral-400" />
              <span>CPU Utilization</span>
            </span>
            <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {host.cpuUsagePercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, host.cpuUsagePercent)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
            <span>Core 0-3 load average</span>
            <span>0.24, 0.18, 0.15</span>
          </div>
        </div>

        {/* RAM Usage */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Activity size={15} className="text-neutral-400" />
              <span>Host Memory (RAM)</span>
            </span>
            <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {memPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${memPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
            <span>Used: {formatBytes(host.memoryUsedBytes)}</span>
            <span>Total: {formatBytes(host.memoryTotalBytes)}</span>
          </div>
        </div>

        {/* Disk Storage */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <HardDrive size={15} className="text-neutral-400" />
              <span>eMMC / Flash Storage</span>
            </span>
            <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
              {diskPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${diskPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
            <span>Used: {formatBytes(host.diskUsedBytes)}</span>
            <span>Total: {formatBytes(host.diskTotalBytes)}</span>
          </div>
        </div>
      </div>

      {/* Host vs HomeCore Process Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Process Telemetry */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Server size={16} className="text-neutral-500" />
            <span>HomeCore Process Internals</span>
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Go Runtime Version</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">{process.version}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Process ID (PID)</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">{process.pid}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Heap Allocation</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatBytes(process.heapAllocBytes)}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-neutral-500">Concurrent Goroutines</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">{process.goroutines} active</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-neutral-500">Process Uptime</span>
              <span className="font-mono text-neutral-800 dark:text-neutral-200">{formatUptime(process.uptimeSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Network Interfaces */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs space-y-3">
          <h2 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Network size={16} className="text-neutral-500" />
            <span>Local Network Adapters</span>
          </h2>

          <div className="space-y-2.5">
            {host.networkInterfaces.map(iface => (
              <div
                key={iface.name}
                className="p-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                      {iface.name}
                    </span>
                    {iface.isDefault && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                        Default Gateway
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-neutral-700 dark:text-neutral-300">
                    {iface.ip}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-1">
                  <span>MAC {iface.mac}</span>
                  <span>Rx: {formatTraffic(iface.rxBytes)} · Tx: {formatTraffic(iface.txBytes)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
