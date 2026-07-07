import { cn } from "@/lib/utils/cn";
import type { CommandHistory, CommandStatus } from "@/types/command";

export interface RecentCommandsProps {
  commands: CommandHistory[];
  className?: string;
}

const statusConfig: Record<CommandStatus, { label: string; dot: string; bg: string; text: string }> = {
  pending: {
    label: "Pending",
    dot: "bg-blue-500",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
  },
  success: {
    label: "Success",
    dot: "bg-white/60",
    bg: "bg-white/[0.06]",
    text: "text-white/60",
  },
  failed: {
    label: "Failed",
    dot: "bg-red-500",
    bg: "bg-red-500/10",
    text: "text-red-400",
  },
  timeout: {
    label: "Timeout",
    dot: "bg-white/40",
    bg: "bg-white/[0.06]",
    text: "text-white/50",
  },
};

const commandTypeLabels: Record<string, string> = {
  get_attlog: "Get Attlog",
  get_userinfo: "Get Userinfo",
  get_all_pin: "Get All PIN",
  set_time: "Set Time",
  restart_device: "Restart Device",
  set_userinfo: "Set Userinfo",
  delete_userinfo: "Delete Userinfo",
  reg_online: "Reg Online",
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

export function RecentCommands({ commands, className }: RecentCommandsProps) {
  return (
    <div className={cn("glass rounded-[2rem] overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
        <h3 className="text-sm font-semibold text-on-surface">Recent Commands</h3>
        <button
          type="button"
          className="text-xs font-medium text-primary transition-colors hover:text-primary-container"
        >
          View All
        </button>
      </div>

      {/* Commands List */}
      <div className="divide-y divide-white/[0.05]">
        {commands.slice(0, 5).map((cmd) => {
          const config = statusConfig[cmd.status];
          return (
            <div key={cmd.id} className="px-6 py-4 transition-colors hover:bg-white/[0.02]">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-on-surface">
                      {commandTypeLabels[cmd.commandType] ?? cmd.commandType}
                    </p>
                    <span className="text-xs text-on-surface-variant/40">-</span>
                    <span className="truncate text-xs text-on-surface-variant">{cmd.deviceName}</span>
                  </div>
                  <p className="mt-1 text-xs text-on-surface-variant/60">
                    Sync: {cmd.deviceCloudId} - {formatTimeAgo(cmd.requestTime)}
                  </p>
                  {cmd.duration && (
                    <p className="mt-0.5 text-xs text-on-surface-variant/40">
                      Execution Time: {cmd.duration}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                    config.bg,
                    config.text
                  )}
                >
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {commands.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-sm text-on-surface-variant">No commands sent yet</p>
        </div>
      )}
    </div>
  );
}
