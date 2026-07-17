"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const LocationMap = dynamic(
  () => import("@/components/mobile/LocationMap").then((mod) => mod.LocationMap),
  { ssr: false }
);

interface Location {
  latitude: number;
  longitude: number;
}

interface Spot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface AttendanceResult {
  success: boolean;
  message: string;
  distance?: number;
  nearestSpot?: string;
  isInSpot: boolean;
}

interface Employee {
  id: string;
  name: string;
  pin: string;
}

type PhotoField = "selfie" | "background" | "attachment";

export default function MobileAttendancePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isInSpot, setIsInSpot] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [attendanceType, setAttendanceType] = useState<"IN" | "OUT">("IN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [cameraError, setCameraError] = useState<string>("");

  // Photo states
  const [selfie, setSelfie] = useState<string | null>(null);
  const [background, setBackground] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Camera popup
  const [showCamera, setShowCamera] = useState(false);
  const [activeField, setActiveField] = useState<PhotoField | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("fingerhr_token");
    const employeeData = localStorage.getItem("fingerhr_employee");

    if (!token || !employeeData) {
      router.push("/mobile/login");
      return;
    }

    try {
      setEmployee(JSON.parse(employeeData));
    } catch {
      router.push("/mobile/login");
    }
  }, [router]);

  // Fetch attendance spots
  useEffect(() => {
    fetch("/api/attendance/spots")
      .then((res) => res.json())
      .then((data) => setSpots(data.filter((s: Spot & { isActive: boolean }) => s.isActive)))
      .catch(console.error);
  }, []);

  // Get GPS location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(userLoc);

          if (spots.length > 0) {
            const inSpot = spots.some((spot) => {
              const distance = calculateDistance(
                userLoc.latitude,
                userLoc.longitude,
                spot.latitude,
                spot.longitude
              );
              return distance <= spot.radius;
            });
            setIsInSpot(inSpot);
          }
        },
        (error) => {
          setLocationError("Tidak bisa mendapatkan lokasi. Aktifkan GPS.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Browser tidak mendukung geolocation.");
    }
  }, [spots]);

  const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Open camera popup
  const openCamera = useCallback((field: PhotoField) => {
    setActiveField(field);
    setShowCamera(true);
    setCameraError("");
    setFacingMode(field === "selfie" ? "user" : "environment");
  }, []);

  // Start camera
  useEffect(() => {
    if (!showCamera || !videoRef.current) return;

    let stream: MediaStream | null = null;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: 640, height: 480 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setCameraError("");
        }
      } catch (error) {
        setCameraError("Kamera tidak bisa diakses. Berikan izin kamera.");
      }
    };

    start();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
    };
  }, [showCamera, facingMode]);

  // Capture photo from popup
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const photoData = canvas.toDataURL("image/jpeg", 0.8);

      if (activeField === "selfie") setSelfie(photoData);
      else if (activeField === "background") setBackground(photoData);
      else if (activeField === "attachment") setAttachment(photoData);
    }

    setIsCapturing(false);
    setShowCamera(false);
    setActiveField(null);
  }, [activeField]);

  // Close camera popup
  const closeCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setShowCamera(false);
    setActiveField(null);
  }, []);

  // Delete photo
  const deletePhoto = useCallback((field: PhotoField) => {
    if (field === "selfie") setSelfie(null);
    else if (field === "background") setBackground(null);
    else if (field === "attachment") setAttachment(null);
  }, []);

  // Submit attendance
  const submitAttendance = useCallback(async () => {
    if (!selfie || !location || !employee) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/mobile/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          selfieUrl: selfie,
          backgroundUrl: background,
          attachmentUrl: attachment,
          notes: notes || null,
          latitude: location.latitude,
          longitude: location.longitude,
          type: attendanceType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: data.message,
          distance: data.distance,
          nearestSpot: data.nearestSpot,
          isInSpot: data.isInSpot,
        });
        setSelfie(null);
        setBackground(null);
        setAttachment(null);
        setNotes("");
      } else {
        setResult({
          success: false,
          message: data.error || "Gagal mengirim absensi",
          isInSpot: false,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Terjadi kesalahan. Coba lagi.",
        isInSpot: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selfie, background, attachment, notes, location, attendanceType, employee]);

  // Redirect if not logged in
  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080c] p-4 pb-24">
      {/* Camera Popup Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          {/* Camera Header */}
          <div className="flex items-center justify-between p-4">
            <button onClick={closeCamera} className="text-white text-sm">
              Batal
            </button>
            <p className="text-sm font-medium text-white">
              {activeField === "selfie" ? "Foto Depan" : activeField === "background" ? "Foto Belakang" : "Lampiran"}
            </p>
            <div className="w-12" />
          </div>

          {/* Camera View */}
          <div className="relative flex-1">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
              </div>
            )}

            {cameraError && (
              <div className="absolute bottom-24 left-0 right-0 px-8">
                <p className="rounded-xl bg-red-500/20 p-3 text-center text-xs text-red-400">{cameraError}</p>
              </div>
            )}
          </div>

          {/* Capture Button */}
          <div className="flex items-center justify-center gap-6 p-6">
            {activeField === "selfie" && (
              <button
                onClick={() => setFacingMode(f => f === "user" ? "environment" : "user")}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"
              >
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            )}
            <button
              onClick={capturePhoto}
              disabled={isCapturing || !cameraActive}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg transition-transform active:scale-95 disabled:opacity-40"
            >
              {isCapturing ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <div className="w-12" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Absensi</h1>
          <p className="mt-1 text-sm text-white/40">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-white">{employee.name}</p>
          <button
            onClick={() => {
              localStorage.removeItem("fingerhr_token");
              localStorage.removeItem("fingerhr_employee");
              router.push("/mobile/login");
            }}
            className="text-xs text-white/40"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div
          className={`mb-6 rounded-2xl p-4 ${
            result.success
              ? result.isInSpot
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-yellow-500/10 border border-yellow-500/20"
              : "bg-red-500/10 border border-red-500/20"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                result.success
                  ? result.isInSpot
                    ? "bg-green-500/20"
                    : "bg-yellow-500/20"
                  : "bg-red-500/20"
              }`}
            >
              {result.success ? (
                result.isInSpot ? (
                  <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )
              ) : (
                <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium ${
                result.success
                  ? result.isInSpot
                    ? "text-green-400"
                    : "text-yellow-400"
                  : "text-red-400"
              }`}>
                {result.message}
              </p>
              {result.distance !== undefined && (
                <p className="mt-1 text-xs text-white/40">
                  Jarak: {result.distance}m dari {result.nearestSpot}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Section */}
      <div className="mb-4">
        <LocationMap
          userLocation={location}
          spots={spots}
          isInSpot={isInSpot}
        />
      </div>

      {/* Location Status */}
      <div className="mb-4 rounded-xl bg-white/[0.03] p-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              location ? "bg-green-400" : locationError ? "bg-red-400" : "bg-yellow-400 animate-pulse"
            }`}
          />
          <span className="text-xs text-white/60">
            {location
              ? isInSpot
                ? "Anda berada di dalam area absensi"
                : "Anda berada di luar area absensi"
              : locationError || "Mendapatkan lokasi..."}
          </span>
        </div>
        {location && spots.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {spots.map((spot) => {
              const distance = calculateDistance(
                location.latitude,
                location.longitude,
                spot.latitude,
                spot.longitude
              );
              return (
                <div key={spot.id} className="rounded-lg bg-white/[0.06] px-2 py-1">
                  <span className="text-[10px] text-white/60">
                    {spot.name}: {Math.round(distance)}m
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attendance Type Toggle */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setAttendanceType("IN")}
          className={`flex-1 rounded-xl py-3 text-sm font-medium transition-all ${
            attendanceType === "IN"
              ? "bg-white text-black"
              : "bg-white/[0.06] text-white/60"
          }`}
        >
          Masuk
        </button>
        <button
          onClick={() => setAttendanceType("OUT")}
          className={`flex-1 rounded-xl py-3 text-sm font-medium transition-all ${
            attendanceType === "OUT"
              ? "bg-white text-black"
              : "bg-white/[0.06] text-white/60"
          }`}
        >
          Pulang
        </button>
      </div>

      {/* Photo Buttons Grid */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        {/* Selfie */}
        <button
          onClick={() => openCamera("selfie")}
          className={`relative overflow-hidden rounded-2xl ${
            selfie ? "ring-2 ring-green-500" : ""
          }`}
        >
          {selfie ? (
            <div className="relative aspect-[3/4]">
              <img src={selfie} alt="Selfie" className="h-full w-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); deletePhoto("selfie"); }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60"
              >
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5">
                <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 bg-white/[0.03]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06]">
                <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <span className="text-[10px] text-white/40">Foto Depan</span>
            </div>
          )}
        </button>

        {/* Background */}
        <button
          onClick={() => openCamera("background")}
          className={`relative overflow-hidden rounded-2xl ${
            background ? "ring-2 ring-green-500" : ""
          }`}
        >
          {background ? (
            <div className="relative aspect-[3/4]">
              <img src={background} alt="Background" className="h-full w-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); deletePhoto("background"); }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60"
              >
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5">
                <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 bg-white/[0.03]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06]">
                <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <span className="text-[10px] text-white/40">Foto Belakang</span>
            </div>
          )}
        </button>

        {/* Attachment */}
        <button
          onClick={() => openCamera("attachment")}
          className={`relative overflow-hidden rounded-2xl ${
            attachment ? "ring-2 ring-green-500" : ""
          }`}
        >
          {attachment ? (
            <div className="relative aspect-[3/4]">
              <img src={attachment} alt="Lampiran" className="h-full w-full object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); deletePhoto("attachment"); }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60"
              >
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5">
                <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 bg-white/[0.03]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06]">
                <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                </svg>
              </div>
              <span className="text-[10px] text-white/40">Lampiran</span>
            </div>
          )}
        </button>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan (opsional)"
          rows={3}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 resize-none"
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Submit Button */}
      <button
        onClick={submitAttendance}
        disabled={!selfie || !location || isSubmitting}
        className="w-full rounded-xl bg-white py-4 text-sm font-bold text-black transition-all disabled:opacity-40 disabled:active:scale-100"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            Mengirim...
          </div>
        ) : (
          `Absen ${attendanceType === "IN" ? "Masuk" : "Pulang"}`
        )}
      </button>

      {/* History Link */}
      <button
        onClick={() => router.push("/mobile/history")}
        className="mt-4 w-full rounded-xl bg-white/[0.03] py-3 text-sm text-white/60"
      >
        Lihat Riwayat Absensi
      </button>
    </div>
  );
}
