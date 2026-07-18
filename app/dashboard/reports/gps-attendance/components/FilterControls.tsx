"use client";

import { useState, useEffect } from "react";

interface Employee {
  id: string;
  name: string;
  pin: string;
}

interface Filters {
  startDate: string;
  endDate: string;
  employeeId: string;
  approvalStatus: string;
  inOutArea: string;
}

interface FilterControlsProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export function FilterControls({ filters, onFilterChange }: FilterControlsProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []))
      .catch(console.error);
  }, []);

  return (
    <div className="glass rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <svg className="h-5 w-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
        <h3 className="text-sm font-medium text-on-surface">Filter</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Start Date */}
        <div>
          <label className="mb-1.5 block text-xs text-on-surface-variant">Tanggal Mulai</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="w-full rounded-xl border border-outline bg-surface-container px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="mb-1.5 block text-xs text-on-surface-variant">Tanggal Akhir</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="w-full rounded-xl border border-outline bg-surface-container px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Employee */}
        <div>
          <label className="mb-1.5 block text-xs text-on-surface-variant">Karyawan</label>
          <select
            value={filters.employeeId}
            onChange={(e) => onFilterChange({ ...filters, employeeId: e.target.value })}
            className="w-full rounded-xl border border-outline bg-surface-container px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Semua Karyawan</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.pin})
              </option>
            ))}
          </select>
        </div>

        {/* Approval Status */}
        <div>
          <label className="mb-1.5 block text-xs text-on-surface-variant">Status Approval</label>
          <select
            value={filters.approvalStatus}
            onChange={(e) => onFilterChange({ ...filters, approvalStatus: e.target.value })}
            className="w-full rounded-xl border border-outline bg-surface-container px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Semua Status</option>
            <option value="APPROVED">Disetujui</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>

        {/* In/Out Area */}
        <div>
          <label className="mb-1.5 block text-xs text-on-surface-variant">Lokasi</label>
          <select
            value={filters.inOutArea}
            onChange={(e) => onFilterChange({ ...filters, inOutArea: e.target.value })}
            className="w-full rounded-xl border border-outline bg-surface-container px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Semua Lokasi</option>
            <option value="IN_AREA">Dalam Area</option>
            <option value="OUT_AREA">Luar Area</option>
          </select>
        </div>
      </div>
    </div>
  );
}
