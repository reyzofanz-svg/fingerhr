import { ScheduleClient } from "./ScheduleClient";
import { getScheduleData } from "@/lib/server/queries";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const { shifts, workSchedules, employees, assignments } =
    await getScheduleData();
  return (
    <ScheduleClient
      initialShifts={shifts}
      initialWorkSchedules={workSchedules}
      initialEmployees={employees}
      initialAssignments={assignments}
    />
  );
}
