"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08080c] p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.06]">
          <svg
            className="h-10 w-10 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-white">Offline</h1>
        <p className="mb-6 text-sm text-white/40">
          Tidak ada koneksi internet. Silakan periksa koneksi Anda dan coba lagi.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
