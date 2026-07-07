"use client";

import { motion } from "framer-motion";

export function Fingerprint3D() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Animated glow rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${120 + i * 60}px`,
              height: `${120 + i * 60}px`,
              border: `1px solid rgba(99, 102, 241, ${0.15 - i * 0.02})`,
              boxShadow: `0 0 ${20 + i * 5}px rgba(99, 102, 241, ${0.1 - i * 0.015})`,
            }}
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 3, 0],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main fingerprint */}
      <motion.div
        className="relative z-10"
        animate={{
          y: [0, -12, 0],
          rotateY: [-8, 8, -8],
          rotateX: [5, -5, 5],
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1000px",
        }}
      >
        {/* Glow backdrop */}
        <div className="absolute -inset-16 bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-blue-500/30 blur-[80px] rounded-full" />
        
        {/* Fingerprint SVG */}
        <svg
          viewBox="0 0 200 200"
          className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 drop-shadow-[0_0_60px_rgba(99,102,241,0.5)]"
          style={{
            filter: "drop-shadow(0 0 40px rgba(99,102,241,0.4)) drop-shadow(0 0 80px rgba(139,92,246,0.2))",
          }}
        >
          <defs>
            <linearGradient id="fp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <linearGradient id="fp-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer rings - fingerprint pattern */}
          <g fill="none" stroke="url(#fp-gradient)" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)" opacity="0.9">
            {/* Center dot */}
            <circle cx="100" cy="100" r="4" fill="url(#fp-gradient)" />
            
            {/* Inner rings */}
            <path d="M100 85 Q115 85 115 100 Q115 115 100 115 Q85 115 85 100 Q85 85 100 85" />
            <path d="M100 72 Q128 72 128 100 Q128 128 100 128 Q72 128 72 100 Q72 72 100 72" />
            <path d="M100 60 Q140 60 140 100 Q140 140 100 140 Q60 140 60 100 Q60 60 100 60" />
            
            {/* Outer rings with breaks (fingerprint style) */}
            <path d="M100 48 Q152 48 152 100 Q152 152 100 152" />
            <path d="M100 152 Q48 152 48 100 Q48 48 100 48" />
            
            <path d="M100 36 Q164 36 164 100 Q164 164 100 164" />
            <path d="M100 164 Q36 164 36 100 Q36 36 100 36" />
            
            {/* Connecting lines - fingerprint detail */}
            <path d="M70 70 Q85 60 100 60" strokeWidth="2" />
            <path d="M130 70 Q115 60 100 60" strokeWidth="2" />
            <path d="M70 130 Q85 140 100 140" strokeWidth="2" />
            <path d="M130 130 Q115 140 100 140" strokeWidth="2" />
            
            {/* Ridge details */}
            <path d="M80 55 Q90 50 100 48" strokeWidth="1.5" opacity="0.7" />
            <path d="M120 55 Q110 50 100 48" strokeWidth="1.5" opacity="0.7" />
            <path d="M80 145 Q90 150 100 152" strokeWidth="1.5" opacity="0.7" />
            <path d="M120 145 Q110 150 100 152" strokeWidth="1.5" opacity="0.7" />
            
            {/* Additional ridge lines */}
            <path d="M55 80 Q50 90 48 100" strokeWidth="1.5" opacity="0.6" />
            <path d="M55 120 Q50 110 48 100" strokeWidth="1.5" opacity="0.6" />
            <path d="M145 80 Q150 90 152 100" strokeWidth="1.5" opacity="0.6" />
            <path d="M145 120 Q150 110 152 100" strokeWidth="1.5" opacity="0.6" />
          </g>
          
          {/* Scanning line effect */}
          <motion.line
            x1="40"
            x2="160"
            stroke="url(#fp-glow)"
            strokeWidth="2"
            opacity="0.8"
            animate={{ y1: [40, 160, 40], y2: [40, 160, 40] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>

        {/* Reflection */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-indigo-500/15 blur-2xl rounded-full" />
      </motion.div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-indigo-400/60"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
