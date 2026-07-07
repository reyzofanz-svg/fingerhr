"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  overtimeStart: string | null;
  overtimeRate: number;
  graceMinutes: number;
  scanInStart: string | null;
  scanInEnd: string | null;
  scanOutStart: string | null;
  scanOutEnd: string | null;
  isActive: boolean;
  _count: { workScheduleDays: number };
}

interface WorkScheduleDay {
  dayOfWeek: number;
  isDayOff: boolean;
  shiftId: string | null;
  shift?: { id: string; name: string; startTime: string; endTime: string } | null;
}

interface WorkSchedule {
  id: string;
  name: string;
  isActive: boolean;
  days: WorkScheduleDay[];
  _count: { employees: number };
}

interface Employee {
  id: string;
  name: string;
  pin: string;
}

interface Assignment {
  id: string;
  employeeId: string;
  workScheduleId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  employee: { name: string; pin: string };
  workSchedule: { name: string };
}

const emptyShift = {
  name: "",
  startTime: "08:00",
  endTime: "15:00",
  breakStart: "",
  breakEnd: "",
  overtimeStart: "",
  overtimeRate: 1.5,
  graceMinutes: 15,
  scanInStart: "",
  scanInEnd: "",
  scanOutStart: "",
  scanOutEnd: "",
};

function defaultDays(): WorkScheduleDay[] {
  // Default: Sun & Sat off, Mon-Fri working (no shift chosen yet)
  return Array.from({ length: 7 }, (_, dow) => ({
    dayOfWeek: dow,
    isDayOff: dow === 0 || dow === 6,
    shiftId: null,
  }));
}

export function ScheduleClient({
  initialShifts,
  initialWorkSchedules,
  initialEmployees,
  initialAssignments,
}: {
  initialShifts: Shift[];
  initialWorkSchedules: WorkSchedule[];
  initialEmployees: Employee[];
  initialAssignments: Assignment[];
}) {
  const [tab, setTab] = useState<"shift" | "jadwal" | "assign">("shift");
  // Seed from server data so all tabs render immediately (no spinner).
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>(initialWorkSchedules);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Shift modal state
  const [shiftModal, setShiftModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [shiftForm, setShiftForm] = useState({ ...emptyShift });

  // Jadwal modal state
  const [jadwalModal, setJadwalModal] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedJadwal, setSelectedJadwal] = useState<WorkSchedule | null>(null);
  const [jadwalForm, setJadwalForm] = useState<{ name: string; days: WorkScheduleDay[] }>({
    name: "",
    days: defaultDays(),
  });

  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({
    employeeId: "",
    workScheduleId: "",
    effectiveFrom: new Date().toISOString().split("T")[0],
    effectiveTo: "",
  });

  const fetchShifts = async () => {
    try {
      const res = await fetch("/api/attendance/schedule");
      setShifts(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  const fetchWorkSchedules = async () => {
    try {
      const res = await fetch("/api/attendance/work-schedule");
      setWorkSchedules(await res.json());
    } catch (e) {
      console.error(e);
    }
  };
  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (e) {
      console.error(e);
    }
  };
  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/attendance/assign");
      setAssignments(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchWorkSchedules();
    fetchEmployees();
    fetchAssignments();
  }, []);

  // ---------- Shift handlers ----------
  const openAddShift = () => {
    setShiftForm({ ...emptyShift });
    setShiftModal("add");
  };
  const openEditShift = (s: Shift) => {
    setSelectedShift(s);
    setShiftForm({
      name: s.name,
      startTime: s.startTime,
      endTime: s.endTime,
      breakStart: s.breakStart || "",
      breakEnd: s.breakEnd || "",
      overtimeStart: s.overtimeStart || "",
      overtimeRate: s.overtimeRate,
      graceMinutes: s.graceMinutes,
      scanInStart: s.scanInStart || "",
      scanInEnd: s.scanInEnd || "",
      scanOutStart: s.scanOutStart || "",
      scanOutEnd: s.scanOutEnd || "",
    });
    setShiftModal("edit");
  };

  const saveShift = async () => {
    setSubmitting(true);
    try {
      // Convert empty strings to null for optional times
      const payload: any = { ...shiftForm };
      for (const k of ["breakStart", "breakEnd", "overtimeStart", "scanInStart", "scanInEnd", "scanOutStart", "scanOutEnd"]) {
        if (!payload[k]) payload[k] = null;
      }
      const url = shiftModal === "edit" && selectedShift
        ? `/api/attendance/schedule/${selectedShift.id}`
        : "/api/attendance/schedule";
      const res = await fetch(url, {
        method: shiftModal === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan shift");
        return;
      }
      setShiftModal(null);
      setSelectedShift(null);
      fetchShifts();
    } catch {
      alert("Gagal menyimpan shift");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteShift = async () => {
    if (!selectedShift) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/attendance/schedule/${selectedShift.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Gagal menghapus shift");
        return;
      }
      setShiftModal(null);
      setSelectedShift(null);
      fetchShifts();
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Jadwal handlers ----------
  const openAddJadwal = () => {
    setJadwalForm({ name: "", days: defaultDays() });
    setJadwalModal("add");
  };
  const openEditJadwal = (ws: WorkSchedule) => {
    setSelectedJadwal(ws);
    // normalize to 7 days ordered
    const days = defaultDays().map((d) => {
      const found = ws.days.find((x) => x.dayOfWeek === d.dayOfWeek);
      return found ? { dayOfWeek: d.dayOfWeek, isDayOff: found.isDayOff, shiftId: found.shiftId } : d;
    });
    setJadwalForm({ name: ws.name, days });
    setJadwalModal("edit");
  };

  const setDay = (dow: number, patch: Partial<WorkScheduleDay>) => {
    setJadwalForm((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.dayOfWeek === dow ? { ...d, ...patch } : d)),
    }));
  };

  const saveJadwal = async () => {
    // validate working days have shift
    for (const d of jadwalForm.days) {
      if (!d.isDayOff && !d.shiftId) {
        alert(`Hari ${DAY_NAMES[d.dayOfWeek]} adalah hari kerja tapi belum pilih shift.`);
        return;
      }
    }
    setSubmitting(true);
    try {
      const url = jadwalModal === "edit" && selectedJadwal
        ? `/api/attendance/work-schedule/${selectedJadwal.id}`
        : "/api/attendance/work-schedule";
      const res = await fetch(url, {
        method: jadwalModal === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: jadwalForm.name, days: jadwalForm.days }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan jadwal");
        return;
      }
      setJadwalModal(null);
      setSelectedJadwal(null);
      fetchWorkSchedules();
    } finally {
      setSubmitting(false);
    }
  };

  const deleteJadwal = async () => {
    if (!selectedJadwal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/attendance/work-schedule/${selectedJadwal.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Gagal menghapus jadwal");
        return;
      }
      setJadwalModal(null);
      setSelectedJadwal(null);
      fetchWorkSchedules();
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Assign handlers ----------
  const handleAssign = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/attendance/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignData),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Gagal menugaskan jadwal");
        return;
      }
      setShowAssignModal(false);
      setAssignData({ employeeId: "", workScheduleId: "", effectiveFrom: new Date().toISOString().split("T")[0], effectiveTo: "" });
      fetchAssignments();
    } finally {
      setSubmitting(false);
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm("Hapus penugasan ini?")) return;
    const res = await fetch(`/api/attendance/assign?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchAssignments();
  };

  const shiftName = (id: string | null) => shifts.find((s) => s.id === id)?.name;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Absensi", href: "/dashboard/attendance" },
          { label: "Shift & Jadwal" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Shift &amp; Jadwal Kerja</h1>
          <p className="mt-1 text-sm text-slate-400">Buat shift, susun jadwal mingguan, lalu tugaskan ke karyawan</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-full border border-white/[0.08] bg-surface-container/50 p-1 text-sm sm:w-fit">
        {([
          ["shift", "Shift"],
          ["jadwal", "Jadwal"],
          ["assign", "Penugasan"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-full px-4 py-2 font-medium transition-colors sm:flex-none ${
              tab === key ? "bg-primary text-white" : "text-on-surface-variant hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ============ SHIFT TAB ============ */}
      {tab === "shift" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={openAddShift}>+ Tambah Shift</Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
              </div>
            ) : shifts.length === 0 ? (
              <Card variant="glass" className="col-span-full">
                <CardContent className="py-12 text-center text-sm text-slate-400">Belum ada shift</CardContent>
              </Card>
            ) : (
              shifts.map((s) => (
                <Card key={s.id} variant="glass-high">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{s.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{s.startTime} - {s.endTime}</p>
                      </div>
                      <Badge variant={s.isActive ? "success" : "default"} size="sm">{s.isActive ? "Aktif" : "Nonaktif"}</Badge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <Row label="Toleransi Terlambat" value={`${s.graceMinutes} menit`} />
                      {s.breakStart && s.breakEnd && <Row label="Istirahat" value={`${s.breakStart} - ${s.breakEnd}`} />}
                      {s.overtimeStart && <Row label="Lembur Mulai" value={`${s.overtimeStart} (${s.overtimeRate}x)`} />}
                      {(s.scanInStart || s.scanInEnd) && <Row label="Scan Masuk" value={`${s.scanInStart || "?"} - ${s.scanInEnd || "?"}`} />}
                      {(s.scanOutStart || s.scanOutEnd) && <Row label="Scan Pulang" value={`${s.scanOutStart || "?"} - ${s.scanOutEnd || "?"}`} />}
                      <Row label="Dipakai di Jadwal" value={`${s._count.workScheduleDays} hari`} />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => openEditShift(s)} className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-on-surface transition-colors hover:bg-white/[0.08]">Edit</button>
                      <button onClick={() => { setSelectedShift(s); setShiftModal("delete"); }} className="rounded-xl border border-error/20 bg-error/5 px-3 py-2 text-xs font-medium text-error transition-colors hover:bg-red-500/10">Hapus</button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============ JADWAL TAB ============ */}
      {tab === "jadwal" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={openAddJadwal} disabled={shifts.length === 0}>+ Tambah Jadwal</Button>
          </div>
          {shifts.length === 0 && (
            <Card variant="glass"><CardContent className="py-4 text-center text-sm text-slate-400">Buat shift dulu sebelum menyusun jadwal.</CardContent></Card>
          )}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {workSchedules.length === 0 ? (
              <Card variant="glass" className="col-span-full">
                <CardContent className="py-12 text-center text-sm text-slate-400">Belum ada jadwal</CardContent>
              </Card>
            ) : (
              workSchedules.map((ws) => (
                <Card key={ws.id} variant="glass-high">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-white">{ws.name}</h3>
                      <Badge variant="info" size="sm">{ws._count.employees} karyawan</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs">
                      {ws.days.slice().sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((d) => (
                        <div key={d.dayOfWeek} className="rounded-lg border border-white/[0.06] p-2">
                          <div className="font-medium text-slate-400">{DAY_NAMES[d.dayOfWeek].slice(0, 3)}</div>
                          <div className={`mt-1 ${d.isDayOff ? "text-red-400" : "text-white/60"}`}>
                            {d.isDayOff ? "Libur" : d.shift?.name || "-"}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => openEditJadwal(ws)} className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-on-surface transition-colors hover:bg-white/[0.08]">Edit</button>
                      <button onClick={() => { setSelectedJadwal(ws); setJadwalModal("delete"); }} className="rounded-xl border border-error/20 bg-error/5 px-3 py-2 text-xs font-medium text-error transition-colors hover:bg-red-500/10">Hapus</button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ============ ASSIGN TAB ============ */}
      {tab === "assign" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="primary" size="md" onClick={() => setShowAssignModal(true)} disabled={workSchedules.length === 0}>+ Tugaskan Jadwal</Button>
          </div>
          <Card variant="glass-high">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Karyawan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">PIN</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Jadwal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Berlaku Dari</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Sampai</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {assignments.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">Belum ada penugasan</td></tr>
                    ) : assignments.map((a) => (
                      <tr key={a.id} className="transition-colors hover:bg-surface-container/50">
                        <td className="px-4 py-3 text-sm text-white">{a.employee.name}</td>
                        <td className="px-4 py-3 font-mono text-sm text-white">{a.employee.pin}</td>
                        <td className="px-4 py-3 text-sm text-white">{a.workSchedule.name}</td>
                        <td className="px-4 py-3 text-sm text-white">{new Date(a.effectiveFrom).toLocaleDateString("id-ID")}</td>
                        <td className="px-4 py-3 text-sm text-white">{a.effectiveTo ? new Date(a.effectiveTo).toLocaleDateString("id-ID") : "-"}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => deleteAssignment(a.id)} className="text-xs font-medium text-error hover:underline">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============ SHIFT MODAL ============ */}
      {(shiftModal === "add" || shiftModal === "edit") && (
        <Modal title={shiftModal === "add" ? "Tambah Shift" : "Edit Shift"} onClose={() => setShiftModal(null)} wide>
          <div className="space-y-4">
            <Input label="Nama Shift *" placeholder="Contoh: SM1" value={shiftForm.name} onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Jam Masuk *" type="time" value={shiftForm.startTime} onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })} />
              <Input label="Jam Pulang *" type="time" value={shiftForm.endTime} onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })} />
            </div>
            <p className="text-xs font-medium text-slate-400">Batas jendela scan (opsional)</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Scan Masuk Dari" type="time" value={shiftForm.scanInStart} onChange={(e) => setShiftForm({ ...shiftForm, scanInStart: e.target.value })} />
              <Input label="Scan Masuk Sampai" type="time" value={shiftForm.scanInEnd} onChange={(e) => setShiftForm({ ...shiftForm, scanInEnd: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Scan Pulang Dari" type="time" value={shiftForm.scanOutStart} onChange={(e) => setShiftForm({ ...shiftForm, scanOutStart: e.target.value })} />
              <Input label="Scan Pulang Sampai" type="time" value={shiftForm.scanOutEnd} onChange={(e) => setShiftForm({ ...shiftForm, scanOutEnd: e.target.value })} />
            </div>
            <p className="text-xs font-medium text-slate-400">Istirahat &amp; Lembur (opsional)</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Istirahat Mulai" type="time" value={shiftForm.breakStart} onChange={(e) => setShiftForm({ ...shiftForm, breakStart: e.target.value })} />
              <Input label="Istirahat Selesai" type="time" value={shiftForm.breakEnd} onChange={(e) => setShiftForm({ ...shiftForm, breakEnd: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Lembur Mulai" type="time" value={shiftForm.overtimeStart} onChange={(e) => setShiftForm({ ...shiftForm, overtimeStart: e.target.value })} />
              <Input label="Rate Lembur" type="number" step="0.1" min="1" max="5" value={shiftForm.overtimeRate} onChange={(e) => setShiftForm({ ...shiftForm, overtimeRate: parseFloat(e.target.value) || 1.5 })} />
              <Input label="Toleransi (mnt)" type="number" value={shiftForm.graceMinutes} onChange={(e) => setShiftForm({ ...shiftForm, graceMinutes: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShiftModal(null)}>Batal</Button>
            <Button variant="primary" onClick={saveShift} disabled={submitting || !shiftForm.name}>{submitting ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </Modal>
      )}

      {shiftModal === "delete" && selectedShift && (
        <Modal title="Hapus Shift" onClose={() => setShiftModal(null)}>
          <p className="text-sm text-slate-400">Yakin ingin menghapus shift <strong>{selectedShift.name}</strong>?</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShiftModal(null)}>Batal</Button>
            <Button variant="danger" onClick={deleteShift} disabled={submitting}>{submitting ? "Menghapus..." : "Hapus"}</Button>
          </div>
        </Modal>
      )}

      {/* ============ JADWAL MODAL ============ */}
      {(jadwalModal === "add" || jadwalModal === "edit") && (
        <Modal title={jadwalModal === "add" ? "Tambah Jadwal" : "Edit Jadwal"} onClose={() => setJadwalModal(null)} wide>
          <div className="space-y-4">
            <Input label="Nama Jadwal *" placeholder="Contoh: Jadwal Kantor" value={jadwalForm.name} onChange={(e) => setJadwalForm({ ...jadwalForm, name: e.target.value })} />
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400">Atur tiap hari — centang Libur atau pilih shift</p>
              {jadwalForm.days.map((d) => (
                <div key={d.dayOfWeek} className="flex items-center gap-3 rounded-xl border border-white/[0.06] p-2">
                  <span className="w-16 text-sm text-white">{DAY_NAMES[d.dayOfWeek]}</span>
                  <label className="flex items-center gap-1.5 text-xs text-slate-400">
                    <input type="checkbox" checked={d.isDayOff} onChange={(e) => setDay(d.dayOfWeek, { isDayOff: e.target.checked, shiftId: e.target.checked ? null : d.shiftId })} className="h-4 w-4 rounded border-white/20 accent-primary" />
                    Libur
                  </label>
                  <select
                    value={d.shiftId || ""}
                    disabled={d.isDayOff}
                    onChange={(e) => setDay(d.dayOfWeek, { shiftId: e.target.value || null })}
                    className="h-10 flex-1 rounded-xl border border-white/[0.08] bg-surface-container px-3 text-sm text-on-surface disabled:opacity-40 focus:border-primary/50 focus:outline-none"
                  >
                    <option value="">{d.isDayOff ? "— Libur —" : "Pilih shift"}</option>
                    {shifts.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>))}
                  </select>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setJadwalModal(null)}>Batal</Button>
            <Button variant="primary" onClick={saveJadwal} disabled={submitting || !jadwalForm.name}>{submitting ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </Modal>
      )}

      {jadwalModal === "delete" && selectedJadwal && (
        <Modal title="Hapus Jadwal" onClose={() => setJadwalModal(null)}>
          <p className="text-sm text-slate-400">Yakin ingin menghapus jadwal <strong>{selectedJadwal.name}</strong>?</p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setJadwalModal(null)}>Batal</Button>
            <Button variant="danger" onClick={deleteJadwal} disabled={submitting}>{submitting ? "Menghapus..." : "Hapus"}</Button>
          </div>
        </Modal>
      )}

      {/* ============ ASSIGN MODAL ============ */}
      {showAssignModal && (
        <Modal title="Tugaskan Jadwal ke Karyawan" onClose={() => setShowAssignModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Karyawan *</label>
              <select value={assignData.employeeId} onChange={(e) => setAssignData({ ...assignData, employeeId: e.target.value })} className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface focus:border-primary/50 focus:outline-none">
                <option value="">Pilih Karyawan</option>
                {employees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name} ({emp.pin})</option>))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Jadwal *</label>
              <select value={assignData.workScheduleId} onChange={(e) => setAssignData({ ...assignData, workScheduleId: e.target.value })} className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface focus:border-primary/50 focus:outline-none">
                <option value="">Pilih Jadwal</option>
                {workSchedules.map((ws) => (<option key={ws.id} value={ws.id}>{ws.name}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Berlaku Dari *" type="date" value={assignData.effectiveFrom} onChange={(e) => setAssignData({ ...assignData, effectiveFrom: e.target.value })} />
              <Input label="Sampai (opsional)" type="date" value={assignData.effectiveTo} onChange={(e) => setAssignData({ ...assignData, effectiveTo: e.target.value })} />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Batal</Button>
            <Button variant="primary" onClick={handleAssign} disabled={submitting || !assignData.employeeId || !assignData.workScheduleId}>{submitting ? "Menyimpan..." : "Simpan"}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}

function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className={`glass max-h-[90vh] w-full overflow-y-auto rounded-3xl border border-white/[0.08] p-6 ${wide ? "max-w-lg" : "max-w-md"}`}>
        <h3 className="mb-6 text-lg font-semibold text-white">{title}</h3>
        {children}
      </div>
    </div>
  );
}
