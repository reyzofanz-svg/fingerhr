"use client";

import { useState } from "react";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout";

interface ReportData {
  type: string;
  date: string;
  dateRange: { start: string; end: string };
  summary: {
    totalEmployees: number;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalOvertime: number;
  };
  reports: {
    employeeId: string;
    employeeName: string;
    pin: string;
    department: string | null;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalOvertime: number;
    totalWorkHours: number;
  }[];
}

export default function AutoReportsPage() {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: reportType, date }),
      });

      if (!res.ok) {
        alert("Failed to generate report");
        return;
      }

      const data = await res.json();
      setReportData(data);
    } catch (error) {
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!reportData) return;

    const startDate = reportData.dateRange.start.split("T")[0];
    const endDate = reportData.dateRange.end.split("T")[0];

    const params = new URLSearchParams({ startDate, endDate });
    const res = await fetch(`/api/export/excel?${params.toString()}`);

    if (!res.ok) {
      alert("Failed to export Excel");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${reportType}-${date}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const typeLabels = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Reports", href: "/dashboard/reports" },
          { label: "Auto Reports" },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Auto Reports
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Generate automatic attendance reports based on period
          </p>
        </div>
        {reportData && (
          <Button variant="primary" size="md" onClick={handleExportExcel}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export Excel
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card variant="glass-high">
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="w-full sm:w-48">
              <label className="mb-2 block text-sm font-medium text-white">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as typeof reportType)}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface transition-all focus:border-primary/50 focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Button variant="primary" onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Generate Report"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {reportData && (
        <>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3">
            <p className="text-sm text-slate-400">
              Period: <span className="font-medium text-white">{typeLabels[reportData.type as keyof typeof typeLabels]}</span>
              {" "} | {new Date(reportData.dateRange.start).toLocaleDateString("id-ID")} - {new Date(reportData.dateRange.end).toLocaleDateString("id-ID")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Card variant="glass">
              <CardContent className="py-4 text-center">
                <p className="text-xs font-medium text-slate-400">Total Employees</p>
                <p className="mt-1 text-2xl font-semibold text-white">{reportData.summary.totalEmployees}</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="py-4 text-center">
                <p className="text-xs font-medium text-slate-400">Total Present</p>
                <p className="mt-1 text-2xl font-semibold text-white/60">{reportData.summary.totalPresent}</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="py-4 text-center">
                <p className="text-xs font-medium text-slate-400">Total Late</p>
                <p className="mt-1 text-2xl font-semibold text-white/50">{reportData.summary.totalLate}</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="py-4 text-center">
                <p className="text-xs font-medium text-slate-400">Total Overtime</p>
                <p className="mt-1 text-2xl font-semibold text-white/60">{reportData.summary.totalOvertime}</p>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="py-4 text-center">
                <p className="text-xs font-medium text-slate-400">Total Absent</p>
                <p className="mt-1 text-2xl font-semibold text-white/50">{reportData.summary.totalAbsent}</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Report Table */}
      {reportData && reportData.reports.length > 0 && (
        <Card variant="glass-high">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">PIN</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400">Department</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-400">Present</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-400">Late</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-400">Overtime</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-400">Absent</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-slate-400">Work Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {reportData.reports.map((row) => (
                    <tr key={row.employeeId} className="transition-colors hover:bg-surface-container/50">
                      <td className="px-6 py-4 text-sm font-medium text-white">{row.employeeName}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{row.pin}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{row.department || "-"}</td>
                      <td className="px-6 py-4 text-center text-sm text-white/60">{row.totalPresent}</td>
                      <td className="px-6 py-4 text-center text-sm text-white/50">{row.totalLate}</td>
                      <td className="px-6 py-4 text-center text-sm text-white/60">{row.totalOvertime}</td>
                      <td className="px-6 py-4 text-center text-sm text-white/50">{row.totalAbsent}</td>
                      <td className="px-6 py-4 text-center text-sm text-white">{row.totalWorkHours.toFixed(1)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
