"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  pin: string;
}

interface TodayAttendance {
  clockIn: string | null;
  clockOut: string | null;
  status: string | null;
  isInSpot: boolean | null;
}

interface WeeklyStats {
  totalDays: number;
  present: number;
  late: number;
  absent: number;
}

export default function MobileHomePage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!employee) return;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    fetch(`/api/mobile/attendance/history?employeeId=${employee.id}&startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          const todayData = data[0];
          setTodayAttendance({
            clockIn: todayData.clockIn?.time || null,
            clockOut: todayData.clockOut?.time || null,
            status: todayData.status,
            isInSpot: todayData.clockIn?.isInSpot ?? null,
          });
        }
      })
      .catch(console.error);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    fetch(`/api/mobile/attendance/history?employeeId=${employee.id}&startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`)
      .then((res) => res.json())
      .then((data) => {
        const stats: WeeklyStats = {
          totalDays: data.length,
          present: data.filter((d: any) => d.clockIn).length,
          late: data.filter((d: any) => d.clockIn && d.clockIn.isInSpot === false).length,
          absent: data.filter((d: any) => !d.clockIn).length,
        };
        setWeeklyStats(stats);
      })
      .catch(console.error);
  }, [employee]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080c]">
      <div className="p-4 pb-24">
        {/* Header with greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-sm">{getGreeting()}</p>
              <h1 className="text-white text-xl font-bold mt-1">{employee.name}</h1>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                </span>
                <span className="text-white/40 text-xs">Online</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Clock Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-3xl p-6 relative overflow-hidden border border-white/[0.06]"
          style={{ background: "rgba(14, 14, 18, 0.7)", backdropFilter: "blur(12px)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="text-center">
              <motion.p
                key={currentTime.getSeconds()}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-white tracking-tight font-mono"
              >
                {formatTime(currentTime)}
              </motion.p>
              <p className="text-white/40 text-sm mt-2">{formatDate(currentTime)}</p>
            </div>
          </div>
        </motion.div>

        {/* Today's Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-white/40 text-sm font-medium mb-3">Status Hari Ini</h2>
          <div className="rounded-2xl p-4 border border-white/[0.06]" style={{ background: "rgba(14, 14, 18, 0.7)", backdropFilter: "blur(12px)" }}>
            {todayAttendance ? (
              <div className="space-y-3">
                {/* Clock In */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${todayAttendance.clockIn ? 'bg-white/[0.08]' : 'bg-white/[0.04]'}`}>
                      <svg className={`h-5 w-5 ${todayAttendance.clockIn ? 'text-white/80' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Masuk</p>
                      <p className="text-white/30 text-xs">Jam masuk</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${todayAttendance.clockIn ? 'text-white' : 'text-white/20'}`}>
                      {todayAttendance.clockIn
                        ? new Date(todayAttendance.clockIn).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
                        : "--:--"}
                    </p>
                    {todayAttendance.isInSpot === false && (
                      <p className="text-white/40 text-xs">Luar area</p>
                    )}
                  </div>
                </div>

                <div className="h-px bg-white/[0.06]" />

                {/* Clock Out */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${todayAttendance.clockOut ? 'bg-white/[0.08]' : 'bg-white/[0.04]'}`}>
                      <svg className={`h-5 w-5 ${todayAttendance.clockOut ? 'text-white/80' : 'text-white/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Pulang</p>
                      <p className="text-white/30 text-xs">Jam pulang</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${todayAttendance.clockOut ? 'text-white' : 'text-white/20'}`}>
                      {todayAttendance.clockOut
                        ? new Date(todayAttendance.clockOut).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
                        : "--:--"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="h-12 w-12 rounded-full bg-white/[0.06] flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/40 text-sm">Belum ada absensi hari ini</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Weekly Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-white/40 text-sm font-medium mb-3">Ringkasan Minggu Ini</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-4 text-center border border-white/[0.06]" style={{ background: "rgba(14, 14, 18, 0.7)", backdropFilter: "blur(12px)" }}>
              <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{weeklyStats?.present || 0}</p>
              <p className="text-white/30 text-xs mt-1">Hadir</p>
            </div>
            <div className="rounded-2xl p-4 text-center border border-white/[0.06]" style={{ background: "rgba(14, 14, 18, 0.7)", backdropFilter: "blur(12px)" }}>
              <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{weeklyStats?.late || 0}</p>
              <p className="text-white/30 text-xs mt-1">Terlambat</p>
            </div>
            <div className="rounded-2xl p-4 text-center border border-white/[0.06]" style={{ background: "rgba(14, 14, 18, 0.7)", backdropFilter: "blur(12px)" }}>
              <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{weeklyStats?.absent || 0}</p>
              <p className="text-white/30 text-xs mt-1">Alpha</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-white/40 text-sm font-medium mb-3">Aksi Cepat</h2>
          <div className="space-y-3">
            <Link
              href="/mobile/absen"
              className="block rounded-2xl p-4 border border-white/[0.06] active:scale-[0.98] transition-all hover:border-white/[0.12]"
              style={{ background: "rgba(14, 14, 18, 0.7)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center">
                  <svg className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Absen Sekarang</p>
                  <p className="text-white/30 text-sm">GPS & Foto Wajah</p>
                </div>
                <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              href="/mobile/history"
              className="block rounded-2xl p-4 border border-white/[0.06] active:scale-[0.98] transition-all hover:border-white/[0.12]"
              style={{ background: "rgba(14, 14, 18, 0.7)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center">
                  <svg className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Riwayat Absensi</p>
                  <p className="text-white/30 text-sm">Lihat histori kehadiran</p>
                </div>
                <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            <Link
              href="/mobile/permissions"
              className="block rounded-2xl p-4 border border-white/[0.06] active:scale-[0.98] transition-all hover:border-white/[0.12]"
              style={{ background: "rgba(14, 14, 18, 0.7)", backdropFilter: "blur(12px)" }}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/[0.08] border border-white/[0.08] flex items-center justify-center">
                  <svg className="h-6 w-6 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">Ajukan Izin</p>
                  <p className="text-white/30 text-sm">Izin, sakit, atau cuti</p>
                </div>
                <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
