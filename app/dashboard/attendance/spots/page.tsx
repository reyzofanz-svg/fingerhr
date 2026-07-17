"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { Breadcrumbs } from "@/components/layout";

interface AttendanceSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
}

export default function SpotsPage() {
  const [spots, setSpots] = useState<AttendanceSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState<AttendanceSpot | null>(null);
  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: "100",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSpots = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance/spots");
      const data = await res.json();
      setSpots(data);
    } catch (error) {
      console.error("Failed to fetch spots:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpots();
  }, [fetchSpots]);

  const handleSubmit = async () => {
    if (!form.name || !form.latitude || !form.longitude) return;

    setSubmitting(true);
    try {
      const url = editingSpot
        ? "/api/attendance/spots"
        : "/api/attendance/spots";
      const method = editingSpot ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingSpot && { id: editingSpot.id }),
          name: form.name,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          radius: parseInt(form.radius),
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingSpot(null);
        setForm({ name: "", latitude: "", longitude: "", radius: "100" });
        fetchSpots();
      }
    } catch (error) {
      console.error("Failed to save spot:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus spot ini?")) return;

    try {
      await fetch(`/api/attendance/spots?id=${id}`, { method: "DELETE" });
      fetchSpots();
    } catch (error) {
      console.error("Failed to delete spot:", error);
    }
  };

  const handleEdit = (spot: AttendanceSpot) => {
    setEditingSpot(spot);
    setForm({
      name: spot.name,
      latitude: spot.latitude.toString(),
      longitude: spot.longitude.toString(),
      radius: spot.radius.toString(),
    });
    setShowForm(true);
  };

  const handleToggleActive = async (spot: AttendanceSpot) => {
    try {
      await fetch("/api/attendance/spots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: spot.id,
          isActive: !spot.isActive,
        }),
      });
      fetchSpots();
    } catch (error) {
      console.error("Failed to toggle spot:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Absensi", href: "/dashboard/attendance" },
          { label: "Titik Absensi" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Titik Absensi
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Kelola lokasi GPS untuk absensi mobile
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingSpot(null);
            setForm({ name: "", latitude: "", longitude: "", radius: "100" });
            setShowForm(true);
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Spot
        </Button>
      </div>

      {/* Spots List */}
      <Card variant="glass-high">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
            </div>
          ) : spots.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06]">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">Belum ada titik absensi</p>
              <p className="mt-1 text-xs text-slate-400">
                Klik &quot;Tambah Spot&quot; untuk menambahkan lokasi
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {spots.map((spot) => (
                <div
                  key={spot.id}
                  className="flex items-center justify-between px-4 py-4 sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                      <svg className="h-5 w-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{spot.name}</p>
                      <p className="text-xs text-slate-400">
                        {spot.latitude.toFixed(6)}, {spot.longitude.toFixed(6)} | Radius: {spot.radius}m
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(spot)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        spot.isActive
                          ? "bg-green-500/10 text-green-400"
                          : "bg-white/[0.06] text-white/40"
                      }`}
                    >
                      {spot.isActive ? "Aktif" : "Nonaktif"}
                    </button>
                    <button
                      onClick={() => handleEdit(spot)}
                      className="rounded-lg p-2 text-white/40 hover:bg-white/[0.06]"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(spot.id)}
                      className="rounded-lg p-2 text-white/40 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-surface-container-high p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              {editingSpot ? "Edit Spot" : "Tambah Spot Baru"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Nama</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Kantor Pusat"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Latitude</label>
                  <Input
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    placeholder="-6.2088"
                    type="number"
                    step="any"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Longitude</label>
                  <Input
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    placeholder="106.8456"
                    type="number"
                    step="any"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">Radius (meter)</label>
                <Input
                  value={form.radius}
                  onChange={(e) => setForm({ ...form, radius: e.target.value })}
                  placeholder="100"
                  type="number"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSpot(null);
                  }}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={submitting || !form.name || !form.latitude || !form.longitude}
                  className="flex-1"
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
