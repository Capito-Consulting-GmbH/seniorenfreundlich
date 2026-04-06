import { auth } from "@clerk/nextjs/server";

export async function getCurrentUser(): Promise<{ userId: string }> {
  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated) {
    throw new Error("Unauthorized");
  }

  if (!userId) {
    throw new Error("User ID not found");
  }

  return { userId };
}
