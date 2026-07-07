"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registered = searchParams.get("registered");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#08080a]">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Spotlight */}
      <Spotlight className="-top-40 left-1/4" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/[0.03] blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/[0.02] blur-[120px] animate-pulse" />

      {/* Main content: split layout */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left: 3D Spline */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:flex w-1/2 h-[520px] items-center justify-center relative"
        >
          {/* Glow ring behind the robot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 rounded-full border border-white/[0.06] animate-pulse" />
            <div className="absolute w-64 h-64 rounded-full border border-white/[0.04] animate-pulse delay-1000" />
          </div>
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </motion.div>

        {/* Right: Login form */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10"
          >
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.1] flex items-center justify-center group-hover:bg-white/[0.12] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
                  <path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 2.3 0 4.3 1.3 5.3 3.1" />
                  <path d="M12 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
                  <path d="M19 12c0 1-1.5 3-2 4" />
                  <path d="M20 9.5C19 8 17.5 7 16 7c-1.5 0-3 1-3.5 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">FingerHR</span>
              <span className="text-[10px] font-semibold tracking-widest text-white/30 border border-white/[0.1] rounded-md px-1.5 py-0.5">MODERN</span>
            </Link>
            <p className="text-sm text-white/40 mt-3">Sign in to your FingerHR dashboard</p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8"
          >
            {registered && (
              <div className="mb-5 flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white/70">
                <CheckCircle className="w-4 h-4 shrink-0 text-white/60" />
                Registration successful! Please sign in.
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.05] border border-white/[0.12] text-sm text-white/60">
                <AlertCircle className="w-4 h-4 shrink-0 text-white/50" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 text-sm text-white placeholder-white/25 transition-all focus:border-white/[0.15] focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.04] pl-10 pr-4 text-sm text-white placeholder-white/25 transition-all focus:border-white/[0.15] focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-white/10"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-white text-black text-sm font-semibold transition-all hover:bg-white/90 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 inline-flex items-center justify-center gap-2"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Scan line */}
          <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

          <p className="mt-6 text-center text-xs text-white/30">
            Secure access to your workforce management platform.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#08080a]">
          <span className="loader"></span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
