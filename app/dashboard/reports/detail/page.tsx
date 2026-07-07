"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout";

interface Employee {
  id: string;
  name: string;
  pin: string;
  department: string | null;
  position: string | null;
}

interface DailyRow {
  tanggal: string;
  hari: string;
  shiftName: string;
  jadwalMasuk: string;
  jadwalPulang: string;
  absensiMasuk: string;
  terlambat: string;
  absensiPulang: string;
  pulangCepat: string;
  istirahatDurasi: string;
  istirahatLebih: string;
  lemburAwal: string;
  lemburAkhir: string;
  lemburShift: string;
  durasiKerja: string;
  masukKerja: number;
  libur: number;
  keterangan: string;
}

interface Recap {
  kehadiran: number;
  durasiKerja: string;
  pulangAwal: string;
  tidakAbsenMasuk: number;
  alpha: number;
  presentase: string;
  totalDurasi: string;
  istirahatLebih: string;
  tidakAbsenKeluar: number;
  jumlahIzin: number;
  datangTerlambat: string;
}

interface Report {
  employee: Employee;
  periode: { start: string; end: string };
  rows: DailyRow[];
  recap: Recap;
}

function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function DetailReportsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState(firstOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/employees")
      .then((r) => r.json())
      .then((d) => setEmployees(d.employees || []))
      .catch(console.error);
  }, []);

  const generate = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reports/detail?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to generate report");
        return;
      }
      setReport(await res.json());
    } catch {
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = (all: boolean) => {
    const params = new URLSearchParams({ startDate, endDate });
    if (!all && employeeId) params.set("employeeId", employeeId);
    window.open(`/api/reports/detail-excel?${params.toString()}`, "_blank");
  };

  const recapItems = report
    ? [
        ["Attendance", report.recap.kehadiran],
        ["Work Duration", report.recap.durasiKerja],
        ["Early Leave", report.recap.pulangAwal],
        ["No Clock In", report.recap.tidakAbsenMasuk],
        ["Absent", report.recap.alpha],
        ["Percentage", report.recap.presentase],
        ["Total Duration", report.recap.totalDurasi],
        ["Break Over", report.recap.istirahatLebih],
        ["No Clock Out", report.recap.tidakAbsenKeluar],
        ["Leave Count", report.recap.jumlahIzin],
        ["Late Arrivals", report.recap.datangTerlambat],
      ]
    : [];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Reports", href: "/dashboard/reports/detail" },
          { label: "Attendance Detail" },
        ]}
      />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Daily Detail Report</h1>
        <p className="mt-1 text-sm text-slate-400">Attendance detail per employee based on shift &amp; schedule</p>
      </div>

      {/* Filter */}
      <Card variant="glass-high">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Employee</label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface focus:border-primary/50 focus:outline-none"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.pin})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">From Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface focus:border-primary/50 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">To Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface focus:border-primary/50 focus:outline-none" />
            </div>
            <div className="flex items-end">
              <Button variant="primary" className="w-full" onClick={generate} disabled={!employeeId || loading}>
                {loading ? "Processing..." : "Show"}
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={() => exportExcel(false)} disabled={!employeeId}>
              Export Excel (this employee)
            </Button>
            <Button variant="secondary" size="sm" onClick={() => exportExcel(true)}>
              Export Excel (all employees)
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Identity + recap */}
          <Card variant="glass-high">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-white">{report.employee.name}</h2>
                <p className="text-sm text-slate-400">
                  ID: {report.employee.pin} · {report.employee.department || "-"} · {report.employee.position || "-"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {recapItems.map(([label, value]) => (
                  <div key={label as string} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                    <div className="text-xs text-slate-400">{label}</div>
                    <div className="text-sm font-semibold text-white">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Detailed table */}
          <Card variant="glass-high">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400">
                      <th rowSpan={2} className="border-r border-white/[0.06] px-2 py-2 text-left">Date</th>
                      <th rowSpan={2} className="border-r border-white/[0.06] px-2 py-2 text-left">Day</th>
                      <th colSpan={3} className="border-r border-white/[0.06] px-2 py-2 text-center">Provision</th>
                      <th colSpan={4} className="border-r border-white/[0.06] px-2 py-2 text-center">Attendance</th>
                      <th colSpan={2} className="border-r border-white/[0.06] px-2 py-2 text-center">Overtime</th>
                      <th rowSpan={2} className="border-r border-white/[0.06] px-2 py-2 text-center">Work Duration</th>
                      <th rowSpan={2} className="border-r border-white/[0.06] px-2 py-2 text-center">Clock In</th>
                      <th rowSpan={2} className="border-r border-white/[0.06] px-2 py-2 text-center">Day Off</th>
                      <th rowSpan={2} className="px-2 py-2 text-left">Notes</th>
                    </tr>
                    <tr className="border-b border-white/[0.08] text-slate-400">
                      <th className="border-r border-white/[0.06] px-2 py-1.5 text-center font-normal">Shift</th>
                      <th className="border-r border-white/[0.06] px-2 py-1.5 text-center font-normal">Clock In</th>
                      <th className="border-r border-white/[0.06] px-2 py-1.5 text-center font-normal">Clock Out</th>
                      <th className="border-r border-white/[0.06] px-2 py-1.5 text-center font-normal">Attendance In</th>
                      <th className="border-r border-white/[0.06] px-2 py-1.5 text-center font-normal">Late</th>
                      <th className="border-r border-white/[0.06] px-2 py-1.5 text-center font-normal">Attendance Out</th>
                      <th className="border-r border-white/[0.06] px-2 py-1.5 text-center font-normal">Early Out</th>
                      <th className="border-r border-white/[0.06] px-2 py-1.5 text-center font-normal">Early</th>
                      <th className="border-r border-white/[0.06] px-2 py-1.5 text-center font-normal">Late</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {report.rows.map((row, i) => (
                      <tr key={i} className={`text-on-surface ${row.libur === 1 ? "bg-white/[0.02] text-slate-400" : ""}`}>
                        <td className="border-r border-white/[0.06] px-2 py-1.5">{row.tanggal}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5">{row.hari}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.shiftName}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.jadwalMasuk}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.jadwalPulang}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.absensiMasuk}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.terlambat}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.absensiPulang}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.pulangCepat}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.lemburAwal}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.lemburAkhir}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.durasiKerja}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.masukKerja}</td>
                        <td className="border-r border-white/[0.06] px-2 py-1.5 text-center">{row.libur}</td>
                        <td className="px-2 py-1.5">{row.keterangan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
