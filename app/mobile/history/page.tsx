"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

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

  // Check authentication
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
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
      <div className="flex min-h-screen items-center justify-center bg-[#08080c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080c] p-4 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]"
        >
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Riwayat Absensi</h1>
          <p className="text-xs text-white/40">7 hari terakhir</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-4 flex gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="flex-1 rounded-xl bg-white/[0.06] px-3 py-2.5 text-xs text-white"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex-1 rounded-xl bg-white/[0.06] px-3 py-2.5 text-xs text-white"
        />
      </div>

      {/* History List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
        </div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06]">
            <svg className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <p className="text-sm text-white/60">Belum ada data absensi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.date}
              className="rounded-2xl bg-white/[0.03] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {formatDate(record.date)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    record.status === "APPROVED"
                      ? "bg-green-500/10 text-green-400"
                      : record.status === "PENDING"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {record.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Clock In */}
                <div className="rounded-xl bg-white/[0.03] p-3">
                  <p className="mb-1 text-[10px] text-white/40">Masuk</p>
                  {record.clockIn ? (
                    <>
                      <p className="text-lg font-bold text-white">
                        {formatTime(record.clockIn.time)}
                      </p>
                      {record.clockIn.spot && (
                        <p className="mt-1 text-[10px] text-white/40">
                          {record.clockIn.spot}
                          {record.clockIn.isInSpot === false && (
                            <span className="ml-1 text-yellow-400">(luar area)</span>
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-white/20">-</p>
                  )}
                </div>

                {/* Clock Out */}
                <div className="rounded-xl bg-white/[0.03] p-3">
                  <p className="mb-1 text-[10px] text-white/40">Pulang</p>
                  {record.clockOut ? (
                    <>
                      <p className="text-lg font-bold text-white">
                        {formatTime(record.clockOut.time)}
                      </p>
                      {record.clockOut.spot && (
                        <p className="mt-1 text-[10px] text-white/40">
                          {record.clockOut.spot}
                          {record.clockOut.isInSpot === false && (
                            <span className="ml-1 text-yellow-400">(luar area)</span>
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
                <div className="mt-3 border-t border-white/[0.06] pt-3">
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
              )}
            </div>
          ))}
        </div>
      )}

      {/* Back to Attendance */}
      <button
        onClick={() => router.push("/mobile")}
        className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-medium text-black"
      >
        Kembali ke Absensi
      </button>
    </div>
  );
}
