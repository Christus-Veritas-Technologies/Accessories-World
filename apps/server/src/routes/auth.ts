import { Hono } from "hono";
import { prisma } from "@repo/db";
import { createSession, deleteSession, extractToken, validateSession } from "../lib/session.js";

const auth = new Hono();

/**
 * POST /api/auth/admin/login
 * Body: { name, password }
 */
auth.post("/admin/login", async (c) => {
  const { name, password } = await c.req.json<{
    name: string;
    password: string;
  }>();

  if (!name || !password) {
    return c.json({ error: "Name and password are required" }, 400);
  }

  const admin = await prisma.admin.findFirst({ where: { name: name.toLowerCase() } });
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
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isAdmin: admin.isAdmin,
      whatsapp: admin.whatsapp,
    },
  });
});

/**
 * POST /api/auth/wholesaler/login
 * Body: { phone, password }
 */
auth.post("/wholesaler/login", async (c) => {
  const { phone, password } = await c.req.json<{
    phone: string;
    password: string;
  }>();

  if (!phone || !password) {
    return c.json({ error: "Phone and password are required" }, 400);
  }

  const wholesaler = await prisma.wholesaler.findUnique({ where: { phone } });
  if (!wholesaler) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await Bun.password.verify(password, wholesaler.passwordHash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await createSession("WHOLESALER", wholesaler.id);

  return c.json({
    token,
    user: {
      id: wholesaler.id,
      name: wholesaler.name,
      phone: wholesaler.phone,
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
 * GET /api/auth/validate
 * Validates the current session (returns 200 if valid, 401 if invalid)
 */
auth.get("/validate", async (c) => {
  const token = extractToken(c.req.header("Authorization"));
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = await validateSession(token);
  if (!session) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  return c.json({ valid: true });
});

/**
 * PATCH /api/auth/admin/change-password
 * Changes the current admin user's password
 * Body: { currentPassword, newPassword }
 */
auth.patch("/admin/change-password", async (c) => {
  const token = extractToken(c.req.header("Authorization"));
  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const session = await validateSession(token);
  if (!session || session.userType !== "ADMIN" || !session.admin) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { currentPassword, newPassword } = await c.req.json<{
    currentPassword: string;
    newPassword: string;
  }>();

  if (!currentPassword || !newPassword) {
    return c.json({ error: "currentPassword and newPassword are required" }, 400);
  }

  if (newPassword.length < 6) {
    return c.json({ error: "New password must be at least 6 characters" }, 400);
  }

  const admin = await prisma.admin.findUnique({ where: { id: session.admin.id } });
  if (!admin) {
    return c.json({ error: "Account not found" }, 404);
  }

  const valid = await Bun.password.verify(currentPassword, admin.passwordHash);
  if (!valid) {
    return c.json({ error: "Current password is incorrect" }, 400);
  }

  const newHash = await Bun.password.hash(newPassword);
  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: newHash },
  });

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
        isAdmin: session.admin.isAdmin,
      },
    });
  }

  if (session.userType === "WHOLESALER" && session.wholesaler) {
    return c.json({
      userType: "WHOLESALER",
      user: {
        id: session.wholesaler.id,
        name: session.wholesaler.name,
        phone: session.wholesaler.phone,
      },
    });
  }

  return c.json({ error: "Session user not found" }, 404);
});

export default auth;
