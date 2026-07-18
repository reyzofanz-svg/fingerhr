"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { formatWIBTime } from "@/lib/timezone";

interface AttendanceRecord {
  date: string;
  clockIn: {
    time: string;
    spot: string | null;
    isInSpot: boolean | null;
  } | null;
  clockOut: {
    time: string;
    spot: string | null;
    isInSpot: boolean | null;
  } | null;
  status: string;
  logs: any[];
}

interface Employee {
  id: string;
  name: string;
  pin: string;
}

export default function MobileHistoryPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

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

  const fetchHistory = useCallback(async () => {
    if (!employee) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/mobile/attendance/history?employeeId=${employee.id}&startDate=${startDate}&endDate=${endDate}`
      );
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  }, [employee, startDate, endDate]);

  useEffect(() => {
    if (employee) {
      fetchHistory();
    }
  }, [employee, fetchHistory]);

  const formatTime = (dateStr: string) => {
    return formatWIBTime(dateStr);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
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
      <MobileHeader
        title="Riwayat Absensi"
        subtitle={employee.name}
      />

      <div className="p-4 pb-4">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 mb-4"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{history.length}</p>
              <p className="text-xs text-white/40">Hari</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">
                {history.filter(r => r.clockIn && r.clockOut).length}
              </p>
              <p className="text-xs text-white/40">Lengkap</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center mx-auto mb-2">
                <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white/60">
                {history.filter(r => (r.clockIn && !r.clockOut) || (!r.clockIn && r.clockOut)).length}
              </p>
              <p className="text-xs text-white/40">Tidak Lengkap</p>
            </div>
          </div>
        </motion.div>

        {/* Date Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="text-sm font-medium text-white/60">Filter Periode</p>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-white focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
          </div>
        </motion.div>

        {/* History List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
          </div>
        ) : history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06]">
              <svg className="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">Belum ada data absensi</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {history.map((record, index) => (
              <motion.div
                key={record.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {formatDate(record.date)}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                      record.status === "APPROVED"
                        ? "bg-white/[0.08] text-white/60"
                        : record.status === "PENDING"
                        ? "bg-white/[0.08] text-white/60"
                        : "bg-white/[0.08] text-white/60"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Clock In */}
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      <p className="text-[10px] text-white/40">Masuk</p>
                    </div>
                    {record.clockIn ? (
                      <>
                        <p className="text-lg font-bold text-white">
                          {formatTime(record.clockIn.time)}
                        </p>
                        {record.clockIn.spot && (
                          <p className="mt-1 text-[10px] text-white/40">
                            {record.clockIn.spot}
                            {record.clockIn.isInSpot === false && (
                              <span className="ml-1 text-white/40">(luar area)</span>
                            )}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-white/20">-</p>
                    )}
                  </div>

                  {/* Clock Out */}
                  <div className="rounded-xl bg-white/5 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
                      <p className="text-[10px] text-white/40">Pulang</p>
                    </div>
                    {record.clockOut ? (
                      <>
                        <p className="text-lg font-bold text-white">
                          {formatTime(record.clockOut.time)}
                        </p>
                        {record.clockOut.spot && (
                          <p className="mt-1 text-[10px] text-white/40">
                            {record.clockOut.spot}
                            {record.clockOut.isInSpot === false && (
                              <span className="ml-1 text-white/40">(luar area)</span>
                            )}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-white/20">-</p>
                    )}
                  </div>
                </div>

                {/* Duration */}
                {record.clockIn && record.clockOut && (
                  <div className="mt-3 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2">
                      <svg className="h-3.5 w-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[10px] text-white/40">
                        Durasi kerja:{" "}
                        <span className="font-medium text-white/60">
                          {(() => {
                            const inTime = new Date(record.clockIn.time).getTime();
                            const outTime = new Date(record.clockOut.time).getTime();
                            const diff = outTime - inTime;
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            return `${hours}j ${minutes}m`;
                          })()}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
