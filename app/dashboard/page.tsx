import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getDashboardData } from "@/lib/server/queries";

// Data is fetched on the server so the page arrives fully rendered (no spinner).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const initialData = await getDashboardData();
  return <DashboardClient initialData={initialData} />;
}
