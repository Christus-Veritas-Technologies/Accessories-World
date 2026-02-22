import { prisma } from "@repo/db";
import type { UserType } from "@repo/db/types";

const SESSION_TTL_HOURS = 24 * 7; // 7 days

/** Generate a cryptographically secure session token */
export function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Create a new session for an admin or wholesaler */
export async function createSession(
  userType: UserType,
  userId: string
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000
  );

  await prisma.session.create({
    data: {
      token,
      userType,
      expiresAt,
      ...(userType === "ADMIN"
        ? { adminId: userId }
        : { wholesalerId: userId }),
    },
  });

  return token;
}

/** Validate a session token — returns the session or null if invalid/expired */
export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      admin: true,
      wholesaler: true,
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } });
    return null;
  }

  return session;
}

/** Delete a session (logout) */
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

/** Extract bearer token from Authorization header */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
