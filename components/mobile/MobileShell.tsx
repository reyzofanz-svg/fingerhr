"use client";

import { usePathname } from "next/navigation";
import { BottomNavBar } from "./BottomNavBar";

const hideNavPages = ["/mobile/login"];

export function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldHideNav = hideNavPages.includes(pathname);

  return (
    <div className="min-h-dvh flex flex-col">
      <main className={`flex-1 ${shouldHideNav ? "" : "pb-20"}`}>
        {children}
      </main>
      {!shouldHideNav && <BottomNavBar />}
    </div>
  );
}
