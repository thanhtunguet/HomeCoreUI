import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Device,
  DDNSConfig,
  CloudflareZone,
  CloudflareRecordOption,
  ActivityEvent,
  SystemMetrics,
  AppSettings,
  WakeFlowState,
  ShutdownFlowState,
  ActivityCategory,
  ActivityOutcome
} from '../types';
import {
  initialDevices,
  initialDDNSConfig,
  initialCloudflareZones,
  initialCloudflareRecords,
  initialActivities,
  initialSystemMetrics,
  initialAppSettings
} from '../services/mockData';

interface AppContextType {
  // Navigation
  activeTab: 'dashboard' | 'devices' | 'ddns' | 'activity' | 'system' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'devices' | 'ddns' | 'activity' | 'system' | 'settings') => void;
  ambientMode: boolean;
  setAmbientMode: (val: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Devices
  devices: Device[];
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
  deviceModalOpen: boolean;
  setDeviceModalOpen: (val: boolean) => void;
  editingDevice: Device | null;
  setEditingDevice: (device: Device | null) => void;
  saveDevice: (deviceData: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  probeDevice: (id: string) => Promise<boolean>;

  // Asynchronous flows
  wakeFlow: WakeFlowState;
  startWakeFlow: (device: Device) => void;
  cancelWakeFlow: () => void;

  shutdownFlow: ShutdownFlowState;
  requestShutdownConfirmation: (device: Device) => void;
  confirmAndExecuteShutdown: () => void;
  cancelShutdownFlow: () => void;

  // DDNS (Single Cloudflare Token, Single Zone, Single Record Alias)
  ddnsConfig: DDNSConfig;
  availableZones: CloudflareZone[];
  availableRecords: CloudflareRecordOption[];
  triggerDDNSSync: () => Promise<void>;
  updateDDNSConfig: (newConfig: Partial<DDNSConfig>) => void;
  selectZone: (zoneId: string) => void;
  selectRecord: (recordId: string, customName?: string) => void;

  // Activity
  activities: ActivityEvent[];
  addActivity: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;

  // System
  systemMetrics: SystemMetrics;
  refreshSystemMetrics: () => void;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Quick stats
  onlineCount: number;
  totalDevices: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DEVICES: 'homecore_devices_v1',
  DDNS_CONFIG: 'homecore_ddns_config_v1',
  ACTIVITIES: 'homecore_activities_v1',
  SETTINGS: 'homecore_settings_v1',
  THEME: 'homecore_theme_v1'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'devices' | 'ddns' | 'activity' | 'system' | 'settings'>('dashboard');
  const [ambientMode, setAmbientMode] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Default to dark for infrastructure / OLED screens
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // State with LocalStorage fallbacks
  const [devices, setDevices] = useState<Device[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEVICES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored devices', e);
      }
    }
    return initialDevices;
  });

  const [availableZones] = useState<CloudflareZone[]>(initialCloudflareZones);
  const [availableRecords, setAvailableRecords] = useState<CloudflareRecordOption[]>(initialCloudflareRecords);

  const [ddnsConfig, setDDNSConfig] = useState<DDNSConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DDNS_CONFIG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored ddnsConfig', e);
      }
    }
    return initialDDNSConfig;
  });

  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored activities', e);
      }
    }
    return initialActivities;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored settings', e);
      }
    }
    return initialAppSettings;
  });

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>(initialSystemMetrics);

  // Modal and Selection State
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceModalOpen, setDeviceModalOpen] = useState<boolean>(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Synchronize with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DDNS_CONFIG, JSON.stringify(ddnsConfig));
  }, [ddnsConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Keep selected device synced with updated device in list
  useEffect(() => {
    if (selectedDevice) {
      const updated = devices.find(d => d.id === selectedDevice.id);
      if (updated) setSelectedDevice(updated);
    }
  }, [devices]);

  // Live telemetry subtle fluctuation (realistic host server tick)
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => {
        const cpuDelta = (Math.random() - 0.48) * 2;
        const newCpu = Math.max(8, Math.min(45, +(prev.host.cpuUsagePercent + cpuDelta).toFixed(1)));
        const memDelta = Math.floor((Math.random() - 0.5) * 4194304);
        const newMem = Math.max(1000000000, Math.min(prev.host.memoryTotalBytes * 0.8, prev.host.memoryUsedBytes + memDelta));
        return {
          ...prev,
          host: {
            ...prev.host,
            cpuUsagePercent: newCpu,
            memoryUsedBytes: newMem,
            uptimeSeconds: prev.host.uptimeSeconds + 5
          },
          process: {
            ...prev.process,
            uptimeSeconds: prev.process.uptimeSeconds + 5
          }
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Helper to add activity
  const addActivity = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newEvent, ...prev.slice(0, 99)]);
  };

  // Device Operations
  const saveDevice = (deviceData: Partial<Device>) => {
    if (editingDevice) {
      // Edit existing
      setDevices(prev =>
        prev.map(d => (d.id === editingDevice.id ? ({ ...d, ...deviceData } as Device) : d))
      );
      addActivity({
        category: 'device',
        deviceId: editingDevice.id,
        deviceName: deviceData.name || editingDevice.name,
        title: 'Device Configuration Updated',
        description: `Settings updated for ${deviceData.name || editingDevice.name} (${deviceData.ip || editingDevice.ip})`,
        outcome: 'info'
      });
    } else {
      // Create new
      const newDevice: Device = {
        id: `dev-${Date.now().toString(36)}`,
        name: deviceData.name || 'New Device',
        description: deviceData.description || '',
        type: deviceData.type || 'desktop',
        os: deviceData.os || 'linux',
        ip: deviceData.ip || '192.168.1.100',
        mac: (deviceData.mac || '00:11:22:33:44:55').toUpperCase(),
        status: 'unknown',
        lastSeen: 'Never',
        monitoring: {
          enabled: true,
          port: deviceData.monitoring?.port || 22,
          protocolPreset: deviceData.monitoring?.protocolPreset || 'SSH',
          intervalSeconds: deviceData.monitoring?.intervalSeconds || 30,
          timeoutMs: deviceData.monitoring?.timeoutMs || 1500,
          consecutiveFailures: 0
        },
        wol: {
          enabled: deviceData.wol?.enabled ?? true,
          macAddress: (deviceData.mac || '00:11:22:33:44:55').toUpperCase(),
          broadcastAddress: deviceData.wol?.broadcastAddress || '192.168.1.255',
          port: 9
        },
        shutdown: {
          enabled: deviceData.shutdown?.enabled ?? false,
          agentHost: deviceData.shutdown?.agentHost || deviceData.ip || '',
          agentPort: deviceData.shutdown?.agentPort || 8080,
          authConfigured: deviceData.shutdown?.authConfigured ?? false,
          agentStatus: deviceData.shutdown?.enabled ? 'ready' : 'not_configured'
        },
        createdAt: new Date().toISOString()
      };

      setDevices(prev => [...prev, newDevice]);
      addActivity({
        category: 'device',
        deviceId: newDevice.id,
        deviceName: newDevice.name,
        title: 'New Device Registered',
        description: `Added ${newDevice.name} with target IP ${newDevice.ip} and port ${newDevice.monitoring.port}.`,
        outcome: 'success'
      });
    }

    setDeviceModalOpen(false);
    setEditingDevice(null);
  };

  const deleteDevice = (id: string) => {
    const target = devices.find(d => d.id === id);
    if (!target) return;
    setDevices(prev => prev.filter(d => d.id !== id));
    if (selectedDevice?.id === id) {
      setSelectedDevice(null);
    }
    addActivity({
      category: 'device',
      title: 'Device Removed',
      description: `Removed ${target.name} (${target.ip}) from registered inventory.`,
      outcome: 'warning'
    });
  };

  const probeDevice = async (id: string): Promise<boolean> => {
    const target = devices.find(d => d.id === id);
    if (!target) return false;

    // Simulate real TCP handshake probe
    const startTime = performance.now();
    await new Promise(r => setTimeout(r, 400 + Math.random() * 300));
    const latency = Math.round(performance.now() - startTime);

    // Realistic rule: if it was offline and we didn't just wake it, it tends to stay offline unless random check
    const isNowOnline = target.status === 'online' ? Math.random() > 0.05 : Math.random() > 0.7;

    setDevices(prev =>
      prev.map(d => {
        if (d.id !== id) return d;
        return {
          ...d,
          status: isNowOnline ? 'online' : 'offline',
          lastSeen: isNowOnline ? 'Just now' : d.lastSeen,
          monitoring: {
            ...d.monitoring,
            lastLatencyMs: isNowOnline ? latency : undefined,
            lastCheckedAt: new Date().toISOString(),
            consecutiveFailures: isNowOnline ? 0 : (d.monitoring.consecutiveFailures || 0) + 1
          }
        };
      })
    );

    addActivity({
      category: 'device',
      deviceId: target.id,
      deviceName: target.name,
      title: isNowOnline ? 'TCP Health Probe Passed' : 'TCP Health Probe Timed Out',
      description: isNowOnline
        ? `Target ${target.ip}:${target.monitoring.port} (${target.monitoring.protocolPreset}) responded in ${latency}ms.`
        : `Target ${target.ip}:${target.monitoring.port} failed to reply within ${target.monitoring.timeoutMs}ms.`,
      outcome: isNowOnline ? 'success' : 'warning',
      details: {
        endpoint: `/api/v1/devices/${target.id}/probe`,
        method: 'POST',
        latencyMs: latency,
        responseCode: isNowOnline ? 200 : 504,
        rawOutput: isNowOnline ? `SYN_ACK received (RTT ${latency}ms)` : 'ERR_CONNECTION_TIMED_OUT'
      }
    });

    return isNowOnline;
  };

  // Asynchronous Wake-on-LAN Flow
  const [wakeFlow, setWakeFlow] = useState<WakeFlowState>({
    active: false,
    deviceId: null,
    deviceName: '',
    step: 'idle',
    message: '',
    progressPercent: 0,
    logs: []
  });

  const startWakeFlow = async (device: Device) => {
    setWakeFlow({
      active: true,
      deviceId: device.id,
      deviceName: device.name,
      step: 'generating',
      message: 'Constructing magic packet (6x 0xFF + 16x MAC)...',
      progressPercent: 20,
      logs: [
        `[${new Date().toLocaleTimeString()}] Target MAC: ${device.wol.macAddress || device.mac}`,
        `[${new Date().toLocaleTimeString()}] Broadcast Address: ${device.wol.broadcastAddress}:9`
      ]
    });

    // Step 1: Packet Assembly
    await new Promise(r => setTimeout(r, 600));
    setWakeFlow(prev => ({
      ...prev,
      step: 'transmitting',
      message: `Broadcasting UDP magic packet to ${device.wol.broadcastAddress}:9...`,
      progressPercent: 45,
      logs: [...prev.logs, `[${new Date().toLocaleTimeString()}] Transmitted 102 bytes via socket broadcast`]
    }));

    // Step 2: Transmitted, Probing Port
    await new Promise(r => setTimeout(r, 800));
    setWakeFlow(prev => ({
      ...prev,
      step: 'probing',
      message: `Magic packet delivered. Waiting for host bootstrap and probing TCP port ${device.monitoring.port}...`,
      progressPercent: 70,
      logs: [
        ...prev.logs,
        `[${new Date().toLocaleTimeString()}] Magic packet delivered to LAN segment.`,
        `[${new Date().toLocaleTimeString()}] Initializing TCP probe on ${device.ip}:${device.monitoring.port}...`
      ]
    }));

    // Step 3: Probe simulation (WOL waking device)
    await new Promise(r => setTimeout(r, 1800));

    // Mark device as online
    setDevices(prev =>
      prev.map(d => {
        if (d.id !== device.id) return d;
        return {
          ...d,
          status: 'online',
          lastSeen: 'Just now',
          monitoring: {
            ...d.monitoring,
            lastLatencyMs: 8,
            lastCheckedAt: new Date().toISOString(),
            consecutiveFailures: 0
          }
        };
      })
    );

    setWakeFlow(prev => ({
      ...prev,
      step: 'online_confirmed',
      message: `Device started! Verified TCP connection on port ${device.monitoring.port} (${device.monitoring.protocolPreset}).`,
      progressPercent: 100,
      logs: [
        ...prev.logs,
        `[${new Date().toLocaleTimeString()}] TCP SYN-ACK received on port ${device.monitoring.port}!`,
        `[${new Date().toLocaleTimeString()}] Device status confirmed ONLINE.`
      ]
    }));

    addActivity({
      category: 'wol',
      deviceId: device.id,
      deviceName: device.name,
      title: 'Wake-on-LAN Completed',
      description: `Dispatched magic packet to ${device.mac}. Verified host online on port ${device.monitoring.port}.`,
      outcome: 'success',
      details: {
        endpoint: `/api/v1/devices/${device.id}/wol`,
        method: 'POST',
        responseCode: 200,
        requestPayload: { mac: device.mac, broadcast: device.wol.broadcastAddress, port: 9 },
        rawOutput: 'OK: Magic packet dispatched; target ACKed on TCP probe'
      }
    });
  };

  const cancelWakeFlow = () => {
    setWakeFlow({
      active: false,
      deviceId: null,
      deviceName: '',
      step: 'idle',
      message: '',
      progressPercent: 0,
      logs: []
    });
  };

  // Asynchronous Remote Shutdown Flow
  const [shutdownFlow, setShutdownFlow] = useState<ShutdownFlowState>({
    active: false,
    deviceId: null,
    deviceName: '',
    step: 'idle',
    message: '',
    progressPercent: 0,
    logs: []
  });

  const requestShutdownConfirmation = (device: Device) => {
    setShutdownFlow({
      active: true,
      deviceId: device.id,
      deviceName: device.name,
      step: 'confirming',
      message: `Are you sure you want to shut down ${device.name}? Unsaved work will be lost.`,
      progressPercent: 10,
      logs: [
        `[${new Date().toLocaleTimeString()}] Target host: ${device.shutdown.agentHost || device.ip}:${device.shutdown.agentPort}`,
        `[${new Date().toLocaleTimeString()}] Agent status: ${device.shutdown.agentStatus}`
      ]
    });
  };

  const confirmAndExecuteShutdown = async () => {
    const target = devices.find(d => d.id === shutdownFlow.deviceId);
    if (!target) return;

    // Step 1: Connecting to Agent
    setShutdownFlow(prev => ({
      ...prev,
      step: 'connecting',
      message: `Connecting to HomeCore Agent at ${target.shutdown.agentHost || target.ip}:${target.shutdown.agentPort}...`,
      progressPercent: 30,
      logs: [
        ...prev.logs,
        `[${new Date().toLocaleTimeString()}] Initiating TLS session with HomeCore Agent...`
      ]
    }));

    await new Promise(r => setTimeout(r, 700));

    // Step 2: Authenticating
    setShutdownFlow(prev => ({
      ...prev,
      step: 'authenticating',
      message: 'Validating controller authentication token...',
      progressPercent: 50,
      logs: [
        ...prev.logs,
        `[${new Date().toLocaleTimeString()}] Sent signed HMAC token challenge to agent.`
      ]
    }));

    await new Promise(r => setTimeout(r, 650));

    // Step 3: Agent Acknowledged
    setShutdownFlow(prev => ({
      ...prev,
      step: 'acknowledged',
      message: 'Agent accepted command. Triggering OS poweroff routine...',
      progressPercent: 75,
      logs: [
        ...prev.logs,
        `[${new Date().toLocaleTimeString()}] Agent responded HTTP 200: "SHUTDOWN_SIGNAL_DISPATCHED"`,
        `[${new Date().toLocaleTimeString()}] Operating system terminating running processes...`
      ]
    }));

    await new Promise(r => setTimeout(r, 1000));

    // Step 4: Waiting for Device to Drop Offline
    setShutdownFlow(prev => ({
      ...prev,
      step: 'waiting_offline',
      message: 'Monitoring TCP port for termination...',
      progressPercent: 88,
      logs: [
        ...prev.logs,
        `[${new Date().toLocaleTimeString()}] Probing ${target.ip}:${target.monitoring.port} to verify socket shutdown...`
      ]
    }));

    await new Promise(r => setTimeout(r, 1200));

    // Mark device as offline
    setDevices(prev =>
      prev.map(d => {
        if (d.id !== target.id) return d;
        return {
          ...d,
          status: 'offline',
          lastSeen: 'A moment ago',
          monitoring: {
            ...d.monitoring,
            lastLatencyMs: undefined,
            consecutiveFailures: 1
          }
        };
      })
    );

    // Step 5: Verified Offline
    setShutdownFlow(prev => ({
      ...prev,
      step: 'offline_verified',
      message: `Device successfully powered off and confirmed offline.`,
      progressPercent: 100,
      logs: [
        ...prev.logs,
        `[${new Date().toLocaleTimeString()}] TCP connection refused / timed out.`,
        `[${new Date().toLocaleTimeString()}] Device status confirmed OFFLINE.`
      ]
    }));

    addActivity({
      category: 'shutdown',
      deviceId: target.id,
      deviceName: target.name,
      title: 'Remote Shutdown Executed',
      description: `HomeCore Agent successfully executed poweroff on ${target.name}. Host confirmed offline.`,
      outcome: 'success',
      details: {
        endpoint: `/api/v1/devices/${target.id}/shutdown`,
        method: 'POST',
        responseCode: 200,
        requestPayload: { agentHost: target.shutdown.agentHost, agentPort: target.shutdown.agentPort },
        rawOutput: 'AGENT_ACK: Process completed, socket closed gracefully'
      }
    });
  };

  const cancelShutdownFlow = () => {
    setShutdownFlow({
      active: false,
      deviceId: null,
      deviceName: '',
      step: 'idle',
      message: '',
      progressPercent: 0,
      logs: []
    });
  };

  // DDNS Operations (Single Token, Single Zone, Single Record Alias)
  const selectZone = (zoneId: string) => {
    const zone = availableZones.find(z => z.id === zoneId);
    if (!zone) return;

    // Find first record in this zone
    const zoneRecords = availableRecords.filter(r => r.zoneId === zoneId);
    const defaultRec = zoneRecords[0];

    setDDNSConfig(prev => ({
      ...prev,
      selectedZoneId: zone.id,
      selectedZoneName: zone.name,
      selectedRecordId: defaultRec ? defaultRec.id : '',
      selectedRecordName: defaultRec ? defaultRec.name : `home.${zone.name}`,
      currentDnsValue: defaultRec ? defaultRec.content : prev.currentIpv4,
      recordType: defaultRec ? defaultRec.type : 'A',
      proxied: defaultRec ? defaultRec.proxied : true,
      status: defaultRec && defaultRec.content === prev.currentIpv4 ? 'synced' : 'mismatch'
    }));

    addActivity({
      category: 'ddns',
      title: 'Cloudflare DNS Zone Selected',
      description: `Active DNS zone set to "${zone.name}".`,
      outcome: 'info'
    });
  };

  const selectRecord = (recordId: string, customName?: string) => {
    if (customName) {
      setDDNSConfig(prev => ({
        ...prev,
        selectedRecordId: 'custom',
        selectedRecordName: customName,
        status: 'mismatch'
      }));
      return;
    }

    const rec = availableRecords.find(r => r.id === recordId);
    if (!rec) return;

    setDDNSConfig(prev => ({
      ...prev,
      selectedRecordId: rec.id,
      selectedRecordName: rec.name,
      recordType: rec.type,
      proxied: rec.proxied,
      currentDnsValue: rec.content,
      status: rec.content === prev.currentIpv4 ? 'synced' : 'mismatch'
    }));

    addActivity({
      category: 'ddns',
      title: 'DDNS Target Alias Selected',
      description: `Home server alias configured to ${rec.name} (${rec.type}).`,
      outcome: 'info'
    });
  };

  const triggerDDNSSync = async () => {
    setDDNSConfig(prev => ({ ...prev, status: 'updating' }));
    await new Promise(r => setTimeout(r, 850));

    const nowIso = new Date().toISOString();

    setDDNSConfig(prev => {
      setAvailableRecords(recs =>
        recs.map(r => (r.id === prev.selectedRecordId ? { ...r, content: prev.currentIpv4 } : r))
      );

      return {
        ...prev,
        currentDnsValue: prev.currentIpv4,
        status: 'synced',
        lastCheckTime: nowIso,
        lastSyncTime: nowIso,
        lastSyncMessage: `Cloudflare DNS record ${prev.selectedRecordName} verified at ${prev.currentIpv4}`
      };
    });

    addActivity({
      category: 'ddns',
      title: 'Cloudflare DDNS Sync Completed',
      description: `Synchronized ${ddnsConfig.selectedRecordName} with WAN IP ${ddnsConfig.currentIpv4} in zone ${ddnsConfig.selectedZoneName}.`,
      outcome: 'success',
      details: {
        endpoint: `/api/v1/ddns/zones/${ddnsConfig.selectedZoneId}/records/${ddnsConfig.selectedRecordId}`,
        method: 'PUT',
        responseCode: 200,
        latencyMs: 312,
        requestPayload: {
          name: ddnsConfig.selectedRecordName,
          type: ddnsConfig.recordType,
          content: ddnsConfig.currentIpv4,
          proxied: ddnsConfig.proxied
        },
        rawOutput: `Cloudflare API 200 OK. Record ${ddnsConfig.selectedRecordName} matches detected WAN IP.`
      }
    });
  };

  const updateDDNSConfig = (newConfig: Partial<DDNSConfig>) => {
    setDDNSConfig(prev => ({ ...prev, ...newConfig }));
    addActivity({
      category: 'ddns',
      title: 'Cloudflare DDNS Settings Updated',
      description: `Updated configuration for ${newConfig.selectedRecordName || ddnsConfig.selectedRecordName}.`,
      outcome: 'info'
    });
  };

  // Activity Operations
  const clearActivities = () => {
    setActivities([]);
  };

  // System
  const refreshSystemMetrics = () => {
    setSystemMetrics({
      ...initialSystemMetrics,
      host: {
        ...initialSystemMetrics.host,
        uptimeSeconds: initialSystemMetrics.host.uptimeSeconds + Math.floor(Math.random() * 60)
      }
    });
  };

  // Settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addActivity({
      category: 'system',
      title: 'System Settings Saved',
      description: 'Updated server configuration parameters.',
      outcome: 'info'
    });
  };

  const onlineCount = devices.filter(d => d.status === 'online').length;
  const totalDevices = devices.length;

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        ambientMode,
        setAmbientMode,
        theme,
        toggleTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        devices,
        selectedDevice,
        setSelectedDevice,
        deviceModalOpen,
        setDeviceModalOpen,
        editingDevice,
        setEditingDevice,
        saveDevice,
        deleteDevice,
        probeDevice,
        wakeFlow,
        startWakeFlow,
        cancelWakeFlow,
        shutdownFlow,
        requestShutdownConfirmation,
        confirmAndExecuteShutdown,
        cancelShutdownFlow,
        ddnsConfig,
        availableZones,
        availableRecords,
        triggerDDNSSync,
        updateDDNSConfig,
        selectZone,
        selectRecord,
        activities,
        addActivity,
        clearActivities,
        systemMetrics,
        refreshSystemMetrics,
        settings,
        updateSettings,
        onlineCount,
        totalDevices
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
