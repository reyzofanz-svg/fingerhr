import { cn } from "@/lib/utils/cn";
import type { CommandType } from "@/types/command";

export interface QuickActionsProps {
  deviceCloudId: string;
  deviceName: string;
  disabled?: boolean;
  className?: string;
}

interface CommandAction {
  type: CommandType;
  label: string;
  icon: string;
}

const commandActions: CommandAction[] = [
  {
    type: "get_attlog",
    label: "Get Attlog",
    icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z",
  },
  {
    type: "get_userinfo",
    label: "Get Userinfo",
    icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z",
  },
  {
    type: "get_all_pin",
    label: "Get All PIN",
    icon: "M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z",
  },
  {
    type: "set_time",
    label: "Set Time",
    icon: "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  },
  {
    type: "restart_device",
    label: "Restart",
    icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",
  },
];

export function QuickActions({ deviceCloudId, deviceName, disabled, className }: QuickActionsProps) {
  void deviceCloudId;
  return (
    <div className={cn("glass rounded-[2rem] overflow-hidden", className)}>
      <div className="border-b border-white/[0.08] px-6 py-4">
        <h3 className="text-sm font-semibold text-on-surface">Quick Actions</h3>
        <p className="mt-0.5 text-xs text-on-surface-variant">{deviceName}</p>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-5 gap-2">
          {commandActions.map((action) => (
            <button
              key={action.type}
              type="button"
              disabled={disabled}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-center transition-all",
                "hover:border-primary/30 hover:bg-primary/5 hover:glow-indigo-sm",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-on-surface-variant transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                </svg>
              </div>
              <p className="text-xs font-medium text-on-surface group-hover:text-primary">
                {action.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
