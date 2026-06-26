export function TechnicalShowcase() {
  return (
    <section className="px-6 py-20 max-w-[1440px] mx-auto mt-20 relative">
      <div className="glass rounded-[3rem] p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-primary-container)/0.05,_transparent_70%)] pointer-events-none" />
        
        <h2 className="text-3xl md:text-4xl font-semibold text-on-surface mb-12 relative z-10 text-center tracking-tight">
          The Biometric Bridge
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 w-full max-w-3xl relative z-10">
          {/* Terminal Side */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-surface-container-high border border-white/10 flex items-center justify-center shadow-lg group hover:border-primary/30 transition-colors">
              <svg className="h-12 w-12 text-on-surface group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.225a27.068 27.068 0 0 0-2.625.658A21.095 21.095 0 0 1 12 2.75c1.72 0 3.378.263 4.97.758.553.195 1.14.195 1.694 0a27.069 27.069 0 0 0-2.625-.658A21.095 21.095 0 0 1 12 2.75c-1.72 0-3.378.263-4.97.758ZM12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">Fingerspot Terminal</span>
          </div>
          
          {/* Bridge Connection */}
          <div className="flex-1 w-full sm:w-auto h-[2px] bg-white/10 relative flex items-center justify-center my-4 sm:my-0">
            <div className="absolute left-0 w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <div className="w-8 h-8 rounded-full bg-background border border-primary/50 flex items-center justify-center glow-indigo z-10">
              <svg className="h-4 w-4 text-primary animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ animationDuration: '3s' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </div>
          </div>
          
          {/* Cloud Side */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-surface-container-high border border-white/10 flex items-center justify-center shadow-lg group hover:border-primary/30 transition-colors">
              <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
              </svg>
            </div>
            <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">FingerHR Cloud</span>
          </div>
        </div>
      </div>
    </section>
  );
}
