"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MobileHeader } from "@/components/mobile/MobileHeader";

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

type PhotoField = "face" | "surrounding";

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
  const [facePhoto, setFacePhoto] = useState<string | null>(null);
  const [surroundingPhoto, setSurroundingPhoto] = useState<string | null>(null);
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
    setFacingMode(field === "face" ? "user" : "environment");
  }, []);

  // Start camera
  useEffect(() => {
    if (!showCamera) return;

    let stream: MediaStream | null = null;
    let cancelled = false;
    let retryTimer: NodeJS.Timeout;

    const start = async () => {
      if (!videoRef.current) {
        // video element not in DOM yet, retry
        retryTimer = setTimeout(start, 100);
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: 640, height: 480 },
        });
        if (!cancelled && videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setCameraError("");
        }
      } catch (error) {
        if (!cancelled) {
          setCameraError("Kamera tidak bisa diakses. Berikan izin kamera.");
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current?.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
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

      if (activeField === "face") setFacePhoto(photoData);
      else if (activeField === "surrounding") setSurroundingPhoto(photoData);
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
    if (field === "face") setFacePhoto(null);
    else if (field === "surrounding") setSurroundingPhoto(null);
  }, []);

  // Submit attendance
  const submitAttendance = useCallback(async () => {
    if (!facePhoto || !location || !employee) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/mobile/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          facePhotoUrl: facePhoto,
          surroundingPhotoUrl: surroundingPhoto,
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
        setFacePhoto(null);
        setSurroundingPhoto(null);
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
  }, [facePhoto, surroundingPhoto, notes, location, attendanceType, employee]);

  // Redirect if not logged in
  if (!employee) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080c]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Camera Popup Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          {/* Camera Header */}
          <div className="flex items-center justify-between p-4 bg-black/90 backdrop-blur-sm">
            <button onClick={closeCamera} className="text-white text-sm font-medium">
              Batal
            </button>
            <p className="text-sm font-medium text-white">
              {activeField === "face" ? "Identifikasi Wajah" : "Foto Sekitar"}
            </p>
            <div className="w-12" />
          </div>

          {/* Camera View */}
          <div className="relative flex-1">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${cameraActive ? '' : 'hidden'}`}
            />
            {!cameraActive && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center">
                  <div className="loader mx-auto mb-3" />
                  <p className="text-sm text-white/60">Membuka kamera...</p>
                </div>
              </div>
            )}
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black p-8">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/20">
                    <svg className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-sm text-white font-medium mb-2">Tidak dapat mengakses kamera</p>
                  <p className="text-xs text-white/60">{cameraError}</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="bg-black/90 backdrop-blur-sm p-6">
            <div className="flex items-center justify-center gap-8">
              {activeField === "face" && (
                <button
                  onClick={() => setFacingMode(f => f === "user" ? "environment" : "user")}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-all active:scale-95"
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              )}
              <button
                onClick={capturePhoto}
                disabled={isCapturing || !cameraActive}
                className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-2xl transition-transform active:scale-95 disabled:opacity-40 disabled:scale-100"
              >
                {isCapturing ? (
                  <div className="loader" style={{ borderTopColor: '#000', borderColor: 'rgba(0,0,0,0.1)' }} />
                ) : (
                  <>
                    <div className="absolute inset-2 rounded-full border-2 border-black/20" />
                    <svg className="h-8 w-8 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </>
                )}
              </button>
              <div className="w-12" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 pb-4">
        <MobileHeader
          title="Absensi GPS"
          subtitle={new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />

        {/* Result Message */}
        {result && (
          <div
            className={`mb-6 glass rounded-xl p-4 ${
              result.success
                ? result.isInSpot
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-yellow-500/30 bg-yellow-500/10"
                : "border-error/30 bg-error-container"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  result.success
                    ? result.isInSpot
                      ? "bg-green-500/20"
                      : "bg-yellow-500/20"
                    : "bg-error/20"
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
                  <svg className="h-4 w-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  result.success
                    ? result.isInSpot
                      ? "text-green-400"
                      : "text-yellow-400"
                    : "text-on-error-container"
                }`}>
                  {result.message}
                </p>
                {result.distance !== undefined && (
                  <p className="mt-1 text-xs text-on-surface-variant">
                    Jarak: {result.distance}m dari {result.nearestSpot}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Company Info */}
        <div className="mb-4 glass rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-container">
              <svg className="h-4 w-4 text-on-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0v-4a2 2 0 011-1h2a2 2 0 011 1v4m0 0v-9a2 2 0 011-1h2a2 2 0 011 1v9" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-on-surface">PT. ANUGERAH CITRA TEKNOLO...</p>
              <div className="flex items-center gap-1 mt-1">
                <div className={`h-1.5 w-1.5 rounded-full ${isInSpot ? "bg-green-400" : "bg-red-400"}`} />
                <p className="text-xs text-on-surface-variant">
                  {isInSpot ? "Dalam area kerja" : "Di luar area kerja"}
                </p>
              </div>
            </div>
            <button className="rounded-lg bg-surface-container p-2">
              <svg className="h-4 w-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

      {/* Map Section */}
      <div className="mb-4">
        <LocationMap
          userLocation={location}
          spots={spots}
          isInSpot={isInSpot}
        />
      </div>

      {/* Location Status Card */}
      <div className="mb-6 glass rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-on-surface">Status Lokasi</h3>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                location ? (isInSpot ? "bg-green-400" : "bg-yellow-400") : "bg-red-400"
              } ${!location ? "animate-pulse" : ""}`}
            />
            <span className="text-xs text-on-surface-variant">
              {location
                ? isInSpot
                  ? "Area kerja"
                  : "Luar area"
                : locationError || "Mencari lokasi..."}
            </span>
          </div>
        </div>
        
        {location && spots.length > 0 && (
          <div className="space-y-2">
            {spots.map((spot) => {
              const distance = calculateDistance(
                location.latitude,
                location.longitude,
                spot.latitude,
                spot.longitude
              );
              const isInRange = distance <= spot.radius;
              return (
                <div key={spot.id} className="flex items-center justify-between rounded-lg bg-surface-container p-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${isInRange ? "bg-green-400" : "bg-red-400"}`} />
                    <div>
                      <p className="text-sm font-medium text-on-surface">{spot.name}</p>
                      <p className="text-xs text-on-surface-variant">Radius: {spot.radius}m</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${isInRange ? "text-green-400" : "text-on-surface"}`}>
                      {Math.round(distance)}m
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {isInRange ? "Dalam area" : "Jauh"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attendance Type Toggle */}
      <div className="mb-6 glass rounded-xl p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setAttendanceType("IN")}
            className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
              attendanceType === "IN"
                ? "bg-primary text-on-primary shadow-lg"
                : "text-on-surface-variant"
            }`}
          >
            Absen Masuk
          </button>
          <button
            onClick={() => setAttendanceType("OUT")}
            className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${
              attendanceType === "OUT"
                ? "bg-primary text-on-primary shadow-lg"
                : "text-on-surface-variant"
            }`}
          >
            Absen Pulang
          </button>
        </div>
      </div>

      {/* Photo Section */}
      <div className="mb-6 glass rounded-xl p-4">
        <h3 className="mb-4 text-sm font-medium text-on-surface">Dokumentasi Absensi</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Face Photo */}
          <button
            onClick={() => openCamera("face")}
            className={`group relative overflow-hidden rounded-xl transition-all ${
              facePhoto ? "ring-2 ring-green-500/50" : "ring-1 ring-outline"
            }`}
          >
            {facePhoto ? (
              <div className="relative aspect-[3/4]">
                <img src={facePhoto} alt="Identifikasi Wajah" className="h-full w-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); deletePhoto("face"); }}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-transform active:scale-95"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-2 rounded-md bg-green-500/20 backdrop-blur-sm px-2 py-1">
                  <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 bg-surface-container group-active:bg-surface-container-high transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high">
                  <svg className="h-6 w-6 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-on-surface">Identifikasi Wajah</p>
                  <p className="text-xs text-on-surface-variant">Wajib</p>
                </div>
              </div>
            )}
          </button>

          {/* Surrounding Photo */}
          <button
            onClick={() => openCamera("surrounding")}
            className={`group relative overflow-hidden rounded-xl transition-all ${
              surroundingPhoto ? "ring-2 ring-green-500/50" : "ring-1 ring-outline"
            }`}
          >
            {surroundingPhoto ? (
              <div className="relative aspect-[3/4]">
                <img src={surroundingPhoto} alt="Foto Sekitar" className="h-full w-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); deletePhoto("surrounding"); }}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-transform active:scale-95"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-2 rounded-md bg-green-500/20 backdrop-blur-sm px-2 py-1">
                  <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 bg-surface-container group-active:bg-surface-container-high transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-high">
                  <svg className="h-6 w-6 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-on-surface">Foto Sekitar</p>
                  <p className="text-xs text-on-surface-variant">Opsional</p>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6 glass rounded-xl p-4">
        <label className="mb-3 block text-sm font-medium text-on-surface">
          Catatan Absensi
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tambahkan catatan (opsional)"
          rows={3}
          className="w-full rounded-lg border border-outline bg-surface-container px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>

    {/* Fixed Bottom Action */}
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
      <div className="mx-auto max-w-md">
        <button
          onClick={submitAttendance}
          disabled={!facePhoto || !location || isSubmitting}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-40 disabled:active:scale-100 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <div className="loader" style={{ width: '16px', height: '16px', borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.2)' }} />
              Memproses absensi...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Proses Absen {attendanceType === "IN" ? "Masuk" : "Pulang"}
            </div>
          )}
        </button>
      </div>
    </div>
  </div>
);
}
