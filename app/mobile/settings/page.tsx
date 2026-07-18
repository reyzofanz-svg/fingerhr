"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MobileHeader } from "@/components/mobile/MobileHeader";

interface Employee {
  id: string;
  name: string;
  pin: string;
}

export default function MobileSettingsPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("fingerhr_token");
    const employeeData = localStorage.getItem("fingerhr_employee");

    if (!token || !employeeData) {
      router.push("/mobile/login");
      return;
    }

    try {
      setEmployee(JSON.parse(employeeData));
    } catch {
      router.push("/mobile/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("fingerhr_token");
    localStorage.removeItem("fingerhr_employee");
    router.push("/mobile/login");
  };

  if (!employee) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#08080c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <MobileHeader title="Akun" subtitle="Pengaturan akun Anda" />

      <div className="p-4 pb-4">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{employee.name}</h2>
                <p className="text-white/40 text-sm">PIN: {employee.pin}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-6"
        >
          {/* Version Info */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Versi Aplikasi</p>
                <p className="text-xs text-white/40">FingerHR v1.0.0</p>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Bantuan</p>
                <p className="text-xs text-white/40">FAQ & Panduan penggunaan</p>
              </div>
              <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* About */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Tentang</p>
                <p className="text-xs text-white/40">PT. Anugerah Citra Teknologi</p>
              </div>
              <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full glass rounded-2xl p-4 text-red-400 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-center gap-3">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">Keluar dari Akun</span>
            </div>
          </button>
        </motion.div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm glass rounded-3xl p-6"
          >
            <div className="text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Keluar dari Akun?</h3>
              <p className="text-sm text-white/60">
                Anda akan diarahkan ke halaman login
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl bg-white/10 py-3 text-sm font-medium text-white active:scale-[0.98] transition-transform"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-medium text-white active:scale-[0.98] transition-transform"
              >
                Keluar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
