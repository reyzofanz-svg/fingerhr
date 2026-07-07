"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { SplineScene } from "@/components/ui/splite";

function LiquidOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-[15%] right-[20%] w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[30%] w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%)",
          filter: "blur(50px)",
        }}
        animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function FloatingDots() {
  const dots = [
    { left: "10%", top: "18%", size: 3, dur: 22, delay: 0 },
    { left: "80%", top: "12%", size: 2, dur: 28, delay: 2 },
    { left: "88%", top: "55%", size: 3, dur: 19, delay: 4 },
    { left: "65%", top: "80%", size: 2, dur: 24, delay: 1 },
    { left: "25%", top: "70%", size: 3, dur: 26, delay: 3 },
    { left: "92%", top: "30%", size: 2, dur: 20, delay: 5 },
    { left: "50%", top: "88%", size: 2, dur: 27, delay: 6 },
    { left: "72%", top: "92%", size: 3, dur: 23, delay: 2 },
    { left: "18%", top: "40%", size: 2, dur: 29, delay: 7 },
    { left: "58%", top: "8%", size: 2, dur: 18, delay: 4 },
    { left: "40%", top: "25%", size: 2, dur: 30, delay: 1 },
    { left: "78%", top: "68%", size: 3, dur: 21, delay: 8 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.15, 0.5, 0.15],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: d.dur,
            repeat: Infinity,
            delay: d.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function GlowOrb() {
  return (
    <div className="absolute right-[10%] top-1/2 -translate-y-1/2 pointer-events-none">
      <motion.div
        className="w-[450px] h-[450px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function LiquidGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.025]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
        `,
        backgroundSize: "100px 100px",
      }}
    />
  );
}

function ScanLine() {
  return (
    <motion.div
      className="absolute right-0 top-0 w-[1px] h-full pointer-events-none"
      style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
      }}
      animate={{ x: [-200, 0, 200, 0, -200] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#08080a]">
      <LiquidOrbs />
      <FloatingDots />
      <GlowOrb />
      <LiquidGrid />
      <ScanLine />

      <div className="relative z-10 mx-auto max-w-[1440px] w-full px-6 pt-28 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
        {/* Left: Text */}
        <div className="flex flex-col gap-8 relative z-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-3 w-fit px-5 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="font-mono text-xs text-white/60 font-medium tracking-wider uppercase">Live Sync</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold text-white tracking-[-0.03em] leading-[1.05]"
          >
            Biometrics
            <br />
            meets the{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-white via-white/80 to-white/50 bg-clip-text text-transparent">
                Cloud.
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-white/60 to-transparent"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-lg text-white/40 max-w-lg leading-relaxed"
          >
            Bridge Fingerspot biometric hardware with modern cloud infrastructure.
            Real-time sync, API-first architecture, enterprise-grade security.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-wrap gap-4 mt-2"
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-semibold text-black transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-[1.02]"
            >
              <span>Get Started</span>
              <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.03] backdrop-blur-sm px-8 py-4 text-sm font-semibold text-white/70 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.2] hover:text-white hover:scale-[1.02]"
            >
              See How It Works
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center gap-8 mt-6"
          >
            {["Free trial", "No credit card", "Setup in 5 min"].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-white/35">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: 3D Robot */}
        <div className="relative h-[500px] lg:h-[700px] w-full z-10">
          {/* Soft glow behind robot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-[350px] h-[350px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%)",
                filter: "blur(50px)",
              }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
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
