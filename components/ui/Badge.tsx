import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold border",
          {
            "bg-white/[0.04] text-slate-400 border-white/[0.06]": variant === "default",
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": variant === "success",
            "bg-amber-500/10 text-amber-400 border-amber-500/20": variant === "warning",
            "bg-red-500/10 text-red-400 border-red-500/20": variant === "error",
            "bg-blue-500/10 text-blue-400 border-blue-500/20": variant === "info",
            "px-2 py-0.5 text-xs": size === "sm",
            "px-2.5 py-1 text-xs": size === "md",
          },
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
