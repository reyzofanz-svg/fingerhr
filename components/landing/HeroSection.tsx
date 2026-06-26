import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative px-6 py-20 max-w-[1440px] mx-auto min-h-[80vh] flex flex-col md:flex-row items-center justify-between gap-12 overflow-visible">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none z-0" />
      
      <div className="flex-1 flex flex-col items-start gap-6 z-10 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10">
          <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          <span className="font-mono text-xs text-primary font-bold">New: Real-time Webhooks</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface tracking-tight leading-tight">
          Biometrics meets <br />
          <span className="bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent">
            the Cloud.
          </span>
        </h1>
        
        <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
          Seamlessly bridge Fingerspot biometric hardware with modern cloud infrastructure. Real-time sync, API-first architecture, and enterprise-grade security.
        </p>
        
        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Link
            className="rounded-full bg-gradient-to-r from-[#6366f1] to-[#3b82f6] text-white px-8 py-3 text-base font-bold transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
            href="/login"
          >
            Get Started
          </Link>
          <a
            className="rounded-full border border-white/10 text-on-surface px-8 py-3 text-base font-bold flex items-center gap-2 transition-all hover:bg-white/5 hover:text-white"
            href="#"
          >
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
            </svg>
            View Documentation
          </a>
        </div>
      </div>
      
      <div className="flex-1 relative z-10 w-full max-w-lg flex justify-end">
        <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden glass glow-indigo flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
          <Image
            alt="Fingerspot Biometric Device 3D Render"
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
            src="/device-render.png"
            width={500}
            height={500}
            priority
          />
        </div>
      </div>
    </section>
  );
}
