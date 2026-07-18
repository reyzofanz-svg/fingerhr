"use client";

import { useState } from "react";

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

interface AttendanceTableProps {
  records: AttendanceRecord[];
  loading: boolean;
  onSelectRecord: (record: AttendanceRecord) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onBulkApprove: (ids: string[]) => void;
}

export function AttendanceTable({
  records,
  loading,
  onSelectRecord,
  onApprove,
  onReject,
  onBulkApprove,
}: AttendanceTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const toggleSelectAll = () => {
    const pendingRecords = records.filter((r) => r.approvalStatus === "PENDING");
    if (selectedIds.length === pendingRecords.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingRecords.map((r) => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleReject = () => {
    if (showRejectModal && rejectReason) {
      onReject(showRejectModal, rejectReason);
      setShowRejectModal(null);
      setRejectReason("");
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-400";
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400";
      case "REJECTED":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-white/10 text-white/60";
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-surface-container" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 rounded bg-surface-container" />
                <div className="h-3 w-1/3 rounded bg-surface-container" />
              </div>
              <div className="h-6 w-16 rounded-full bg-surface-container" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container">
          <svg className="h-8 w-8 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <p className="text-on-surface-variant">Tidak ada data absensi GPS</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-primary/10 border-b border-outline p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface">
              {selectedIds.length} record dipilih
            </p>
            <button
              onClick={() => onBulkApprove(selectedIds)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary hover:bg-primary/90 transition-colors"
            >
              Approve Semua
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline bg-surface-container/50">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === records.filter((r) => r.approvalStatus === "PENDING").length && records.filter((r) => r.approvalStatus === "PENDING").length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-outline bg-surface-container text-primary focus:ring-primary/20"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Karyawan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Tanggal & Waktu</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Lokasi</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Foto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Approval</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-on-surface-variant">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            {records.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-surface-container/50 cursor-pointer transition-colors"
                onClick={() => onSelectRecord(record)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {record.approvalStatus === "PENDING" && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(record.id)}
                      onChange={() => toggleSelect(record.id)}
                      className="h-4 w-4 rounded border-outline bg-surface-container text-primary focus:ring-primary/20"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-on-surface">{record.employeeName}</p>
                    <p className="text-xs text-on-surface-variant">PIN: {record.employeePin}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-on-surface">{formatDate(record.scanTime)}</p>
                  <p className="text-xs text-on-surface-variant">{formatTime(record.scanTime)}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                    record.status === "IN" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {record.status === "IN" ? "Masuk" : "Pulang"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-on-surface">{record.spotName || "-"}</p>
                    {record.distance !== null && (
                      <p className="text-xs text-on-surface-variant">{Math.round(record.distance)}m</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    {record.selfieUrl && (
                      <img
                        src={record.selfieUrl}
                        alt="Selfie"
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    )}
                    {record.backgroundUrl && (
                      <img
                        src={record.backgroundUrl}
                        alt="Background"
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(record.approvalStatus)}`}>
                    {record.approvalStatus}
                  </span>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {record.approvalStatus === "PENDING" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApprove(record.id)}
                        className="rounded-lg bg-green-500/20 p-1.5 text-green-400 hover:bg-green-500/30 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setShowRejectModal(record.id)}
                        className="rounded-lg bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6">
            <h3 className="text-lg font-bold text-on-surface mb-4">Tolak Absensi</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
              rows={3}
              className="w-full rounded-xl border border-outline bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 rounded-xl bg-surface-container py-3 text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-40"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
