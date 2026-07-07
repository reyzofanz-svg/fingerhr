import { cn } from "@/lib/utils/cn";
import type { DeviceStats as DeviceStatsType } from "@/types/device";

export interface DeviceStatsProps {
  stats: DeviceStatsType;
  className?: string;
}

export function DeviceStats({ stats, className }: DeviceStatsProps) {
  return (
    <div className={cn("flex items-center gap-3 text-sm", className)}>
      <span className="text-on-surface-variant">
        <span className="font-semibold text-white/60">{stats.online} Online</span>
        <span className="mx-2 text-outline">|</span>
        <span className="text-on-surface-variant">{stats.offline} Offline</span>
      </span>
      {stats.error > 0 && (
        <>
          <span className="text-outline">|</span>
          <span className="text-red-400">{stats.error} Error</span>
        </>
      )}
    </div>
  );
}
