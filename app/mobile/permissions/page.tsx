"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Permission {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  createdAt: string;
}

export default function MobilePermissionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "IZIN",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
  });

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/permissions?employeeId=${(session?.user as any)?.employeeId}`
      );
      const data = await res.json();
      setPermissions(data.permissions || []);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchPermissions();
    }
  }, [status, fetchPermissions]);

  const handleSubmit = async () => {
    if (!form.reason) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: (session?.user as any)?.employeeId,
          type: form.type,
          startDate: form.startDate,
          endDate: form.endDate,
          reason: form.reason,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setForm({
          type: "IZIN",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
          reason: "",
        });
        fetchPermissions();
      }
    } catch (error) {
      console.error("Failed to submit permission:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/10 text-green-400";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400";
      case "REJECTED":
        return "bg-red-500/10 text-red-400";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "SICK":
        return "Sakit";
      case "CUTI":
        return "Cuti";
      case "IZIN":
        return "Izin";
      default:
        return type;
    }
  };

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
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
        <div className="flex-1">
          <h1 className="text-lg font-bold text-white">Izin & Cuti</h1>
          <p className="text-xs text-white/40">Ajukan izin dari ponsel</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white"
        >
          <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Permission List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
        </div>
      ) : permissions.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06]">
            <svg className="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
          <p className="text-sm text-white/60">Belum ada pengajuan izin</p>
        </div>
      ) : (
        <div className="space-y-3">
          {permissions.map((perm) => (
            <div
              key={perm.id}
              className="rounded-2xl bg-white/[0.03] p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {getTypeLabel(perm.type)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(
                    perm.status
                  )}`}
                >
                  {perm.status}
                </span>
              </div>
              <p className="text-xs text-white/40">
                {new Date(perm.startDate).toLocaleDateString("id-ID")} -{" "}
                {new Date(perm.endDate).toLocaleDateString("id-ID")}
              </p>
              {perm.reason && (
                <p className="mt-2 text-xs text-white/60">{perm.reason}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-t-2xl bg-[#1a1a24] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Ajukan Izin</h2>
              <button
                onClick={() => setShowForm(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]"
              >
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="mb-2 block text-xs text-white/40">Jenis</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.06] px-4 py-3 text-sm text-white"
                >
                  <option value="IZIN">Izin</option>
                  <option value="SICK">Sakit</option>
                  <option value="CUTI">Cuti</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs text-white/40">Dari</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.06] px-4 py-3 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs text-white/40">Sampai</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.06] px-4 py-3 text-sm text-white"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="mb-2 block text-xs text-white/40">Alasan</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Jelaskan alasan izin..."
                  rows={3}
                  className="w-full resize-none rounded-xl bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/20"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!form.reason || submitting}
                className="w-full rounded-xl bg-white py-3 text-sm font-bold text-black disabled:opacity-40"
              >
                {submitting ? "Mengirim..." : "Kirim Pengajuan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push("/mobile")}
          className="rounded-xl bg-white/[0.03] py-3 text-sm text-white/60"
        >
          Absensi
        </button>
        <button
          onClick={() => router.push("/mobile/history")}
          className="rounded-xl bg-white/[0.03] py-3 text-sm text-white/60"
        >
          Riwayat
        </button>
      </div>
    </div>
  );
}
