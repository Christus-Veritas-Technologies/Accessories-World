import type { Context, Next } from "hono";
import { validateSession, extractToken } from "../lib/session.js";

/** Extract token from Authorization header or cookies */
function getToken(c: Context): string | null {
  // Try Authorization header first
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Try adminToken cookie
  const adminToken = c.req.cookie("adminToken");
  if (adminToken) {
    return adminToken;
  }

  return null;
}

/** Attach the validated session to context variables */
export async function requireAuth(c: Context, next: Next) {
  const token = getToken(c);
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = await validateSession(token);
  if (!session) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  c.set("session", session);
  await next();
}

/** Require the session to belong to an Admin */
export async function requireAdmin(c: Context, next: Next) {
  const token = getToken(c);
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = await validateSession(token);
  if (!session || session.userType !== "ADMIN") {
    return c.json({ error: "Admin access required" }, 403);
  }

  c.set("session", session);
  await next();
}

/** Require the session to belong to an approved Wholesaler */
export async function requireWholesaler(c: Context, next: Next) {
  const token = getToken(c);
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = await validateSession(token);
  if (!session || session.userType !== "WHOLESALER") {
    return c.json({ error: "Wholesaler access required" }, 403);
  }

  if (!session.wholesaler?.approved) {
    return c.json({ error: "Your wholesaler account is pending approval" }, 403);
  }

  c.set("session", session);
  await next();
}
