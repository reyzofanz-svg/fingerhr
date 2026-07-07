"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: { icon: "h-7 w-7", text: "text-base", badge: "text-[8px] px-1.5 py-0.5" },
    md: { icon: "h-9 w-9", text: "text-lg", badge: "text-[9px] px-2 py-0.5" },
    lg: { icon: "h-12 w-12", text: "text-2xl", badge: "text-[10px] px-2.5 py-1" },
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Fingerprint icon */}
      <div className={`relative ${sizes[size].icon} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-white/[0.08] rounded-xl blur-md" />
        <div className="relative h-full w-full bg-white/[0.1] backdrop-blur-sm border border-white/[0.12] rounded-xl flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
            <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
            <path d="M2 12a10 10 0 0 1 18-6" />
            <path d="M2 16h.01" />
            <path d="M21.8 16c.2-2 .131-5.354 0-6" />
            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
            <path d="M8.65 22c.21-.66.45-1.32.57-2" />
            <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
          </svg>
        </div>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex items-center gap-2">
          <span className={`${sizes[size].text} font-bold text-white tracking-tight`}>
            FingerHR
          </span>
          <span className={`${sizes[size].badge} rounded-full bg-white/[0.08] text-white/50 font-semibold border border-white/[0.1]`}>
            MODERN
          </span>
        </div>
      )}
    </div>
  );
}
