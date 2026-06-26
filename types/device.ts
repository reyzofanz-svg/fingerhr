export type DeviceStatus = "online" | "offline" | "error" | "syncing";

export type DeviceType = "fingerprint" | "face" | "vein" | "hybrid";

export interface Device {
  cloudId: string;
  name: string;
  type: DeviceType;
  ip: string;
  status: DeviceStatus;
  timezone: string;
  lastSync: string | null;
  location: string;
  firmware: string;
}

export interface DeviceStats {
  total: number;
  online: number;
  offline: number;
  error: number;
}
