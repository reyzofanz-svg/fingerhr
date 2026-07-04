import { PermissionsClient } from "./PermissionsClient";
import { getPermissionsData } from "@/lib/server/queries";

export const dynamic = "force-dynamic";

export default async function PermissionsPage() {
  const { permissions, employees } = await getPermissionsData();
  return (
    <PermissionsClient
      initialPermissions={permissions}
      initialEmployees={employees}
    />
  );
}
