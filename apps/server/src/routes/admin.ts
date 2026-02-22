import { Hono } from "hono";
import { prisma } from "@repo/db";
import { requireAdmin } from "../middleware/auth.js";

const admin = new Hono();

// ─── All routes require admin auth ───────────────────────────────────────────
admin.use("*", requireAdmin);

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Returns counts of products, orders, wholesalers
 */
admin.get("/stats", async (c) => {
  const [productCount, orderCount, wholesalerCount, pendingWholesalers] =
    await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.wholesaler.count({ where: { approved: true } }),
      prisma.wholesaler.count({ where: { approved: false } }),
    ]);

  return c.json({
    products: productCount,
    orders: orderCount,
    approvedWholesalers: wholesalerCount,
    pendingWholesalers,
  });
});

// ─── Wholesaler Management ────────────────────────────────────────────────────

/** GET /api/admin/wholesalers — list all wholesalers */
admin.get("/wholesalers", async (c) => {
  const wholesalers = await prisma.wholesaler.findMany({
    select: {
      id: true,
      email: true,
      businessName: true,
      contactPerson: true,
      phone: true,
      address: true,
      approved: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return c.json(wholesalers);
});

/** PATCH /api/admin/wholesalers/:id/approve */
admin.patch("/wholesalers/:id/approve", async (c) => {
  const { id } = c.req.param();
  const wholesaler = await prisma.wholesaler.update({
    where: { id },
    data: { approved: true },
    select: { id: true, email: true, businessName: true, approved: true },
  });
  return c.json(wholesaler);
});

/** PATCH /api/admin/wholesalers/:id/revoke */
admin.patch("/wholesalers/:id/revoke", async (c) => {
  const { id } = c.req.param();
  // Also kill any active sessions
  await prisma.session.deleteMany({ where: { wholesalerId: id } });
  const wholesaler = await prisma.wholesaler.update({
    where: { id },
    data: { approved: false },
    select: { id: true, email: true, businessName: true, approved: true },
  });
  return c.json(wholesaler);
});

/** DELETE /api/admin/wholesalers/:id */
admin.delete("/wholesalers/:id", async (c) => {
  const { id } = c.req.param();
  await prisma.session.deleteMany({ where: { wholesalerId: id } });
  await prisma.wholesaler.delete({ where: { id } });
  return c.json({ success: true });
});

// ─── Product Management ───────────────────────────────────────────────────────

/** GET /api/admin/products — all products including inactive */
admin.get("/products", async (c) => {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return c.json(products);
});

/** POST /api/admin/products — create product */
admin.post("/products", async (c) => {
  const body = await c.req.json<{
    name: string;
    slug: string;
    description?: string;
    sku: string;
    retailPrice: number;
    wholesalePrice: number;
    stock: number;
    featured?: boolean;
    active?: boolean;
    categoryId?: string;
  }>();

  const product = await prisma.product.create({
    data: {
      ...body,
      retailPrice: body.retailPrice,
      wholesalePrice: body.wholesalePrice,
    },
    include: {
      category: true,
      images: true,
    },
  });

  return c.json(product, 201);
});

/** PATCH /api/admin/products/:id — update product */
admin.patch("/products/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const product = await prisma.product.update({
    where: { id },
    data: body,
    include: {
      category: true,
      images: true,
    },
  });

  return c.json(product);
});

/** DELETE /api/admin/products/:id */
admin.delete("/products/:id", async (c) => {
  const { id } = c.req.param();
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.orderItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  return c.json({ success: true });
});

// ─── Order Management ─────────────────────────────────────────────────────────

/** GET /api/admin/orders — all orders */
admin.get("/orders", async (c) => {
  const orders = await prisma.order.findMany({
    include: {
      wholesaler: {
        select: { id: true, businessName: true, email: true },
      },
      items: {
        include: { product: { select: { id: true, name: true, sku: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return c.json(orders);
});

/** PATCH /api/admin/orders/:id/status */
admin.patch("/orders/:id/status", async (c) => {
  const { id } = c.req.param();
  const { status } = await c.req.json<{ status: string }>();
  const order = await prisma.order.update({
    where: { id },
    data: { status: status as any },
  });
  return c.json(order);
});

// ─── Category Management ──────────────────────────────────────────────────────

/** POST /api/admin/categories */
admin.post("/categories", async (c) => {
  const body = await c.req.json<{ name: string; slug: string }>();
  const category = await prisma.category.create({ data: body });
  return c.json(category, 201);
});

/** PATCH /api/admin/categories/:id */
admin.patch("/categories/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const category = await prisma.category.update({ where: { id }, data: body });
  return c.json(category);
});

/** DELETE /api/admin/categories/:id */
admin.delete("/categories/:id", async (c) => {
  const { id } = c.req.param();
  await prisma.category.delete({ where: { id } });
  return c.json({ success: true });
});

export default admin;
