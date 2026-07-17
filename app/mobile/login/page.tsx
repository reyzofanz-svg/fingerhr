"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function MobileLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deviceInfo, setDeviceInfo] = useState<string>("");

  // Generate device fingerprint
  const getDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx?.fillText("fingerhr", 2, 2);
    const canvasData = canvas.toDataURL();

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvasData.slice(-50),
    ].join("|");

    // Simple hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return "fh_" + Math.abs(hash).toString(36);
  }, []);

  const handleLogin = useCallback(async () => {
    if (pin.length < 4) {
      setError("PIN minimal 4 digit");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const fingerprint = getDeviceFingerprint();
      const deviceName = `${navigator.userAgent.split(" ").slice(-1)[0] || "Unknown"}`;

      const res = await fetch("/api/mobile/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin,
          deviceFingerprint: fingerprint,
          deviceName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        return;
      }

      // Save token and employee data
      localStorage.setItem("fingerhr_token", data.token);
      localStorage.setItem("fingerhr_employee", JSON.stringify(data.employee));

      // Redirect to attendance page
      router.push("/mobile");
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [pin, getDeviceFingerprint, router]);

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError("");

      // Auto submit when 6 digits entered
      if (newPin.length === 6) {
        setTimeout(() => {
          setPin(newPin);
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#08080c] p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06]">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.418 8.773 7.46 7.46 0 01-1.142-3.163M14.634 10.5a49.148 49.148 0 00-1.418-8.773 7.5 7.5 0 00-8.366 3.656A7.497 7.497 0 0114.634 10.5zM12 10.5a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">FingerHR</h1>
        <p className="mt-1 text-sm text-white/40">Masukkan PIN untuk absensi</p>
      </div>

      {/* PIN Display */}
      <div className="mb-8 flex gap-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full transition-all ${
              i < pin.length
                ? "bg-white scale-110"
                : "bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <button
            key={digit}
            onClick={() => handleKeyPress(digit)}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06] text-xl font-semibold text-white transition-all active:scale-95 active:bg-white/[0.1]"
          >
            {digit}
          </button>
        ))}
        <button
          onClick={handleDelete}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06] text-white/60 transition-all active:scale-95"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </button>
        <button
          onClick={() => handleKeyPress("0")}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06] text-xl font-semibold text-white transition-all active:scale-95 active:bg-white/[0.1]"
        >
          0
        </button>
      </div>

      {/* Login Button */}
      <button
        onClick={handleLogin}
        disabled={pin.length < 4 || loading}
        className="mt-8 w-full max-w-xs rounded-xl bg-white py-3 text-sm font-bold text-black transition-all disabled:opacity-40"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            Memproses...
          </div>
        ) : (
          "Masuk"
        )}
      </button>

      {/* Help Text */}
      <p className="mt-6 text-xs text-white/30">
        PIN sama dengan yang di mesin absensi
      </p>
    </div>
  );
}
