"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

function DeviceShowcase() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 perspective-[1200px]">
      {/* Animated glow rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-indigo-500/15"
            style={{
              width: `${80 + i * 60}px`,
              height: `${80 + i * 60}px`,
            }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 3D Rotating device */}
      <motion.div
        className="relative z-10"
        style={{
          transformStyle: "preserve-3d",
          perspective: "1200px",
        }}
        animate={{
          y: [0, -10, 0],
          rotateY: [-15, 15, -15],
          rotateX: [5, -5, 5],
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="relative">
          {/* Glow behind device */}
          <div className="absolute -inset-8 bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-blue-500/30 blur-[50px] rounded-full" />

          {/* Color overlay tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 rounded-2xl z-10 mix-blend-overlay" />

          {/* Device image */}
          <Image
            src="/fingerspot-device.png"
            alt="Fingerspot Revo W-202BNC"
            width={320}
            height={320}
            priority
            className="relative w-64 sm:w-72 lg:w-80 h-auto drop-shadow-[0_20px_60px_rgba(99,102,241,0.4)]"
            style={{
              filter: "drop-shadow(0 0 40px rgba(99,102,241,0.25)) saturate(1.1) brightness(1.05)",
            }}
          />

          {/* Reflection effect */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-indigo-500/15 blur-xl rounded-full" />
        </div>
      </motion.div>

      {/* Scanning line */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-56 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent z-20"
        animate={{ y: [-120, 120, -120] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          style={{ y: y1 }}
          className="absolute top-20 left-[15%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-20 right-[10%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[100px]"
        />
        <motion.div
          style={{ y: y1 }}
          className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-blue-500/8 blur-[80px]"
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] w-full px-6 pt-24 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <motion.div style={{ opacity, scale }} className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            <span className="font-mono text-xs text-indigo-400 font-semibold tracking-wider">
              REAL-TIME SYNC
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.05]"
          >
            Biometrics
            <br />
            meets{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
              the Cloud.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed"
          >
            Bridge Fingerspot biometric hardware with modern cloud infrastructure.
            Real-time sync, API-first architecture, enterprise-grade security.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap gap-4 mt-2"
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-3.5 text-sm font-bold text-white transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
            >
              Get Started
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-3.5 text-sm font-bold text-slate-300 transition-all hover:bg-white/5 hover:border-white/20"
            >
              See How It Works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex items-center gap-6 mt-6 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Free trial
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Setup in 5 min
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Fingerprint visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative w-full aspect-square max-w-[500px] lg:max-w-none mx-auto"
        >
          {/* Glow behind */}
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-[60px]" />

          {/* Main visual container */}
          <div className="relative w-full h-full rounded-[3rem] overflow-hidden glass glow-indigo">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent" />
            <DeviceShowcase />
          </div>

          {/* Floating badges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute -left-4 top-[20%] glass rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Synced</p>
              <p className="text-[10px] text-slate-400">Real-time</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="absolute -right-4 bottom-[25%] glass rounded-2xl px-4 py-3 flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Encrypted</p>
              <p className="text-[10px] text-slate-400">E2E Security</p>
            </div>
          </motion.div>

          {/* Device info badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass rounded-2xl px-5 py-3 flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
              <span className="text-xs font-semibold text-white">Fingerspot Revo</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-[10px] text-slate-400">Connected via Cloud</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-500 font-mono">SCROLL</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="h-5 w-3 rounded-full border border-slate-600 flex justify-center pt-1"
        >
          <div className="h-1.5 w-1 rounded-full bg-slate-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
