import { Hono } from "hono";
import { prisma } from "@repo/db";
import { requireAdmin } from "../middleware/auth.js";
import { generatePassword, sendNewAccountEmail } from "../lib/email.js";

const admin = new Hono();

// ─── All routes require admin auth ───────────────────────────────────────────
admin.use("*", requireAdmin);

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Returns counts of products, orders, wholesalers
 */
admin.get("/stats", async (c) => {
  const [productCount, orderCount, wholesalerCount, pendingWholesalers, accountCount] =
    await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.order.count(),
      prisma.wholesaler.count({ where: { approved: true } }),
      prisma.wholesaler.count({ where: { approved: false } }),
      prisma.admin.count(),
    ]);

  return c.json({
    products: productCount,
    orders: orderCount,
    approvedWholesalers: wholesalerCount,
    pendingWholesalers,
    accounts: accountCount,
  });
});

// ─── KPI Endpoints ────────────────────────────────────────────────────────────

/** GET /api/admin/kpis — Key Performance Indicators */
admin.get("/kpis", async (c) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalRevenue,
    monthlyRevenue,
    weeklyViews,
    monthlyViews,
    mostViewedProducts,
    recentOrders,
    lowStockProducts,
    topSellingProducts,
  ] = await Promise.all([
    // Total revenue
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: "CANCELLED" } },
    }),
    // Monthly revenue
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: thirtyDaysAgo },
      },
    }),
    // Weekly views
    prisma.productView.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    // Monthly views
    prisma.productView.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    // Most viewed products (top 10)
    prisma.productView.groupBy({
      by: ["productId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    // Recent orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        wholesaler: { select: { businessName: true } },
      },
    }),
    // Low stock products (< 10)
    prisma.product.findMany({
      where: { active: true, stock: { lt: 10 } },
      select: { id: true, name: true, stock: true, sku: true },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    // Top selling products
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
  ]);

  // Resolve product names for most viewed
  const viewedProductIds = mostViewedProducts.map((v) => v.productId);
  const viewedProducts = await prisma.product.findMany({
    where: { id: { in: viewedProductIds } },
    select: { id: true, name: true, slug: true },
  });
  const viewedProductMap = new Map(viewedProducts.map((p) => [p.id, p]));

  // Resolve product names for top selling
  const sellingProductIds = topSellingProducts.map((s) => s.productId);
  const sellingProducts = await prisma.product.findMany({
    where: { id: { in: sellingProductIds } },
    select: { id: true, name: true, slug: true },
  });
  const sellingProductMap = new Map(sellingProducts.map((p) => [p.id, p]));

  return c.json({
    revenue: {
      total: totalRevenue._sum.totalAmount ?? 0,
      monthly: monthlyRevenue._sum.totalAmount ?? 0,
    },
    views: {
      weekly: weeklyViews,
      monthly: monthlyViews,
    },
    mostViewedProducts: mostViewedProducts.map((v) => ({
      product: viewedProductMap.get(v.productId),
      views: v._count.id,
    })),
    topSellingProducts: topSellingProducts.map((s) => ({
      product: sellingProductMap.get(s.productId),
      totalSold: s._sum.quantity,
    })),
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount,
      status: o.status,
      wholesaler: o.wholesaler.businessName,
      createdAt: o.createdAt,
    })),
    lowStockProducts,
  });
});

// ─── Account Management ──────────────────────────────────────────────────────

/** GET /api/admin/accounts — list all admin/staff accounts */
admin.get("/accounts", async (c) => {
  // Only allow actual admins (isAdmin=true) to manage accounts
  const session = c.get("session") as any;
  if (!session.admin?.isAdmin) {
    return c.json({ error: "Only administrators can manage accounts" }, 403);
  }

  const accounts = await prisma.admin.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return c.json(accounts);
});

/** POST /api/admin/accounts — create a new admin/staff account */
admin.post("/accounts", async (c) => {
  const session = c.get("session") as any;
  if (!session.admin?.isAdmin) {
    return c.json({ error: "Only administrators can create accounts" }, 403);
  }

  const { name, email, isAdmin: makeAdmin } = await c.req.json<{
    name: string;
    email: string;
    isAdmin?: boolean;
  }>();

  if (!name || !email) {
    return c.json({ error: "Name and email are required" }, 400);
  }

  // Check if email is taken
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    return c.json({ error: "An account with this email already exists" }, 409);
  }

  // Generate strong 8-character password
  const password = generatePassword(8);
  const passwordHash = await Bun.password.hash(password);

  const account = await prisma.admin.create({
    data: {
      name,
      email,
      passwordHash,
      isAdmin: makeAdmin ?? false,
    },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  // Send credentials email (non-blocking)
  sendNewAccountEmail(email, name, password, makeAdmin ?? false).catch(
    (err) => console.error("Failed to send new account email:", err)
  );

  return c.json(account, 201);
});

/** DELETE /api/admin/accounts/:id */
admin.delete("/accounts/:id", async (c) => {
  const session = c.get("session") as any;
  if (!session.admin?.isAdmin) {
    return c.json({ error: "Only administrators can delete accounts" }, 403);
  }

  const { id } = c.req.param();

  // Prevent self-deletion
  if (id === session.admin.id) {
    return c.json({ error: "You cannot delete your own account" }, 400);
  }

  await prisma.session.deleteMany({ where: { adminId: id } });
  await prisma.admin.delete({ where: { id } });
  return c.json({ success: true });
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

/** PATCH /api/admin/wholesalers/:id */
admin.patch("/wholesalers/:id", async (c) => {
  const { id } = c.req.param();
  const { approved } = await c.req.json<{ approved: boolean }>();
  
  // If revoking, kill any active sessions
  if (approved === false) {
    await prisma.session.deleteMany({ where: { wholesalerId: id } });
  }
  
  const wholesaler = await prisma.wholesaler.update({
    where: { id },
    data: { approved },
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
    retailDiscount?: number;
    wholesaleDiscount?: number;
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
      retailDiscount: body.retailDiscount ?? 0,
      wholesaleDiscount: body.wholesaleDiscount ?? 0,
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
