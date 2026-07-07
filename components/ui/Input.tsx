import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-white/70"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            className={cn(
              "h-11 w-full rounded-xl border bg-white/[0.03] text-sm text-white placeholder-white/20 transition-all",
              "focus:outline-none focus:ring-2",
              error
                ? "border-white/[0.15] focus:border-white/20 focus:ring-white/10"
                : "border-white/[0.08] focus:border-white/[0.15] focus:bg-white/[0.05] focus:ring-white/10",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              !leftIcon && !rightIcon && "px-4",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-white/50">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-white/25">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
