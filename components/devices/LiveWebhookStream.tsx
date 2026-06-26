import { cn } from "@/lib/utils/cn";

export interface WebhookEntry {
  time: string;
  method: string;
  path: string;
  status: number;
  message?: string;
}

export interface LiveWebhookStreamProps {
  entries: WebhookEntry[];
  className?: string;
}

const statusColor: Record<number, string> = {
  200: "text-emerald-400",
  201: "text-emerald-400",
  400: "text-amber-400",
  401: "text-red-400",
  404: "text-amber-400",
  500: "text-red-400",
};

export function LiveWebhookStream({ entries, className }: LiveWebhookStreamProps) {
  return (
    <div className={cn("glass rounded-[2rem] overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-on-surface">Live Webhook Stream</h3>
        </div>
        <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs font-mono text-on-surface-variant">
          Auto-refresh
        </span>
      </div>

      {/* Terminal Content */}
      <div className="bg-surface-container-lowest/50 p-4 font-mono text-xs">
        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {entries.map((entry, index) => (
            <div key={index} className="flex items-start gap-3 leading-relaxed">
              <span className="shrink-0 text-on-surface-variant/40">{entry.time}</span>
              <span className={cn(
                "shrink-0 font-medium",
                entry.method === "POST" ? "text-primary" : "text-secondary"
              )}>
                [{entry.method}]
              </span>
              <span className="text-on-surface-variant">/api{entry.path}</span>
              <span className={cn("shrink-0 font-medium", statusColor[entry.status] ?? "text-on-surface-variant")}>
                {entry.status}
              </span>
              {entry.message && (
                <span className="text-on-surface-variant/60">- {entry.message}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
