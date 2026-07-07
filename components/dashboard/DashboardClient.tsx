"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { cn } from "@/lib/utils/cn";
import type { DashboardData } from "@/lib/server/queries";

const DashboardChart = lazy(() =>
  import("./DashboardChart").then((m) => ({ default: m.DashboardChart }))
);

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDevices: number;
  onlineDevices: number;
  todayAttendance: number;
  pendingPermissions: number;
}

interface RecentAttendance {
  id: string;
  scanTime: string;
  status: string;
  employee: {
    name: string;
    department: string | null;
  };
  device: {
    name: string;
  };
}

interface RecentPermission {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  employee: {
    name: string;
    department: string | null;
  };
}

export function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [stats, setStats] = useState<DashboardStats>(initialData.stats);
  const [recentAttendance, setRecentAttendance] = useState<RecentAttendance[]>(
    initialData.recentAttendance
  );
  const [recentPermissions, setRecentPermissions] = useState<RecentPermission[]>(
    initialData.recentPermissions
  );
  const [loading, setLoading] = useState(false);
  const [weeklyData, setWeeklyData] = useState<
    { day: string; masuk: number; keluar: number }[]
  >(initialData.weeklyData);

  const fetchDashboardData = async () => {
    try {
      const empRes = await fetch("/api/employees");
      const empData = await empRes.json();
      const employees = empData.employees || [];

      const devRes = await fetch("/api/devices");
      const devices = await devRes.json();

      const today = new Date().toISOString().split("T")[0];
      const attRes = await fetch(`/api/attendance/logs?startDate=${today}&endDate=${today}`);
      const attendance = await attRes.json();

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 6);
      const weekStart = weekAgo.toISOString().split("T")[0];
      const weekRes = await fetch(`/api/attendance/logs?startDate=${weekStart}&endDate=${today}`);
      const weekAttendance = await weekRes.json();

      const permRes = await fetch("/api/permissions?status=PENDING");
      const permissions = await permRes.json();

      const recentPermRes = await fetch("/api/permissions");
      const recentPerms = await recentPermRes.json();

      setStats({
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e: any) => e.isActive).length,
        totalDevices: devices.length,
        onlineDevices: devices.filter((d: any) => d.status === "ONLINE").length,
        todayAttendance: attendance.length,
        pendingPermissions: permissions.length,
      });

      setRecentAttendance(attendance.slice(0, 10));
      setRecentPermissions(recentPerms.slice(0, 5));

      const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      const now = new Date();
      const weekData = days.map((day, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        const dayAtt = weekAttendance.filter((a: any) => a.scanTime?.startsWith(dateStr));
        return {
          day,
          masuk: dayAtt.filter((a: any) => a.status === "IN").length,
          keluar: dayAtt.filter((a: any) => a.status === "OUT").length,
        };
      });
      setWeeklyData(weekData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitoring real-time kehadiran dan perangkat absensi
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
          <span className="text-sm font-medium text-emerald-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f0f15] p-5 transition-all duration-300 hover:border-indigo-500/20 hover:bg-[#12121a]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Karyawan</p>
              <p className="mt-1.5 text-2xl font-bold text-white">
                {loading ? (
                  <span className="inline-block h-7 w-12 animate-pulse rounded bg-white/10" />
                ) : (
                  stats.totalEmployees
                )}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/10">
              <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f0f15] p-5 transition-all duration-300 hover:border-emerald-500/20 hover:bg-[#12121a]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Hadir Hari Ini</p>
              <p className="mt-1.5 text-2xl font-bold text-emerald-400">
                {loading ? (
                  <span className="inline-block h-7 w-12 animate-pulse rounded bg-emerald-500/10" />
                ) : (
                  stats.todayAttendance
                )}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/10">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f0f15] p-5 transition-all duration-300 hover:border-blue-500/20 hover:bg-[#12121a]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Perangkat Online</p>
              <p className="mt-1.5 text-2xl font-bold text-white">
                {loading ? (
                  <span className="inline-block h-7 w-12 animate-pulse rounded bg-white/10" />
                ) : (
                  `${stats.onlineDevices}/${stats.totalDevices}`
                )}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/10">
              <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f0f15] p-5 transition-all duration-300 hover:border-amber-500/20 hover:bg-[#12121a]">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Izin Pending</p>
              <p className="mt-1.5 text-2xl font-bold text-amber-400">
                {loading ? (
                  <span className="inline-block h-7 w-12 animate-pulse rounded bg-amber-500/10" />
                ) : (
                  stats.pendingPermissions
                )}
              </p>
            </div>
            <a
              href="/dashboard/attendance/permissions"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/10 transition-all hover:scale-105"
            >
              <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f0f15] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-white">Absensi Minggu Ini</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="text-slate-400">Masuk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="text-slate-400">Keluar</span>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              </div>
            }
          >
            <DashboardChart data={weeklyData} />
          </Suspense>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f0f15]">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Absensi Terakhir</h3>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
              <span className="text-xs font-medium text-slate-500">Live</span>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : recentAttendance.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">Belum ada absensi hari ini</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {recentAttendance.map((log) => (
              <div key={log.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.02]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/10">
                  {log.employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{log.employee.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {log.employee.department || "-"} &bull; {log.device.name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-semibold text-indigo-400">{formatTime(log.scanTime)}</p>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      log.status === "IN" ? "text-emerald-400" : "text-blue-400"
                    )}
                  >
                    {log.status === "IN" ? "Masuk" : "Keluar"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f0f15]">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Izin Terbaru</h3>
            <a
              href="/dashboard/attendance/permissions"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Lihat Semua &rarr;
            </a>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : recentPermissions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <svg className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">Belum ada data izin</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {recentPermissions.map((perm) => (
              <div key={perm.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-white/[0.02]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/10">
                  {perm.employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{perm.employee.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {perm.type === "SICK" ? "Sakit" : perm.type === "CUTI" ? "Cuti" : "Izin"} &bull;{" "}
                    {new Date(perm.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={cn(
                      "inline-block rounded-lg px-2.5 py-1 text-xs font-semibold",
                      perm.status === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : perm.status === "REJECTED"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    )}
                  >
                    {perm.status === "APPROVED" ? "Disetujui" : perm.status === "REJECTED" ? "Ditolak" : "Menunggu"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
