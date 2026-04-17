import { getCurrentUser } from "./getCurrentUser";
import { redirect } from "next/navigation";

/**
 * Server-side admin guard. Returns the current user if admin, otherwise redirects to /.
 * Use at the top of admin layout and every admin server action.
 */
export async function requireAdmin(): Promise<{ userId: string; role: string }> {
  const user = await getCurrentUser().catch(() => null);
  if (!user || user.role !== "admin") redirect("/");
  return user;
}

/**
 * Returns true if the current user is an admin. Does not redirect.
 * Useful for conditional rendering.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser().catch(() => null);
  return user?.role === "admin";
}
