import type { Context, Next } from "hono";
import { validateSession, extractToken } from "../lib/session.js";

/** Attach the validated session to context variables */
export async function requireAuth(c: Context, next: Next) {
  const token = extractToken(c.req.header("Authorization"));
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
  const token = extractToken(c.req.header("Authorization"));
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
  const token = extractToken(c.req.header("Authorization"));
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
