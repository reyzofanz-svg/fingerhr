"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const navItems = [
  {
    label: "Beranda",
    href: "/mobile",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#ffffff" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Absen",
    href: "/mobile/absen",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#ffffff" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    label: "Riwayat",
    href: "/mobile/history",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#ffffff" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    label: "Izin",
    href: "/mobile/permissions",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#ffffff" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: "Akun",
    href: "/mobile/settings",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#ffffff" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export function BottomNavBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/mobile") return pathname === "/mobile";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="glass-strong border-t border-white/5">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-16 h-full gap-1"
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={active ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {item.icon(active)}
                </motion.div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    active ? "text-white" : "text-white/40"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
