"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

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

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember dismissal for this session
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showBanner || sessionStorage.getItem("pwa-install-dismissed")) {
    return null;
  }

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
              Tambahkan ke layar utama untuk akses cepat
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 rounded-xl bg-white/[0.06] px-4 py-2.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/[0.1]"
          >
            Nanti Saja
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-black transition-colors hover:bg-white/90"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
