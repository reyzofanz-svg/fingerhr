"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Connect Device",
    description: "Plug in your Fingerspot terminal. FingerHR auto-detects and syncs employee data via cloud API.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    glowColor: "rgba(255,255,255,0.08)",
  },
  {
    num: "02",
    title: "Set Schedule",
    description: "Create weekly schedules, assign shifts per day. Define overtime rules and break times.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    glowColor: "rgba(255,255,255,0.08)",
  },
  {
    num: "03",
    title: "Auto Sync",
    description: "Employees scan their fingerprint. Data syncs to cloud in real-time via webhooks. Zero manual work.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    glowColor: "rgba(255,255,255,0.08)",
  },
  {
    num: "04",
    title: "Get Reports",
    description: "Detailed daily reports with Excel export. Track attendance, overtime, late arrivals, and more.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    glowColor: "rgba(255,255,255,0.08)",
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex items-center gap-8"
    >
      {/* Number circle */}
      <div className="relative shrink-0">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center shadow-lg"
          style={{ boxShadow: `0 0 40px ${step.glowColor}` }}>
          <span className="text-2xl font-bold text-white">{step.num}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 rounded-[2rem] p-8 glass group hover:border-white/15 transition-all duration-300">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08] text-white/80 mb-4">
          {step.icon}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
        <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-50px" });

  return (
    <section className="relative px-6 py-24 max-w-[1440px] mx-auto">
      {/* Background */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white/[0.02] blur-[120px] pointer-events-none" />

      <div ref={headerRef} className="text-center mb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] mb-6"
        >
          <span className="font-mono text-xs text-white/60 font-semibold tracking-wider">HOW IT WORKS</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
        >
          Up and running
          <br />
          <span className="bg-gradient-to-r from-white/80 to-white/40 bg-clip-text text-transparent">
            in 4 steps
          </span>
        </motion.h2>
      </div>

      <div ref={containerRef} className="relative z-10 max-w-3xl mx-auto space-y-8">
        {/* Connecting line */}
        <div className="absolute left-[39px] top-10 bottom-10 w-px bg-gradient-to-b from-white/20 via-white/10 to-white/20" />

        {steps.map((step, i) => (
          <StepCard key={step.num} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}
