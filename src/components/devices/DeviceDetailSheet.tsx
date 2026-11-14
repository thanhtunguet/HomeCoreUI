import React from 'react';
import { useApp } from '../../context/AppContext';
import { Device } from '../../types';
import { formatRelative } from '../../api/format';
import { StatusBadge } from '../common/StatusBadge';
import { DeviceIcon } from '../common/DeviceIcon';
import {
  X,
  Zap,
  Power,
  RefreshCw,
  Edit2,
  Trash2,
  Network,
  Clock,
  ShieldCheck,
  Server,
  Activity,
  AlertCircle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

/** Label for the agent row; says when the state is only a guess from the host status. */
const agentStatusLabel = (s: Device['shutdown']): string => {
  switch (s.agentStatus) {
    case 'not_configured':
      return 'Not Configured';
    case 'ready':
      return s.agentStatusSource === 'reported' ? 'Ready' : 'Bound (host online, inferred)';
    case 'unreachable':
      return s.agentStatusSource === 'reported' ? 'Unreachable' : 'Bound (host offline, inferred)';
    default:
      return 'Unknown (not contacted yet)';
  }
};

interface DeviceDetailSheetProps {
  device: Device;
  onClose: () => void;
}

export const DeviceDetailSheet: React.FC<DeviceDetailSheetProps> = ({
  device,
  onClose
}) => {
  const {
    probeDevice,
    startWakeFlow,
    requestShutdownConfirmation,
    setEditingDevice,
    setDeviceModalOpen,
    deleteDevice,
    activities,
    isPowerLocked
  } = useApp();

  const [probing, setProbing] = React.useState(false);

  const handleProbe = async () => {
    setProbing(true);
    await probeDevice(device.id);
    setProbing(false);
  };

  const handleEdit = () => {
    setEditingDevice(device);
    setDeviceModalOpen(true);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to remove "${device.name}" from HomeCore?`)) {
      deleteDevice(device.id);
      onClose();
    }
  };

  // Filter activities related to this device
  const deviceActivities = activities.filter(a => a.deviceId === device.id);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 h-full shadow-2xl border-l border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              <DeviceIcon type={device.type} size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">
                  {device.name}
                </h2>
                <StatusBadge status={device.status} />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {device.description || 'No description provided'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleEdit}
              title="Edit Device Configuration"
              className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={handleDelete}
              title="Delete Device"
              className="p-1.5 text-neutral-500 hover:text-red-600 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md"
              aria-label="Close detail panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 flex items-center gap-2">
          {/* Check Status */}
          <button
            onClick={handleProbe}
            disabled={probing}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={probing ? 'animate-spin text-emerald-500' : ''} />
            <span>{probing ? 'Probing Port...' : 'Check Status Now'}</span>
          </button>

          {/* Wake Button */}
          {device.wol.enabled ? (
            <button
              onClick={() => startWakeFlow(device)}
              disabled={device.powerTransition !== 'none' || isPowerLocked(device.id)}
              className="disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors"
            >
              <Zap size={14} className="text-emerald-500" />
              <span>Wake Device</span>
            </button>
          ) : (
            <div
              title="Wake-on-LAN is not enabled for this device"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-100/50 dark:bg-neutral-800/30 border border-neutral-200/50 dark:border-neutral-800 rounded-lg cursor-not-allowed"
            >
              <Zap size={14} />
              <span>WOL Disabled</span>
            </div>
          )}

          {/* Shutdown Button */}
          {device.shutdown.enabled && device.status === 'online' ? (
            <button
              onClick={() => requestShutdownConfirmation(device)}
              disabled={device.powerTransition !== 'none' || isPowerLocked(device.id)}
              className="disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
            >
              <Power size={14} className="text-red-500" />
              <span>Shutdown</span>
            </button>
          ) : (
            <div
              title={
                !device.shutdown.enabled
                  ? 'HomeCore Shutdown Agent not enabled for this host'
                  : 'Device is offline'
              }
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-100/50 dark:bg-neutral-800/30 border border-neutral-200/50 dark:border-neutral-800 rounded-lg cursor-not-allowed"
            >
              <Power size={14} />
              <span>Shutdown N/A</span>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Section: Network & Identity */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Network size={14} />
              <span>Network Identity</span>
            </h3>

            <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 dark:text-neutral-400">IP Address</span>
                <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">{device.ip}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 dark:text-neutral-400">MAC Address</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">{device.mac}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 dark:text-neutral-400">Device Type / OS</span>
                <span className="capitalize text-neutral-800 dark:text-neutral-200">
                  {device.type} · {device.os}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 dark:text-neutral-400">Last Seen</span>
                <span className="text-neutral-800 dark:text-neutral-200">{device.lastSeen}</span>
              </div>
            </div>
          </div>

          {/* Section: Online Monitoring (TCP Health) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Activity size={14} />
                <span>Online Monitoring</span>
              </h3>
              <span className="text-[11px] text-neutral-400">TCP Handshake</span>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 dark:text-neutral-400">Target Port</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">
                  Port {device.monitoring.port} ({device.monitoring.protocolPreset})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 dark:text-neutral-400">Probe Interval</span>
                <span className="text-neutral-800 dark:text-neutral-200">
                  Every {device.monitoring.intervalSeconds} seconds (timeout: {device.monitoring.timeoutMs}ms)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 dark:text-neutral-400">Last Latency</span>
                <span className="font-mono tabular-nums text-neutral-800 dark:text-neutral-200">
                  {device.monitoring.lastLatencyMs ? `${device.monitoring.lastLatencyMs} ms` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 dark:text-neutral-400">Last Checked</span>
                <span className="text-neutral-800 dark:text-neutral-200">
                  {device.monitoring.lastCheckedAt ? new Date(device.monitoring.lastCheckedAt).toLocaleTimeString() : 'Never'}
                </span>
              </div>
              <div className="pt-1.5 border-t border-neutral-200 dark:border-neutral-700/60 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <AlertCircle size={13} className="shrink-0 text-neutral-400" />
                <span>Online status is confirmed via raw TCP socket probe, not ICMP ping.</span>
              </div>
            </div>
          </div>

          {/* Section: Wake-on-LAN Configuration */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Zap size={14} />
              <span>Wake-on-LAN Details</span>
            </h3>

            <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 dark:text-neutral-400">Status</span>
                <span className={device.wol.enabled ? 'text-emerald-500 font-medium' : 'text-neutral-400'}>
                  {device.wol.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              {device.wol.enabled && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 dark:text-neutral-400">Target MAC</span>
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">{device.wol.macAddress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 dark:text-neutral-400">Broadcast Address</span>
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">{device.wol.broadcastAddress || 'auto (subnet broadcast)'}:{device.wol.port}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section: Remote Shutdown Agent */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Power size={14} />
              <span>Remote Shutdown Agent</span>
            </h3>

            <div className="bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 dark:text-neutral-400">Agent Status</span>
                <span
                  className={`font-medium ${
                    device.shutdown.agentStatus === 'ready'
                      ? 'text-emerald-500'
                      : device.shutdown.agentStatus === 'unreachable'
                      ? 'text-amber-500'
                      : 'text-neutral-400'
                  }`}
                  title={
                    device.shutdown.agentStatusSource === 'reported'
                      ? 'Reported by the Controller (last contact with the agent)'
                      : device.shutdown.enabled
                      ? 'Inferred from the host status: the Controller does not report agent health yet'
                      : undefined
                  }
                >
                  {agentStatusLabel(device.shutdown)}
                </span>
              </div>
              {device.shutdown.enabled && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 dark:text-neutral-400">Agent Endpoint</span>
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">
                      {device.shutdown.agentScheme}://{device.ip}:{device.shutdown.agentPort}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-neutral-500 dark:text-neutral-400 shrink-0">Agent ID</span>
                    <span className="font-mono text-[11px] text-neutral-800 dark:text-neutral-200 truncate" title={device.shutdown.agentId}>
                      {device.shutdown.agentId}
                    </span>
                  </div>
                  {device.shutdown.agentStatusSource === 'reported' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 dark:text-neutral-400">Agent Version</span>
                        <span className="font-mono text-neutral-800 dark:text-neutral-200">{device.shutdown.agentVersion ?? '—'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 dark:text-neutral-400">Last Contact</span>
                        <span className="text-neutral-800 dark:text-neutral-200" title={device.shutdown.agentLastOkAt}>
                          {formatRelative(device.shutdown.agentLastOkAt)}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 dark:text-neutral-400">Command Auth</span>
                    <span className="text-neutral-800 dark:text-neutral-200">Ed25519 signed by Controller</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section: Recent Events for this Device */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
              <Clock size={14} />
              <span>Recent Activity History</span>
            </h3>

            {deviceActivities.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No events recorded for this device yet.</p>
            ) : (
              <div className="space-y-2">
                {deviceActivities.slice(0, 5).map(act => (
                  <div
                    key={act.id}
                    className="p-2.5 bg-neutral-50 dark:bg-neutral-800/30 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">{act.title}</span>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">{act.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
