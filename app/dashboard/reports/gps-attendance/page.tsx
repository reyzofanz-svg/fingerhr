"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FilterControls } from "./components/FilterControls";
import { AttendanceTable } from "./components/AttendanceTable";
import { DetailModal } from "./components/DetailModal";
import { SummaryCards } from "./components/SummaryCards";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePin: string;
  department: string;
  scanTime: string;
  status: "IN" | "OUT";
  type: string;
  selfieUrl: string | null;
  backgroundUrl: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  spotName: string | null;
  distance: number | null;
  isInSpot: boolean | null;
  approvalStatus: string;
  approvedBy: string | null;
  approvalNote: string | null;
}

interface Filters {
  startDate: string;
  endDate: string;
  employeeId: string;
  approvalStatus: string;
  inOutArea: string;
}

export default function GPSAttendanceReportPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [filters, setFilters] = useState<Filters>({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    employeeId: "",
    approvalStatus: "",
    inOutArea: "",
  });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("startDate", filters.startDate);
      params.append("endDate", filters.endDate);
      if (filters.employeeId) params.append("employeeId", filters.employeeId);
      if (filters.approvalStatus) params.append("approvalStatus", filters.approvalStatus);
      if (filters.inOutArea) params.append("inOutArea", filters.inOutArea);

      const res = await fetch(`/api/admin/reports/gps-attendance?${params.toString()}`);
      const data = await res.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error("Failed to fetch GPS attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/attendance/logs/${id}/approve`, { method: "PUT" });
      fetchRecords();
    } catch (error) {
      console.error("Failed to approve:", error);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await fetch(`/api/attendance/logs/${id}/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      fetchRecords();
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  const handleBulkApprove = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => 
        fetch(`/api/attendance/logs/${id}/approve`, { method: "PUT" })
      ));
      fetchRecords();
    } catch (error) {
      console.error("Failed to bulk approve:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Laporan", href: "/dashboard/reports" },
            { label: "Absensi GPS" },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-on-surface">Laporan Absensi GPS</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Monitoring absensi dari aplikasi ponsel karyawan
          </p>
        </motion.div>

        <SummaryCards records={records} loading={loading} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FilterControls
            filters={filters}
            onFilterChange={setFilters}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AttendanceTable
            records={records}
            loading={loading}
            onSelectRecord={setSelectedRecord}
            onApprove={handleApprove}
            onReject={handleReject}
            onBulkApprove={handleBulkApprove}
          />
        </motion.div>
      </div>

      {selectedRecord && (
        <DetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
