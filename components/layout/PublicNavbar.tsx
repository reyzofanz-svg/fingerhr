import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export interface PublicNavbarProps {
  className?: string;
}

export function PublicNavbar({ className }: PublicNavbarProps) {
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 max-w-[1440px] mx-auto bg-background/70 backdrop-blur-md border-b border-white/10 shadow-sm transition-all duration-300 ease-in-out",
        className
      )}
    >
      <div className="flex items-center gap-8">
        <Link className="text-xl md:text-2xl font-bold text-on-surface tracking-tighter hover:opacity-90 transition-opacity" href="/">
          FingerHR
        </Link>
        <div className="hidden md:flex gap-6">
          <Link className="font-mono text-xs text-primary font-bold tracking-wider uppercase" href="#">
            Platform
          </Link>
          <Link className="font-mono text-xs text-on-surface-variant hover:text-on-surface transition-colors tracking-wider uppercase" href="#">
            Features
          </Link>
          <Link className="font-mono text-xs text-on-surface-variant hover:text-on-surface transition-colors tracking-wider uppercase" href="#">
            API
          </Link>
          <Link className="font-mono text-xs text-on-surface-variant hover:text-on-surface transition-colors tracking-wider uppercase" href="#">
            Pricing
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          className="hidden md:block font-mono text-xs text-on-surface-variant hover:text-on-surface transition-colors tracking-wider uppercase"
          href="/login"
        >
          Login
        </Link>
        <Link
          className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#3b82f6] text-white px-6 py-2 font-mono text-xs font-bold tracking-wider uppercase transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
          href="/login"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
