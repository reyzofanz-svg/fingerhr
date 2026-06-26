export interface PublicFooterProps {
  className?: string;
}

export function PublicFooter({ className }: PublicFooterProps) {
  return (
    <footer
      className={`w-full py-10 px-6 flex flex-col md:flex-row justify-between items-center max-w-[1440px] mx-auto bg-background border-t border-white/5 transition-opacity duration-200 z-20 relative mt-auto ${className ?? ""}`}
    >
      <div className="text-sm font-bold text-on-surface mb-4 md:mb-0">
        © 2026 FingerHR. Precision biometric intelligence.
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <a className="font-mono text-xs text-outline hover:text-on-surface transition-colors hover:underline" href="#">Privacy Policy</a>
        <a className="font-mono text-xs text-outline hover:text-on-surface transition-colors hover:underline" href="#">Terms of Service</a>
        <a className="font-mono text-xs text-outline hover:text-on-surface transition-colors hover:underline" href="#">Security</a>
        <a className="font-mono text-xs text-outline hover:text-on-surface transition-colors hover:underline" href="#">Status</a>
        <a className="font-mono text-xs text-outline hover:text-on-surface transition-colors hover:underline" href="#">Github</a>
      </div>
    </footer>
  );
}
