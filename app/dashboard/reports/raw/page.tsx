"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout";

interface AttendanceLog {
  id: string;
  scanTime: string;
  verifyMethod: string | null;
  status: string;
  type: string;
  employee: { name: string; pin: string; department: string | null };
  device: { name: string };
}

interface Employee {
  id: string;
  name: string;
  pin: string;
}

interface Device {
  id: string;
  cloudId: string;
  name: string;
  status: string;
  lastSync: string | null;
  totalScans: number;
}

export default function RawReportsPage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [exporting, setExporting] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    employeeId: "",
    deviceId: "",
    scanDate: new Date().toISOString().split("T")[0],
    scanTime: new Date().toTimeString().slice(0, 5),
    verifyMethod: "1",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>("");

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 86400000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterDevice, setFilterDevice] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      if (filterEmployee) params.set("employeeId", filterEmployee);
      if (filterDevice) params.set("deviceId", filterDevice);

      const res = await fetch(`/api/attendance/logs?${params.toString()}`);
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filterEmployee, filterDevice]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/devices");
      const data = await res.json();
      setDevices(data);
      if (data.length > 0 && !selectedDevice) {
        setSelectedDevice(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDevices();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh setiap 10 detik
  useEffect(() => {
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const handleManualAttendance = async () => {
    if (!manualForm.employeeId || !manualForm.deviceId || !manualForm.scanDate || !manualForm.scanTime) {
      setSubmitStatus("All fields are required");
      setTimeout(() => setSubmitStatus(""), 3000);
      return;
    }

    setSubmitting(true);
    try {
      const scanDateTime = `${manualForm.scanDate}T${manualForm.scanTime}:00+07:00`;
      const res = await fetch("/api/attendance/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: manualForm.employeeId,
          deviceId: manualForm.deviceId,
          scanTime: scanDateTime,
          verifyMethod: manualForm.verifyMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitStatus(data.error || "Failed to add attendance");
        setTimeout(() => setSubmitStatus(""), 3000);
        return;
      }

      setSubmitStatus("Attendance added successfully!");
      setTimeout(() => {
        setSubmitStatus("");
        setShowManualForm(false);
        setManualForm({
          employeeId: "",
          deviceId: "",
          scanDate: new Date().toISOString().split("T")[0],
          scanTime: new Date().toTimeString().slice(0, 5),
          verifyMethod: "1",
        });
        fetchLogs();
      }, 1500);
    } catch (error) {
      setSubmitStatus("Failed to add attendance");
      setTimeout(() => setSubmitStatus(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadFromDevice = async () => {
    if (!selectedDevice) {
      alert("Select a device first");
      return;
    }

    setDownloading(true);
    setDownloadStatus("Sending command to device...");

    try {
      const device = devices.find((d) => d.id === selectedDevice);
      if (!device) return;

      const cmdRes = await fetch(`/api/devices/${device.id}/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: "GET_ATTLOG",
          startDate,
          endDate,
        }),
      });

      const result = await cmdRes.json();

      if (!cmdRes.ok) {
        setDownloadStatus("Failed: " + (result.error || "Unknown error"));
        setTimeout(() => setDownloadStatus(""), 3000);
        return;
      }

      if (result.success) {
        setDownloadStatus("Success! Data saved to database.");
        fetchLogs();
        fetchDevices();
        setTimeout(() => setDownloadStatus(""), 3000);
      } else {
        setDownloadStatus("Failed: " + (result.error || "Unknown error"));
        setTimeout(() => setDownloadStatus(""), 3000);
      }
    } catch (error) {
      setDownloadStatus("Failed to retrieve data from device");
      setTimeout(() => setDownloadStatus(""), 3000);
    } finally {
      setDownloading(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("startDate", startDate);
      params.set("endDate", endDate);
      if (filterEmployee) params.set("employeeId", filterEmployee);

      const res = await fetch(`/api/export/excel?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-report-${startDate}-${endDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const getVerifyMethod = (method: string | null) => {
    switch (method) {
      case "1":
        return "Password";
      case "2":
        return "Fingerprint";
      case "3":
        return "Card";
      default:
        return "-";
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Stats
  const totalIn = logs.filter((l) => l.status === "IN").length;
  const totalOut = logs.filter((l) => l.status === "OUT").length;
  const uniqueEmployees = new Set(logs.map((l) => l.employee.pin)).size;
  const selectedDeviceName =
    devices.find((d) => d.id === selectedDevice)?.name || "-";

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Reports", href: "/dashboard/reports" },
          { label: "Device Attendance" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Device Attendance Report
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Pull attendance data directly from the fingerprint device
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowManualForm(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Manual Attendance
        </Button>
      </div>

      {/* Download Section */}
      <Card variant="glass-high">
        <CardContent className="py-4 sm:py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-white">
                Select Device
              </label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface transition-all focus:border-primary/50 focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Select Device --</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name} ({device.cloudId})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-3">
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleDownloadFromDevice}
              disabled={downloading || !selectedDevice}
              className="w-full sm:w-auto"
            >
              {downloading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
              )}
              {downloading ? "Fetching Data..." : "Pull Data from Device"}
            </Button>
          </div>
          {downloadStatus && (
            <div
              className={`mt-3 rounded-lg px-4 py-2 text-sm ${
                downloadStatus.includes("Success")
                  ? "bg-white/[0.06] text-white/60"
                  :                 downloadStatus.includes("Failed")
                  ? "bg-error/10 text-red-400"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              {downloadStatus}
            </div>
          )}
          <p className="mt-2 text-xs text-slate-400">
            Active device: <span className="font-medium text-white">{selectedDeviceName}</span> | Real-time webhook data + manual download
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card variant="glass">
          <CardContent className="py-3 sm:py-4">
            <p className="text-xs font-medium text-slate-400">Total Record</p>
            <p className="mt-1 text-xl font-semibold text-on-surface sm:text-2xl">{logs.length}</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="py-3 sm:py-4">
            <p className="text-xs font-medium text-slate-400">Scan In</p>
            <p className="mt-1 text-xl font-semibold text-white/60 sm:text-2xl">{totalIn}</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="py-3 sm:py-4">
            <p className="text-xs font-medium text-slate-400">Scan Out</p>
            <p className="mt-1 text-xl font-semibold text-white/60 sm:text-2xl">{totalOut}</p>
          </CardContent>
        </Card>
        <Card variant="glass">
          <CardContent className="py-3 sm:py-4">
            <p className="text-xs font-medium text-slate-400">Unique Employees</p>
            <p className="mt-1 text-xl font-semibold text-on-surface sm:text-2xl">{uniqueEmployees}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Table */}
      <Card variant="glass-high">
        <CardContent className="p-0">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 border-b border-white/[0.08] px-4 py-4 sm:flex-row sm:items-end sm:px-6">
            <div className="w-full sm:w-48">
              <label className="mb-2 block text-sm font-medium text-white">
                Filter Employee
              </label>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface transition-all focus:border-primary/50 focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.pin})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-48">
              <label className="mb-2 block text-sm font-medium text-white">
                Filter Device
              </label>
              <select
                value={filterDevice}
                onChange={(e) => setFilterDevice(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface transition-all focus:border-primary/50 focus:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">All Devices</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              <Button variant="secondary" onClick={fetchLogs} className="flex-1 sm:flex-none">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Refresh
              </Button>
              <Button
                variant="secondary"
                onClick={handleExportExcel}
                disabled={exporting || logs.length === 0}
                className="flex-1 sm:flex-none"
              >
                {exporting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                )}
                Export Excel
              </Button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06]">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">
                No attendance data yet
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Click &quot;Pull Data from Device&quot; to retrieve data from the device
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="hidden w-full sm:table">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">
                      PIN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">
                      Employee Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {logs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-surface-container/50"
                    >
                      <td className="px-6 py-3 text-xs text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-sm text-white">{formatDate(log.scanTime)}</p>
                        <p className="font-mono text-xs text-slate-400">
                          {formatTime(log.scanTime)}
                        </p>
                      </td>
                      <td className="px-6 py-3 font-mono text-sm text-white">
                        {log.employee.pin}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-white">
                        {log.employee.name}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-400">
                        {log.employee.department || "-"}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={log.status === "IN" ? "success" : "info"}
                          size="sm"
                        >
                          {log.status === "IN" ? "Clock In" : "Clock Out"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-400">
                        {getVerifyMethod(log.verifyMethod)}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-400">
                        {log.device.name}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          variant={
                            log.type === "realtime" ? "success" : "default"
                          }
                          size="sm"
                        >
                          {log.type === "realtime" ? "Realtime" : "Manual"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-white/[0.05]">
                {logs.map((log, idx) => (
                  <div key={log.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{log.employee.name}</p>
                        <p className="font-mono text-xs text-slate-400">PIN: {log.employee.pin}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === "IN" ? "success" : "info"} size="sm">
                          {log.status === "IN" ? "Clock In" : "Clock Out"}
                        </Badge>
                        <Badge variant={log.type === "realtime" ? "success" : "default"} size="sm">
                          {log.type === "realtime" ? "RT" : "Manual"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="font-mono">{formatDate(log.scanTime)} {formatTime(log.scanTime)}</span>
                      <span>{getVerifyMethod(log.verifyMethod)}</span>
                      <span>{log.device.name}</span>
                    </div>
                    {log.employee.department && (
                      <p className="text-xs text-slate-400">{log.employee.department}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Attendance Modal */}
      {showManualForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowManualForm(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-surface-container-high shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Add Manual Attendance</h2>
              <button onClick={() => setShowManualForm(false)} className="rounded-lg p-1 text-on-surface-variant hover:bg-white/[0.03]">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 px-6 py-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Employee *</label>
                <select
                  value={manualForm.employeeId}
                  onChange={(e) => setManualForm({ ...manualForm, employeeId: e.target.value })}
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.pin})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Device *</label>
                <select
                  value={manualForm.deviceId}
                  onChange={(e) => setManualForm({ ...manualForm, deviceId: e.target.value })}
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select Device</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Date *</label>
                  <Input
                    type="date"
                    value={manualForm.scanDate}
                    onChange={(e) => setManualForm({ ...manualForm, scanDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Time *</label>
                  <Input
                    type="time"
                    value={manualForm.scanTime}
                    onChange={(e) => setManualForm({ ...manualForm, scanTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Verification Method</label>
                <select
                  value={manualForm.verifyMethod}
                  onChange={(e) => setManualForm({ ...manualForm, verifyMethod: e.target.value })}
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-surface-container px-4 text-sm text-on-surface transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="1">Password</option>
                  <option value="2">Fingerprint</option>
                  <option value="3">Card</option>
                </select>
              </div>
              <p className="text-xs text-slate-400">
                Status (Clock In/Out) will be determined automatically based on the attendance sequence for today.
              </p>
            </div>
            {submitStatus && (
              <div className={`mx-6 rounded-lg px-4 py-2 text-sm ${submitStatus.includes("berhasil") ? "bg-white/[0.06] text-white/60" : "bg-error/10 text-red-400"}`}>
                {submitStatus}
              </div>
            )}
            <div className="flex items-center justify-end gap-3 border-t border-white/[0.08] px-6 py-4">
              <Button variant="secondary" onClick={() => setShowManualForm(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleManualAttendance} disabled={submitting}>
                {submitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
