import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";
import { MyAttendanceClient } from "./MyAttendanceClient";
import { getMyAttendanceData } from "@/lib/server/queries";

const { auth } = NextAuth(authConfig);

export const dynamic = "force-dynamic";

export default async function MyAttendancePage() {
  const session = await auth();

  // Default range matches the client component (last 30 days → today).
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  const initialData = session?.user?.email
    ? await getMyAttendanceData(session.user.email, startDate, endDate)
    : null;

  return <MyAttendanceClient initialData={initialData} />;
}
