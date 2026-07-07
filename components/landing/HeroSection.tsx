"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

function AnimatedGlowOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main gradient orb */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Secondary orb */}
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.12) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)",
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Accent orb */}
      <motion.div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)",
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function FloatingDevice() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Animated glow rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-indigo-500/20"
            style={{
              width: `${100 + i * 70}px`,
              height: `${100 + i * 70}px`,
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 3D Floating device */}
      <motion.div
        className="relative z-10"
        style={{
          transformStyle: "preserve-3d",
          perspective: "1200px",
        }}
        animate={{
          y: [0, -15, 0],
          rotateY: [-20, 20, -20],
          rotateX: [8, -8, 8],
        }}
        transition={{
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          rotateY: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <div className="relative">
          {/* Glow behind device */}
          <div className="absolute -inset-12 bg-gradient-to-br from-indigo-500/40 via-purple-500/30 to-blue-500/40 blur-[60px] rounded-full" />

          {/* Color overlay tint */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-transparent to-purple-500/15 rounded-3xl z-10 mix-blend-overlay" />

          {/* Device image */}
          <Image
            src="/fingerspot-device.png"
            alt="Fingerspot Revo W-202BNC"
            width={380}
            height={380}
            priority
            className="relative w-72 sm:w-80 lg:w-96 h-auto drop-shadow-[0_30px_80px_rgba(99,102,241,0.5)]"
            style={{
              filter: "drop-shadow(0 0 50px rgba(99,102,241,0.3)) saturate(1.15) brightness(1.08)",
            }}
          />

          {/* Reflection effect */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-indigo-500/20 blur-2xl rounded-full" />
        </div>
      </motion.div>

      {/* Scanning line */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent z-20"
        animate={{ y: [-150, 150, -150] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating badges */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute -left-8 top-[15%] glass-strong rounded-2xl px-5 py-4 flex items-center gap-4 shadow-2xl shadow-black/20"
      >
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Synced</p>
          <p className="text-xs text-slate-400">Real-time</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="absolute -right-8 bottom-[20%] glass-strong rounded-2xl px-5 py-4 flex items-center gap-4 shadow-2xl shadow-black/20"
      >
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Encrypted</p>
          <p className="text-xs text-slate-400">E2E Security</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 glass-strong rounded-2xl px-6 py-4 flex items-center gap-5 shadow-2xl shadow-black/20"
      >
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
          <span className="text-sm font-bold text-white">Fingerspot Revo</span>
        </div>
        <div className="h-6 w-px bg-white/15" />
        <span className="text-xs text-slate-400">Connected via Cloud</span>
      </motion.div>
    </div>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.92]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      <AnimatedGlowOrbs />

      <div className="relative z-10 mx-auto max-w-[1440px] w-full px-6 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text */}
        <motion.div style={{ opacity, scale }} className="flex flex-col gap-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center gap-3 w-fit px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
            </span>
            <span className="font-mono text-xs text-indigo-400 font-semibold tracking-wider">
              REAL-TIME SYNC
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tight leading-[1.02]"
          >
            Biometrics
            <br />
            meets{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              the Cloud.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-lg sm:text-xl text-slate-400 max-w-lg leading-relaxed"
          >
            Bridge Fingerspot biometric hardware with modern cloud infrastructure.
            Real-time sync, API-first architecture, enterprise-grade security.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-wrap gap-5 mt-3"
          >
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
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="flex items-center gap-8 mt-8 text-sm text-slate-500"
          >
            {["Free trial", "No credit card", "Setup in 5 min"].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <svg className="h-4.5 w-4.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Device visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full aspect-square max-w-[550px] lg:max-w-none mx-auto"
        >
          {/* Glow behind */}
          <div className="absolute inset-0 rounded-[4rem] bg-gradient-to-br from-indigo-500/25 via-purple-500/15 to-transparent blur-[70px]" />

          {/* Main visual container */}
          <div className="relative w-full h-full rounded-[4rem] overflow-hidden glass glow-indigo">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-transparent" />
            <FloatingDevice />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      >
        <span className="text-xs text-slate-500 font-mono tracking-wider">SCROLL</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="h-7 w-4 rounded-full border-2 border-slate-600 flex justify-center pt-1.5"
        >
          <motion.div
            animate={{ opacity: [1, 0.3, 1], y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="h-2 w-1 rounded-full bg-slate-500"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
