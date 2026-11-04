
export const instant = false;

import DashboardShell from "@/app/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/get-current-user";

export default async function StaffLayout({ children }) {
  const user = await getCurrentUser("staff");

  return (
    <DashboardShell
      user={user}
      title="Staff Portal"
      subtitle="Library operations and member services."
    >
      {children}
    </DashboardShell>
  );
}
