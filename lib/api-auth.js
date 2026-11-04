
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function getApiUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("lentera_session")?.value;

  if (!token) return null;

  return await verifySession(token);
}

export async function authorizeLibraryStaff() {
  const user = await getApiUser();

  if (!user) {
    return {
      user: null,
      response: Response.json(
        { message: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  if (!["admin", "staff"].includes(user.role)) {
    return {
      user: null,
      response: Response.json(
        { message: "Forbidden. Access denied." },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}
