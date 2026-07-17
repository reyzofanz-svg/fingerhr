import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SWRegistration } from "@/components/layout/SWRegistration";
import { MobileProviders } from "@/components/layout/MobileProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FingerHR - Absensi",
  description: "Absensi dari ponsel Anda",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FingerHR",
  },
};

export const viewport: Viewport = {
  themeColor: "#08080c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-[#08080c]">
        <MobileProviders>
          <SWRegistration />
          {children}
        </MobileProviders>
      </body>
    </html>
  );
}
