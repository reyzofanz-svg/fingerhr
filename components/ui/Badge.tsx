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
          "inline-flex items-center justify-center rounded-full font-medium",
          {
            // Variants
            "bg-surface-container-high text-on-surface-variant":
              variant === "default",
            "bg-emerald-500/10 text-emerald-400": variant === "success",
            "bg-yellow-500/10 text-yellow-400": variant === "warning",
            "bg-error/10 text-error": variant === "error",
            "bg-blue-500/10 text-blue-400": variant === "info",

            // Sizes
            "px-2 py-0.5 text-xs": size === "sm",
            "px-2.5 py-1 text-sm": size === "md",
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
