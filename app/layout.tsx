import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SWRegistration } from "@/components/layout/SWRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FingerHR — Cloud Attendance Management",
  description: "Connect Fingerspot biometric devices with modern cloud infrastructure. Real-time attendance sync, monitor employee metrics, and manage access with enterprise-level security.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FingerHR",
  },
  formatDetection: {
    telephone: false,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <SWRegistration />
        {children}
      </body>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var theme = localStorage.getItem('theme');
              if (theme === 'light') {
                document.documentElement.classList.add('light');
              }
            })();
          `,
        }}
      />
    </html>
  );
}
