"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MobileHeader } from "@/components/mobile/MobileHeader";

interface Permission {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: string;
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  pin: string;
}

export default function MobilePermissionsPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
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

  const fetchPermissions = useCallback(async () => {
    if (!employee) return;

    try {
      const res = await fetch(
        `/api/permissions?employeeId=${employee.id}`
      );
      const data = await res.json();
      setPermissions(data.permissions || []);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
    } finally {
      setLoading(false);
    }
  }, [employee]);

  useEffect(() => {
    if (employee) {
      fetchPermissions();
    }
  }, [employee, fetchPermissions]);

  const handleSubmit = async () => {
    if (!form.reason || !employee) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
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
    return "bg-white/[0.08] text-white/60";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SICK":
        return (
          <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
            <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case "CUTI":
        return (
          <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
            <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0121 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
            <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
          </div>
        );
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

  if (!employee) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#08080c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#08080c]">
      <MobileHeader
        title="Izin & Cuti"
        subtitle="Ajukan izin dari ponsel"
        rightAction={
          <button
            onClick={() => setShowForm(true)}
            className="h-9 w-9 rounded-xl bg-white flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        }
      />

      <div className="p-4 pb-4">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-4"
        >
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-white">
              {permissions.filter(p => p.status === "PENDING").length}
            </p>
            <p className="text-xs text-white/40">Pending</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-white">
              {permissions.filter(p => p.status === "APPROVED").length}
            </p>
            <p className="text-xs text-white/40">Disetujui</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-white/60">
              {permissions.filter(p => p.status === "REJECTED").length}
            </p>
            <p className="text-xs text-white/40">Ditolak</p>
          </div>
        </motion.div>

        {/* Permission List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
          </div>
        ) : permissions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <svg className="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <p className="text-white/40 text-sm">Belum ada pengajuan izin</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {permissions.map((perm, index) => (
              <motion.div
                key={perm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  {getTypeIcon(perm.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">
                        {getTypeLabel(perm.type)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusColor(
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
                      <p className="mt-2 text-xs text-white/60 bg-white/5 rounded-lg p-2">{perm.reason}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-t-3xl bg-[#0f0f15] border border-white/[0.08] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mb-6" />
              
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Ajukan Izin</h2>
                <p className="text-sm text-white/40 mt-1">Isi form untuk mengajukan izin</p>
              </div>

              <div className="space-y-4">
                {/* Type */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">Jenis Izin</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "IZIN", label: "Izin", icon: "📋" },
                      { value: "SICK", label: "Sakit", icon: "🤒" },
                      { value: "CUTI", label: "Cuti", icon: "🏖️" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setForm({ ...form, type: option.value })}
                        className={`rounded-xl py-3 text-sm font-medium transition-all ${
                          form.type === option.value
                            ? "bg-white text-black"
                            : "bg-white/5 text-white/60"
                        }`}
                      >
                        <span className="text-lg">{option.icon}</span>
                        <p className="mt-1">{option.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/60">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/60">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">Alasan</label>
                  <textarea
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Jelaskan alasan izin Anda..."
                    rows={3}
                    className="w-full resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!form.reason || submitting}
                  className="w-full rounded-xl bg-white text-black py-4 text-sm font-bold disabled:opacity-40 disabled:active:scale-100 active:scale-[0.98] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      Mengirim...
                    </div>
                  ) : (
                    "Kirim Pengajuan"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
