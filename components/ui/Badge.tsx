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
            "bg-white/[0.06] text-white/60 border-white/[0.08]": variant === "default" || variant === "success" || variant === "warning" || variant === "error" || variant === "info",
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
