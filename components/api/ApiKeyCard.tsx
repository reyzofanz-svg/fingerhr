"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface ApiKeyCardProps {
  apiKey: string;
  className?: string;
}

export function ApiKeyCard({ apiKey, className }: ApiKeyCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className={cn("glass rounded-[2rem] p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-tertiary/10 p-2.5 text-tertiary">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-on-surface">API Key</h3>
            <p className="text-xs text-on-surface-variant">Used for Fingerspot API authentication</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsRevealed(!isRevealed)}
          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-on-surface transition-all hover:bg-white/[0.08]"
        >
          {isRevealed ? "Hide" : "Reveal"}
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2 rounded-xl bg-surface-container-lowest/50 border border-white/[0.08] px-4 py-3">
          <code className="flex-1 font-mono text-sm text-on-surface select-all break-all">
            {isRevealed ? "fsk_live_abc123def456ghi789jkl012mno345" : apiKey}
          </code>
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-white/[0.05] hover:text-on-surface"
            aria-label="Copy API key"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-on-surface-variant/60">
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
          Encrypted at rest
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
          Never exposed to client
        </span>
      </div>
    </div>
  );
}
