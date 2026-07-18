"use client";

import { motion } from "framer-motion";

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export function MobileHeader({
  title,
  subtitle,
  rightAction,
  showBack = false,
  onBack,
}: MobileHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 glass border-b border-white/5"
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-white font-semibold text-base">{title}</h1>
            {subtitle && (
              <p className="text-white/50 text-xs">{subtitle}</p>
            )}
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </motion.header>
  );
}
