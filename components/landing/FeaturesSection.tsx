"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: "Real-time Sync",
    description: "Data flows instantly from terminals to the cloud. Webhooks notify your systems the millisecond a punch occurs.",
    glowColor: "rgba(255,255,255,0.06)",
    visual: "sync",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
    title: "Enterprise Security",
    description: "End-to-end encryption, SOC2 compliance, and role-based access control. Your biometric data stays safe.",
    glowColor: "rgba(255,255,255,0.06)",
    visual: "security",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
    title: "API First",
    description: "Modern REST endpoints, comprehensive docs, SDKs for major languages. Built for developers, by developers.",
    glowColor: "rgba(255,255,255,0.06)",
    visual: "api",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Smart Reports",
    description: "Automated daily reports with Excel export. Track attendance, overtime, and schedules in one dashboard.",
    glowColor: "rgba(255,255,255,0.06)",
    visual: "reports",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: "Telegram Alerts",
    description: "Instant notifications via Telegram when employees clock in or out. Customizable message templates.",
    glowColor: "rgba(255,255,255,0.06)",
    visual: "telegram",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Flexible Schedules",
    description: "Create weekly schedules, assign shifts per day, set overtime rules. Works for any work pattern.",
    glowColor: "rgba(255,255,255,0.06)",
    visual: "schedule",
  },
];

function FeatureVisual({ type }: { type: string }) {
  const visuals: Record<string, React.ReactNode> = {
    sync: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <defs>
          <linearGradient id="sync-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="25" rx="25" ry="12" fill="url(#sync-g)" opacity="0.15" />
        <ellipse cx="50" cy="22" rx="18" ry="10" fill="url(#sync-g)" opacity="0.1" />
        <ellipse cx="70" cy="22" rx="16" ry="9" fill="url(#sync-g)" opacity="0.1" />
        <path d="M55 55 L55 35 L48 42 M55 35 L62 42" stroke="url(#sync-g)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="35" y="55" width="50" height="20" rx="4" fill="url(#sync-g)" opacity="0.1" stroke="url(#sync-g)" strokeWidth="0.5" />
        <circle cx="45" cy="65" r="3" fill="url(#sync-g)" opacity="0.3" />
        <circle cx="55" cy="65" r="3" fill="url(#sync-g)" opacity="0.3" />
        <circle cx="65" cy="65" r="3" fill="url(#sync-g)" opacity="0.3" />
      </svg>
    ),
    security: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <defs>
          <linearGradient id="sec-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path d="M60 10 L90 25 L90 50 Q90 70 60 75 Q30 70 30 50 L30 25 Z" fill="url(#sec-g)" opacity="0.1" stroke="url(#sec-g)" strokeWidth="1" />
        <rect x="50" y="38" width="20" height="16" rx="3" fill="url(#sec-g)" opacity="0.2" />
        <path d="M55 38 L55 32 Q55 26 60 26 Q65 26 65 32 L65 38" fill="none" stroke="url(#sec-g)" strokeWidth="1.5" />
        <circle cx="60" cy="46" r="2" fill="url(#sec-g)" opacity="0.5" />
      </svg>
    ),
    api: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <defs>
          <linearGradient id="api-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <text x="20" y="50" fontFamily="monospace" fontSize="28" fill="url(#api-g)" opacity="0.3">{"{"}</text>
        <text x="85" y="50" fontFamily="monospace" fontSize="28" fill="url(#api-g)" opacity="0.3">{"}"}</text>
        <text x="60" y="48" fontFamily="monospace" fontSize="12" fill="url(#api-g)" opacity="0.4" textAnchor="middle" fontWeight="bold">API</text>
        <circle cx="40" cy="65" r="2" fill="url(#api-g)" opacity="0.2" />
        <circle cx="50" cy="65" r="2" fill="url(#api-g)" opacity="0.3" />
        <circle cx="60" cy="65" r="2" fill="url(#api-g)" opacity="0.4" />
        <circle cx="70" cy="65" r="2" fill="url(#api-g)" opacity="0.3" />
        <circle cx="80" cy="65" r="2" fill="url(#api-g)" opacity="0.2" />
      </svg>
    ),
    reports: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <defs>
          <linearGradient id="rpt-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect x="15" y="45" width="12" height="25" rx="2" fill="url(#rpt-g)" opacity="0.15" />
        <rect x="32" y="30" width="12" height="40" rx="2" fill="url(#rpt-g)" opacity="0.2" />
        <rect x="49" y="20" width="12" height="50" rx="2" fill="url(#rpt-g)" opacity="0.25" />
        <rect x="66" y="35" width="12" height="35" rx="2" fill="url(#rpt-g)" opacity="0.2" />
        <rect x="83" y="15" width="12" height="55" rx="2" fill="url(#rpt-g)" opacity="0.3" />
        <path d="M21 42 L38 28 L55 18 L72 32 L89 13" stroke="url(#rpt-g)" strokeWidth="1.5" fill="none" opacity="0.4" />
      </svg>
    ),
    telegram: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <defs>
          <linearGradient id="tg-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect x="40" y="8" width="40" height="64" rx="8" fill="url(#tg-g)" opacity="0.1" stroke="url(#tg-g)" strokeWidth="0.8" />
        <rect x="45" y="18" width="30" height="40" rx="2" fill="url(#tg-g)" opacity="0.08" />
        <rect x="48" y="22" width="20" height="8" rx="4" fill="url(#tg-g)" opacity="0.2" />
        <rect x="52" y="34" width="18" height="8" rx="4" fill="url(#tg-g)" opacity="0.15" />
        <rect x="48" y="46" width="22" height="8" rx="4" fill="url(#tg-g)" opacity="0.2" />
        <circle cx="73" cy="16" r="5" fill="url(#tg-g)" opacity="0.4" />
      </svg>
    ),
    schedule: (
      <svg viewBox="0 0 120 80" className="w-full h-full">
        <defs>
          <linearGradient id="sch-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <rect x="20" y="15" width="80" height="55" rx="6" fill="url(#sch-g)" opacity="0.08" stroke="url(#sch-g)" strokeWidth="0.8" />
        <rect x="20" y="15" width="80" height="14" rx="6" fill="url(#sch-g)" opacity="0.12" />
        <line x1="20" y1="40" x2="100" y2="40" stroke="url(#sch-g)" strokeWidth="0.3" opacity="0.3" />
        <line x1="20" y1="55" x2="100" y2="55" stroke="url(#sch-g)" strokeWidth="0.3" opacity="0.3" />
        <line x1="47" y1="29" x2="47" y2="70" stroke="url(#sch-g)" strokeWidth="0.3" opacity="0.3" />
        <line x1="73" y1="29" x2="73" y2="70" stroke="url(#sch-g)" strokeWidth="0.3" opacity="0.3" />
        <rect x="50" y="43" width="20" height="10" rx="3" fill="url(#sch-g)" opacity="0.25" />
      </svg>
    ),
  };

  return (
    <div className="w-full h-28 opacity-70 group-hover:opacity-100 transition-opacity duration-500">
      {visuals[type]}
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.12, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      className="group relative"
    >
      <div className="relative rounded-[2.5rem] p-7 glass-strong transition-all duration-500 hover:border-white/20 h-full hover:-translate-y-2">
        {/* Hover glow */}
        <div 
          className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl"
          style={{ background: `radial-gradient(circle at center, ${feature.glowColor}, transparent 70%)` }}
        />

        <div className="relative z-10">
          {/* Visual area */}
          <div className="mb-5 rounded-2xl overflow-hidden bg-white/[0.03] border border-white/[0.06] p-3">
            <FeatureVisual type={feature.visual} />
          </div>

          {/* Icon */}
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08] text-white/80 mb-5">
            {feature.icon}
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
            {feature.title}
          </h3>
          <p className="text-sm text-white/40 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative px-6 py-32 max-w-[1440px] mx-auto">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.02] blur-[200px] pointer-events-none" />

      <div ref={headerRef} className="text-center mb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm mb-8"
        >
          <span className="font-mono text-xs text-white/60 font-semibold tracking-wider">FEATURES</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
        >
          Enterprise-Grade
          <br />
          <span className="bg-gradient-to-r from-white/80 to-white/40 bg-clip-text text-transparent">
            Infrastructure
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg text-white/40 max-w-2xl mx-auto"
        >
          Built for scale, security, and developer experience. FingerHR handles the complexity of biometric hardware communication.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}
