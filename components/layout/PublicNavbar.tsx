"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Logo } from "./Logo";

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "API Docs", href: "#" },
  ];

  return (
    <>
      <motion.nav
        className={cn(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300",
          scrolled
            ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-[1440px] flex items-center justify-between px-6 transition-all duration-300"
          style={{ height: scrolled ? "56px" : "72px" }}>
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl pt-20 px-6 md:hidden"
        >
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-lg text-slate-300 hover:text-white transition-colors py-2 border-b border-white/5"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-white/10 px-6 py-3 text-center text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                Login
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-center text-sm font-bold text-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
