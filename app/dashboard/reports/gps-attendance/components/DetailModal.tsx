"use client";

import { useState, useEffect } from "react";

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

interface DetailModalProps {
  record: AttendanceRecord;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function DetailModal({ record, onClose, onApprove, onReject }: DetailModalProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showFullImage, setShowFullImage] = useState<string | null>(null);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleReject = () => {
    if (rejectReason) {
      onReject(record.id, rejectReason);
      onClose();
    }
  };

  return (
    <>
      {/* Full Image Modal */}
      {showFullImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowFullImage(null)}
        >
          <img
            src={showFullImage}
            alt="Full size"
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
          />
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setShowFullImage(null)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-outline bg-surface p-4">
            <h3 className="text-lg font-bold text-on-surface">Detail Absensi</h3>
            <button
              onClick={onClose}
              className="rounded-lg bg-surface-container p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Employee Info */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-sm font-medium text-on-surface-variant mb-3">Info Karyawan</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-on-surface-variant">Nama</p>
                  <p className="text-sm font-medium text-on-surface">{record.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">PIN</p>
                  <p className="text-sm font-medium text-on-surface">{record.employeePin}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Departemen</p>
                  <p className="text-sm font-medium text-on-surface">{record.department || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Status</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    record.status === "IN" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                  }`}>
                    {record.status === "IN" ? "Masuk" : "Pulang"}
                  </span>
                </div>
              </div>
            </div>

            {/* Time Info */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-sm font-medium text-on-surface-variant mb-3">Detail Waktu</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-on-surface-variant">Tanggal</p>
                  <p className="text-sm font-medium text-on-surface">{formatDate(record.scanTime)}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Waktu</p>
                  <p className="text-sm font-medium text-on-surface">{formatTime(record.scanTime)}</p>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-sm font-medium text-on-surface-variant mb-3">Lokasi GPS</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-on-surface-variant">Latitude</p>
                  <p className="text-sm font-medium text-on-surface">{record.latitude?.toFixed(6) || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Longitude</p>
                  <p className="text-sm font-medium text-on-surface">{record.longitude?.toFixed(6) || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Titik Absen</p>
                  <p className="text-sm font-medium text-on-surface">{record.spotName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Jarak</p>
                  <p className="text-sm font-medium text-on-surface">
                    {record.distance !== null ? `${Math.round(record.distance)}m` : "-"}
                  </p>
                </div>
              </div>
              {record.latitude && record.longitude && (
                <div className="mt-3 h-48 rounded-xl overflow-hidden bg-surface-container">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${record.longitude - 0.01},${record.latitude - 0.01},${record.longitude + 0.01},${record.latitude + 0.01}&layer=mapnik&marker=${record.latitude},${record.longitude}`}
                  />
                </div>
              )}
            </div>

            {/* Photos */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-sm font-medium text-on-surface-variant mb-3">Foto Dokumentasi</h4>
              <div className="grid grid-cols-2 gap-3">
                {record.selfieUrl ? (
                  <button
                    onClick={() => setShowFullImage(record.selfieUrl)}
                    className="group relative overflow-hidden rounded-xl"
                  >
                    <img
                      src={record.selfieUrl}
                      alt="Selfie"
                      className="aspect-[3/4] w-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                      </svg>
                    </div>
                    <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1">
                      <p className="text-xs text-white">Foto Wajah</p>
                    </div>
                  </button>
                ) : (
                  <div className="aspect-[3/4] rounded-xl bg-surface-container flex items-center justify-center">
                    <p className="text-xs text-on-surface-variant">Tidak ada foto</p>
                  </div>
                )}
                {record.backgroundUrl ? (
                  <button
                    onClick={() => setShowFullImage(record.backgroundUrl)}
                    className="group relative overflow-hidden rounded-xl"
                  >
                    <img
                      src={record.backgroundUrl}
                      alt="Background"
                      className="aspect-[3/4] w-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                      </svg>
                    </div>
                    <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1">
                      <p className="text-xs text-white">Foto Sekitar</p>
                    </div>
                  </button>
                ) : (
                  <div className="aspect-[3/4] rounded-xl bg-surface-container flex items-center justify-center">
                    <p className="text-xs text-on-surface-variant">Tidak ada foto</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {record.notes && (
              <div className="glass rounded-xl p-4">
                <h4 className="text-sm font-medium text-on-surface-variant mb-2">Catatan</h4>
                <p className="text-sm text-on-surface">{record.notes}</p>
              </div>
            )}

            {/* Approval Status */}
            <div className="glass rounded-xl p-4">
              <h4 className="text-sm font-medium text-on-surface-variant mb-3">Status Approval</h4>
              <div className="flex items-center gap-3">
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                  record.approvalStatus === "APPROVED"
                    ? "bg-green-500/20 text-green-400"
                    : record.approvalStatus === "PENDING"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {record.approvalStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {record.approvalStatus === "PENDING" && (
            <div className="sticky bottom-0 border-t border-outline bg-surface p-4">
              {showRejectForm ? (
                <div className="space-y-3">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Alasan penolakan..."
                    rows={2}
                    className="w-full rounded-xl border border-outline bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowRejectForm(false);
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
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="flex-1 rounded-xl bg-red-500/20 py-3 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      onApprove(record.id);
                      onClose();
                    }}
                    className="flex-1 rounded-xl bg-green-500 py-3 text-sm font-medium text-white hover:bg-green-600 transition-colors"
                  >
                    Setujui
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
