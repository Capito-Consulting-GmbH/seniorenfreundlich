import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";

export async function getCurrentUser(): Promise<{ userId: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return { userId: session.user.id };
}
