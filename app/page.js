
import { getCurrentUser } from "@/lib/get-current-user";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getCurrentUser();

  redirect(`/dashboard/${user.role}`);
}
