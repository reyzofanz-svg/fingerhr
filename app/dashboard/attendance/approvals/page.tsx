"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout";

interface PendingApproval {
  id: string;
  scanTime: string;
  status: string;
  type: string;
  selfieUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  isInSpot: boolean | null;
  employee: {
    id: string;
    name: string;
    pin: string;
    department: string | null;
  };
  spot: {
    name: string;
  } | null;
}

export default function ApprovalsPage() {
  const [pendingList, setPendingList] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPending = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance/pending");
      const data = await res.json();
      setPendingList(data);
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id: string, status: "APPROVED" | "REJECTED", note?: string) => {
    setProcessingId(id);
    try {
      await fetch(`/api/attendance/logs/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          approvedBy: "admin",
          note,
        }),
      });
      fetchPending();
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Absensi", href: "/dashboard/attendance" },
          { label: "Approval Mobile" },
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Approval Absensi Mobile
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Approve absensi dari luar titik yang ditentukan
        </p>
      </div>

      {/* Pending List */}
      <Card variant="glass-high">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
            </div>
          ) : pendingList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06]">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Tidak ada yang perlu di-approve</p>
              <p className="mt-1 text-xs text-slate-400">
                Semua absensi mobile sudah di-approve
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {pendingList.map((item) => (
                <div key={item.id} className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {/* Selfie Thumbnail */}
                      {item.selfieUrl ? (
                        <img
                          src={item.selfieUrl}
                          alt={item.employee.name}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06]">
                          <svg className="h-6 w-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.employee.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          PIN: {item.employee.pin} | {item.employee.department || "-"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(item.scanTime)} • {formatTime(item.scanTime)} • {item.status}
                        </p>
                        {item.spot && (
                          <p className="mt-1 text-xs text-yellow-400">
                            Di luar area: {item.spot.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleApprove(item.id, "REJECTED")}
                      disabled={processingId === item.id}
                      className="flex-1"
                    >
                      {processingId === item.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        "Tolak"
                      )}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(item.id, "APPROVED")}
                      disabled={processingId === item.id}
                      className="flex-1"
                    >
                      {processingId === item.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        "Setujui"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
