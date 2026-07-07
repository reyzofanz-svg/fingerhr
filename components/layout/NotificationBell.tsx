"use client";

import { useEffect, useRef, useState } from "react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource("/api/notifications/stream");
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "CONNECTED") {
          setIsConnected(true);
          return;
        }
        setNotifications((prev) => [data, ...prev].slice(0, 50));
      } catch {
        // ignore parse errors (keepalive comments)
      }
    };

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      // Reconnect after 3s
      setTimeout(() => {
        if (eventSourceRef.current === es) {
          const newEs = new EventSource("/api/notifications/stream");
          eventSourceRef.current = newEs;
        }
      }, 3000);
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.length;

  function markAllRead() {
    setNotifications([]);
  }

  function formatTime(ts: string) {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch {
      return "";
    }
  }

  function typeIcon(type: string) {
    if (type === "ATTENDANCE_IN") return { emoji: "\u2705", color: "text-white/60" };
    if (type === "ATTENDANCE_OUT") return { emoji: "\u23F5\uFE0F", color: "text-white/50" };
    if (type === "PERMISSION_PENDING") return { emoji: "\u23F3", color: "text-white/40" };
    return { emoji: "\u2705", color: "text-white/60" };
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="relative rounded-full p-2 text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0e0e10]/95 backdrop-blur-xl shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifikasi</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-white/50 transition-colors hover:text-white/70"
              >
                Tandai sudah dibaca
              </button>
            )}
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-1.5 px-4 py-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-white/60" : "bg-white/20"}`} />
            <span className="text-[10px] text-white/30">
              {isConnected ? "Live" : "Reconnecting..."}
            </span>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-white/30">
                Belum ada notifikasi
              </div>
            ) : (
              notifications.map((n) => {
                const { emoji, color } = typeIcon(n.type);
                return (
                  <div
                    key={n.id}
                    className="border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 text-sm ${color}`}>{emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{n.title}</p>
                        <p className="mt-0.5 text-xs text-white/40">{n.message}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-white/25">
                        {formatTime(n.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
