import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center gap-1.5 text-sm text-white/25", className)}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && (
            <svg className="h-3.5 w-3.5 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-white/60">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
