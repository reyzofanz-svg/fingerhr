"use client";

import Link from "next/link";
import { SplineScene } from "@/components/ui/splite";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0a0818]">
      <div className="relative z-10 mx-auto max-w-[1440px] w-full px-6 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
        {/* Left: Text content */}
        <div className="flex flex-col gap-8 relative z-20">
          <div className="inline-flex items-center gap-3 w-fit px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
            </span>
            <span className="font-mono text-xs text-indigo-400 font-semibold tracking-wider">REAL-TIME SYNC</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight leading-[1.02]">
            Biometrics
            <br />
            meets{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              the Cloud.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-lg leading-relaxed">
            Bridge Fingerspot biometric hardware with modern cloud infrastructure.
            Real-time sync, API-first architecture, enterprise-grade security.
          </p>

          <div className="flex flex-wrap gap-5 mt-3">
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-9 py-4 text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:-translate-y-1"
            >
              <span>Get Started</span>
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-3 rounded-2xl border border-white/10 px-9 py-4 text-sm font-bold text-slate-300 transition-all duration-300 hover:bg-white/5 hover:border-white/20 hover:-translate-y-1"
            >
              See How It Works
            </a>
          </div>

          <div className="flex items-center gap-8 mt-8 text-sm text-slate-500">
            {["Free trial", "No credit card", "Setup in 5 min"].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <svg className="h-4.5 w-4.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 3D Robot — no box, floating freely */}
        <div className="relative h-[500px] lg:h-[700px] w-full z-10">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}
