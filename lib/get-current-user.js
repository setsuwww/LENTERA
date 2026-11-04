
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth";

export async function getCurrentUser(requiredRole) {
  const cookieStore = await cookies();
  const token = cookieStore.get("lentera_session")?.value;

  const user = token ? await verifySession(token) : null;

  if (!user) {
    redirect("/login");
  }

  if (requiredRole && user.role !== requiredRole) {
    redirect(`/dashboard/${user.role}`);
  }

  return user;
}
