import { PublicNavbar, PublicFooter } from "@/components/layout";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] overflow-x-hidden">
      <PublicNavbar />
      <main className="flex-grow relative z-10">{children}</main>
      <PublicFooter />
    </div>
  );
}
