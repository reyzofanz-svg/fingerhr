import { cn } from "@/lib/utils/cn";
import type { DeviceStatus } from "@/types/device";

export interface DeviceStatusBadgeProps {
  status: DeviceStatus;
  className?: string;
}

const statusConfig: Record<DeviceStatus, { label: string; dot: string; bg: string; text: string }> = {
  online: {
    label: "Online",
    dot: "bg-white/60",
    bg: "bg-white/[0.06]",
    text: "text-white/60",
  },
  offline: {
    label: "Offline",
    dot: "bg-slate-500",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
  },
  error: {
    label: "Error",
    dot: "bg-red-500",
    bg: "bg-red-500/10",
    text: "text-red-400",
  },
  syncing: {
    label: "Syncing",
    dot: "bg-white/40",
    bg: "bg-white/[0.06]",
    text: "text-white/50",
  },
};

export function DeviceStatusBadge({ status, className }: DeviceStatusBadgeProps) {
  const config = statusConfig[status.toLowerCase() as DeviceStatus] ?? statusConfig.offline;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
