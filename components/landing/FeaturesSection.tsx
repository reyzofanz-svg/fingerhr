"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: "Real-time Sync",
    description: "Data flows instantly from terminals to the cloud. Webhooks notify your systems the millisecond a punch occurs.",
    gradient: "from-blue-500 to-cyan-400",
    bgGlow: "bg-blue-500/10",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: "Enterprise Security",
    description: "End-to-end encryption, SOC2 compliance, and role-based access control. Your biometric data stays safe.",
    gradient: "from-emerald-500 to-teal-400",
    bgGlow: "bg-emerald-500/10",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
    title: "API First",
    description: "Modern REST endpoints, comprehensive docs, SDKs for major languages. Built for developers, by developers.",
    gradient: "from-purple-500 to-pink-400",
    bgGlow: "bg-purple-500/10",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Smart Reports",
    description: "Automated daily reports with Excel export. Track attendance, overtime, and schedules in one dashboard.",
    gradient: "from-amber-500 to-orange-400",
    bgGlow: "bg-amber-500/10",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: "Telegram Alerts",
    description: "Instant notifications via Telegram when employees clock in or out. Customizable message templates.",
    gradient: "from-sky-500 to-blue-400",
    bgGlow: "bg-sky-500/10",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Flexible Schedules",
    description: "Create weekly schedules, assign shifts per day, set overtime rules. Works for any work pattern.",
    gradient: "from-rose-500 to-red-400",
    bgGlow: "bg-rose-500/10",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      <div className="relative rounded-[2rem] p-8 glass transition-all duration-300 hover:border-white/15 h-full">
        {/* Hover glow */}
        <div className={`absolute inset-0 rounded-[2rem] ${feature.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />

        <div className="relative z-10">
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white mb-5 shadow-lg`}>
            {feature.icon}
          </div>
          <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">
            {feature.title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-50px" });

  return (
    <section id="features" className="relative px-6 py-24 max-w-[1440px] mx-auto">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none" />

      <div ref={headerRef} className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 mb-6"
        >
          <span className="font-mono text-xs text-indigo-400 font-semibold tracking-wider">FEATURES</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
        >
          Enterprise-Grade
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Infrastructure
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base text-slate-400 max-w-2xl mx-auto"
        >
          Built for scale, security, and developer experience. FingerHR handles the complexity of biometric hardware communication.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}
