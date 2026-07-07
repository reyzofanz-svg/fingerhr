"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SplineScene } from "@/components/ui/splite";

function AmbientOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)",
        }}
        animate={{ x: [0, 80, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.14) 0%, rgba(59,130,246,0.06) 40%, transparent 70%)",
        }}
        animate={{ x: [0, -60, 0], y: [0, 60, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 right-1/2 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 60%)",
        }}
        animate={{ x: [0, 40, 0], y: [0, -40, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function FloatingParticles() {
  const particles = [
    { left: "15%", top: "20%", size: 4, dur: 20, delay: 0, color: "bg-indigo-400" },
    { left: "75%", top: "15%", size: 3, dur: 25, delay: 2, color: "bg-purple-400" },
    { left: "85%", top: "50%", size: 5, dur: 18, delay: 4, color: "bg-blue-400" },
    { left: "60%", top: "75%", size: 3, dur: 22, delay: 1, color: "bg-indigo-300" },
    { left: "30%", top: "65%", size: 4, dur: 28, delay: 3, color: "bg-violet-400" },
    { left: "90%", top: "35%", size: 3, dur: 19, delay: 5, color: "bg-pink-400" },
    { left: "45%", top: "85%", size: 2, dur: 24, delay: 6, color: "bg-indigo-500" },
    { left: "70%", top: "90%", size: 3, dur: 21, delay: 2, color: "bg-purple-300" },
    { left: "20%", top: "45%", size: 4, dur: 26, delay: 7, color: "bg-blue-300" },
    { left: "55%", top: "10%", size: 3, dur: 17, delay: 4, color: "bg-indigo-400" },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.color} rounded-full`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function GlowRing() {
  return (
    <div className="absolute right-[15%] top-1/2 -translate-y-1/2 pointer-events-none">
      <motion.div
        className="w-[500px] h-[500px] rounded-full border border-indigo-500/10"
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ rotate: { duration: 40, repeat: Infinity, ease: "linear" }, scale: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      />
      <motion.div
        className="absolute inset-8 rounded-full border border-purple-500/10"
        animate={{ rotate: -360, scale: [1, 1.08, 1] }}
        transition={{ rotate: { duration: 35, repeat: Infinity, ease: "linear" }, scale: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
      />
      <motion.div
        className="absolute inset-16 rounded-full border border-pink-500/8"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function GridPattern() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }}
    />
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0a0818]">
      <AmbientOrbs />
      <FloatingParticles />
      <GlowRing />
      <GridPattern />

      <div className="relative z-10 mx-auto max-w-[1440px] w-full px-6 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
        {/* Left: Text content */}
        <div className="flex flex-col gap-8 relative z-20">
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
            <span className="font-mono text-xs text-indigo-400 font-semibold tracking-wider">REAL-TIME SYNC</span>
          </motion.div>

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

          <motion.p
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="text-lg sm:text-xl text-slate-400 max-w-lg leading-relaxed"
          >
            Bridge Fingerspot biometric hardware with modern cloud infrastructure.
            Real-time sync, API-first architecture, enterprise-grade security.
          </motion.p>

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
        </div>

        {/* Right: 3D Robot with effects behind */}
        <div className="relative h-[500px] lg:h-[700px] w-full z-10">
          {/* Glow behind robot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-[400px] h-[400px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.12) 40%, transparent 70%)",
              }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}
