import { cn } from "@/lib/utils/cn";
import type { ApiConnection } from "@/types/command";

export interface ApiConnectionStatusProps {
  connection: ApiConnection;
  className?: string;
}

const statusConfig = {
  connected: {
    label: "Connected",
    dot: "bg-white/60",
    bg: "bg-white/[0.06]",
    text: "text-white/60",
  },
  disconnected: {
    label: "Disconnected",
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
} as const;

function formatLastPing(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 30) return "Just now";
  if (diffMin < 1) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ApiConnectionStatus({ connection, className }: ApiConnectionStatusProps) {
  const config = statusConfig[connection.status];

  return (
    <div className={cn("glass rounded-[2rem] p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("rounded-xl p-2.5", config.bg)}>
            <svg className={cn("h-5 w-5", config.text)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-on-surface">API Connection</h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
              <span className={cn("text-xs font-medium", config.text)}>{config.label}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-on-surface transition-all hover:bg-white/[0.08]"
        >
          Test Connection
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Endpoint</span>
          <span className="font-mono text-xs text-on-surface truncate max-w-[200px]">
            {connection.endpoint}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">Last Ping</span>
          <span className="text-xs text-on-surface">{formatLastPing(connection.lastPing)}</span>
        </div>
      </div>
    </div>
  );
}
