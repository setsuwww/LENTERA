export const instant = false;

import DashboardShell from "@/app/components/dashboard/DashboardShell";
import { getCurrentUser } from "@/lib/get-current-user";

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser("admin");

  return (
    <DashboardShell
      user={user}
      title="Administration"
      subtitle="Manage your entire library system."
    >
      {children}
    </DashboardShell>
  );
}
