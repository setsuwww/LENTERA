export const instant = false;

import DashboardShell from "@/app/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/get-current-user";

export default async function StudentLayout({ children }) {
  const user = await getCurrentUser("student");

  return (
    <DashboardShell
      user={user}
      title="Student"
      subtitle="Manage your library activity."
    >
      {children}
    </DashboardShell>
  );
}
