"use client";

import { cn } from "@/lib/utils/cn";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "./ThemeToggle";

export interface HeaderProps {
  className?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}

export function Header({ className, title, description, actions, onMenuClick }: HeaderProps) {
  void title;
  void description;
  return (
    <header
      className={cn(
        "relative flex h-16 items-center justify-between border-b border-white/[0.06] bg-[#08080a]/60 backdrop-blur-xl px-6",
        className
      )}
    >
      {/* Subtle line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-white/40 hover:bg-white/[0.05] hover:text-white/70 transition-all lg:hidden"
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Search bar */}
        <div className="relative hidden md:block">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search devices, logs..."
            className="h-10 w-80 rounded-xl border border-white/[0.06] bg-white/[0.03] pl-10 pr-4 text-sm text-white placeholder-white/20 transition-all focus:border-white/[0.12] focus:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {actions}

        {/* Nav links */}
        <div className="hidden items-center gap-1 lg:flex">
          <a
            href="#"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70"
          >
            Docs
          </a>
          <a
            href="#"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/70"
          >
            API
          </a>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-white/60 shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
          <span className="text-xs font-medium text-white/60">Live</span>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationBell />

        {/* User avatar */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] border border-white/[0.1] text-sm font-bold text-white/70 transition-all hover:bg-white/[0.12] hover:text-white hover:scale-105"
        >
          A
        </button>
      </div>
    </header>
  );
}
