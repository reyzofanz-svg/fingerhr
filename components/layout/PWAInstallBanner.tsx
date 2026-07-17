"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  return (
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as any).MSStream
  );
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already installed or dismissed
    if (isStandalone() || sessionStorage.getItem("pwa-install-dismissed")) {
      setIsInstalled(true);
      return;
    }

    // iOS: show manual instructions
    if (isIOS()) {
      setShowBanner(true);
      return;
    }

    // Android/Chrome: listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleShowIOS = () => {
    setShowIOSInstructions(true);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:hidden">
      <div className="rounded-2xl border border-white/[0.08] bg-surface-container-high p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Install FingerHR</p>
            <p className="mt-0.5 text-xs text-white/40">
              {isIOS()
                ? "Tap bagikan lalu 'Add to Home Screen'"
                : "Tambahkan ke layar utama untuk akses cepat"}
            </p>
          </div>
        </div>

        {/* iOS Instructions Overlay */}
        {showIOSInstructions && (
          <div className="mt-3 rounded-xl bg-black/40 p-4">
            <p className="mb-3 text-xs font-medium text-white">Cara Install di iPhone:</p>
            <ol className="space-y-2 text-xs text-white/60">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">1</span>
                <span>Klik tombol <strong className="text-white">Share</strong> (kotak dengan panah) di Safari</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">2</span>
                <span>Gulir ke bawah, pilih <strong className="text-white">Add to Home Screen</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white">3</span>
                <span>Klik <strong className="text-white">Add</strong> di pojok kanan atas</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="mt-3 w-full rounded-lg bg-white/[0.06] px-4 py-2 text-xs text-white/60"
            >
              Tutup
            </button>
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 rounded-xl bg-white/[0.06] px-4 py-2.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.1]"
          >
            Nanti Saja
          </button>
          {isIOS() ? (
            <button
              onClick={handleShowIOS}
              className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-black transition-colors hover:bg-white/90"
            >
              Lihat Cara Install
            </button>
          ) : (
            <button
              onClick={handleInstall}
              className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-black transition-colors hover:bg-white/90"
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
