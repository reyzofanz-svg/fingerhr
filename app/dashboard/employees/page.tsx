import { EmployeesClient } from "./EmployeesClient";
import { getEmployeesData } from "@/lib/server/queries";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const initialEmployees = await getEmployeesData();
  return <EmployeesClient initialEmployees={initialEmployees} />;
}
