import { Hono } from "hono";
import { prisma } from "@repo/db";
import { createSession, deleteSession, extractToken, validateSession } from "../lib/session.js";

const auth = new Hono();

/**
 * POST /api/auth/admin/login
 * Body: { email, password }
 */
auth.post("/admin/login", async (c) => {
  const { email, password } = await c.req.json<{
    email: string;
    password: string;
  }>();

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await Bun.password.verify(password, admin.passwordHash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await createSession("ADMIN", admin.id);

  return c.json({
    token,
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
});

/**
 * POST /api/auth/wholesaler/login
 * Body: { email, password }
 */
auth.post("/wholesaler/login", async (c) => {
  const { email, password } = await c.req.json<{
    email: string;
    password: string;
  }>();

  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const wholesaler = await prisma.wholesaler.findUnique({ where: { email } });
  if (!wholesaler) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await Bun.password.verify(password, wholesaler.passwordHash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  if (!wholesaler.approved) {
    return c.json(
      { error: "Your account is pending approval. Please contact us." },
      403
    );
  }

  const token = await createSession("WHOLESALER", wholesaler.id);

  return c.json({
    token,
    user: {
      id: wholesaler.id,
      email: wholesaler.email,
      businessName: wholesaler.businessName,
      contactPerson: wholesaler.contactPerson,
    },
  });
});

/**
 * POST /api/auth/logout
 * Deletes the current session
 */
auth.post("/logout", async (c) => {
  const token = extractToken(c.req.header("Authorization"));
  if (token) {
    await deleteSession(token);
  }
  return c.json({ success: true });
});

/**
 * GET /api/auth/me
 * Returns the current session user
 */
auth.get("/me", async (c) => {
  const token = extractToken(c.req.header("Authorization"));
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = await validateSession(token);
  if (!session) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  if (session.userType === "ADMIN" && session.admin) {
    return c.json({
      userType: "ADMIN",
      user: {
        id: session.admin.id,
        email: session.admin.email,
        name: session.admin.name,
        role: session.admin.role,
      },
    });
  }

  if (session.userType === "WHOLESALER" && session.wholesaler) {
    return c.json({
      userType: "WHOLESALER",
      user: {
        id: session.wholesaler.id,
        email: session.wholesaler.email,
        businessName: session.wholesaler.businessName,
        contactPerson: session.wholesaler.contactPerson,
        approved: session.wholesaler.approved,
      },
    });
  }

  return c.json({ error: "Session user not found" }, 404);
});

export default auth;
