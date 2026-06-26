export type CommandType =
  | "get_attlog"
  | "get_userinfo"
  | "get_all_pin"
  | "set_time"
  | "restart_device"
  | "set_userinfo"
  | "delete_userinfo"
  | "reg_online";

export type CommandStatus = "pending" | "success" | "failed" | "timeout";

export interface CommandHistory {
  id: string;
  deviceCloudId: string;
  deviceName: string;
  commandType: CommandType;
  transId: string;
  status: CommandStatus;
  requestTime: string;
  completedTime: string | null;
  duration: string | null;
  errorMessage: string | null;
}

export interface ApiConnection {
  status: "connected" | "disconnected" | "error";
  lastPing: string;
  apiKey: string;
  endpoint: string;
}
