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
    topSellingProducts,
    totalSalesAmount,
    monthlySalesAmount,
    salesCount,
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
        wholesaler: { select: { name: true } },
      },
    }),
    // Top selling products
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    // Total sales amount
    prisma.sale.aggregate({
      _sum: { amount: true },
    }),
    // Monthly sales amount
    prisma.sale.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    // Total sales count
    prisma.sale.count(),
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
    sales: {
      amount: {
        total: totalSalesAmount._sum.amount ?? 0,
        monthly: monthlySalesAmount._sum.amount ?? 0,
      },
    },
    salesCount,
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
      wholesaler: o.wholesaler.name,
      createdAt: o.createdAt,
    })),
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
      name: name.toLowerCase(),
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

  // Send WhatsApp notification via agent (non-blocking)
  const agentUrl = process.env.AGENT_URL ?? "http://localhost:3004";
  const role = makeAdmin ? "Administrator" : "Staff Member";
  const whatsappMessage = `🔐 *Your Accessories World Account*\n\n👋 Hello ${name}!\n\nYour ${role} account has been created.\n\n📧 *Email:* ${email}\n🔑 *Password:* ${password}\n\n⚠️ Please change your password after first login.\n\n🚀 Ready to get started!`;
  
  fetch(`${agentUrl}/api/whatsapp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: process.env.BUSINESS_WHATSAPP ?? "+263784923973",
      message: whatsappMessage,
    }),
  }).catch((err) =>
    console.error("Failed to send admin WhatsApp notification:", err)
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
      name: true,
      phone: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return c.json(wholesalers);
});

/** GET /api/admin/wholesalers/:id — single wholesaler with orders */
admin.get("/wholesalers/:id", async (c) => {
  const { id } = c.req.param();
  const wholesaler = await prisma.wholesaler.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      phone: true,
      createdAt: true,
      orders: {
        include: {
          items: {
            include: { product: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!wholesaler) return c.json({ error: "Wholesaler not found" }, 404);
  return c.json(wholesaler);
});

/** POST /api/admin/wholesalers — create a new wholesaler */
admin.post("/wholesalers", async (c) => {
  const { name, phone } = await c.req.json<{
    name: string;
    phone: string;
  }>();

  if (!name || !phone) {
    return c.json({ error: "name and phone are required" }, 400);
  }

  try {
    // Check if phone already exists
    const existing = await prisma.wholesaler.findUnique({
      where: { phone },
    });

    if (existing) {
      return c.json(
        { error: "A wholesaler with this phone number already exists" },
        409
      );
    }

    // Generate password
    const password = generatePassword(8);
    const passwordHash = await Bun.password.hash(password);

    // Create wholesaler
    const wholesaler = await prisma.wholesaler.create({
      data: {
        name,
        phone,
        passwordHash,
      },
    });

    // Send WhatsApp credentials via agent (non-blocking)
    const agentUrl = process.env.AGENT_URL ?? "http://localhost:3004";
    const whatsappMessage = `🎉 *Welcome to Accessories World!*\n\n👋 Hello ${name}!\n\nYour Wholesaler account has been created.\n\n📱 *Phone:* ${phone}\n🔑 *Password:* ${password}\n\n🚀 Use these credentials to log in to the Wholesaler Portal!`;

    fetch(`${agentUrl}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message: whatsappMessage }),
    }).catch((err) =>
      console.error("Failed to send wholesaler WhatsApp notification:", err)
    );

    return c.json(
      {
        id: wholesaler.id,
        name: wholesaler.name,
        phone: wholesaler.phone,
        createdAt: wholesaler.createdAt,
      },
      201
    );
  } catch (error) {
    console.error("Error creating wholesaler:", error);
    return c.json({ error: "Failed to create wholesaler" }, 500);
  }
});

/** PATCH /api/admin/wholesalers/:id */
admin.patch("/wholesalers/:id", async (c) => {
  const { id } = c.req.param();
  const { name, phone } = await c.req.json<{ name?: string; phone?: string }>();
  
  const wholesaler = await prisma.wholesaler.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
    },
    select: { id: true, name: true, phone: true },
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

/** GET /api/admin/products/:id — single product with wholesale order history */
admin.get("/products/:id", async (c) => {
  const { id } = c.req.param();
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { order: "asc" } },
      orderItems: {
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              createdAt: true,
              wholesaler: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });
  if (!product) return c.json({ error: "Product not found" }, 404);
  return c.json(product);
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
    featured?: boolean;
    active?: boolean;
    categoryId?: string;
    imageUrl?: string;
  }>();

  const { imageUrl, ...productData } = body;

  const product = await prisma.product.create({
    data: {
      ...productData,
      retailDiscount: productData.retailDiscount ?? 0,
      wholesaleDiscount: productData.wholesaleDiscount ?? 0,
      ...(imageUrl && {
        images: { create: { url: imageUrl, alt: productData.name, order: 0 } },
      }),
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
  const body = await c.req.json<{ imageUrl?: string; [key: string]: unknown }>();
  const { imageUrl, ...productData } = body;

  if (imageUrl) {
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productImage.create({
      data: { url: imageUrl, alt: String(productData.name ?? "Product image"), productId: id, order: 0 },
    });
  }

  const product = await prisma.product.update({
    where: { id },
    data: productData,
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
        select: { id: true, name: true, email: true },
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

// ─── Sales Management ────────────────────────────────────────────────────────

/** GET /api/admin/sales */
admin.get("/sales", async (c) => {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
  });
  return c.json(sales);
});

/** POST /api/admin/sales */
admin.post("/sales", async (c) => {
  const body = await c.req.json<{
    revenue: number;
    customerName?: string | null;
    customerWhatsapp?: string | null;
  }>();

  // Validate revenue
  if (!body.revenue) {
    return c.json({ error: "revenue is required" }, 400);
  }

  const revenueNumber = Number(body.revenue);
  if (!Number.isFinite(revenueNumber) || revenueNumber <= 0) {
    return c.json({ error: "revenue must be a valid number > 0" }, 400);
  }

  // Generate unique sale number
  const saleCount = await prisma.sale.count();
  const saleNumber = `SAL-${String(saleCount + 1).padStart(6, "0")}`;

  const sale = await prisma.sale.create({
    data: {
      saleNumber,
      amount: parseFloat(revenueNumber.toString()),
      customerName: body.customerName || null,
      customerWhatsapp: body.customerWhatsapp || null,
    },
  });

  // Send WhatsApp receipt if customer number provided
  if (sale.customerWhatsapp) {
    const agentUrl = process.env.AGENT_URL ?? "http://localhost:3004";
    fetch(`${agentUrl}/api/receipt/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: sale.customerName,
        customerWhatsapp: sale.customerWhatsapp,
        revenue: Number(sale.amount),
        quantity: 1,
      }),
    }).catch((err) => console.error("Failed to send receipt:", err));
  }

  return c.json(sale, 201);
});

/** PATCH /api/admin/sales/:id */
admin.patch("/sales/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const sale = await prisma.sale.update({
    where: { id },
    data: {
      amount: body.amount ? parseFloat(body.amount.toString()) : undefined,
      customerName: body.customerName,
      customerWhatsapp: body.customerWhatsapp,
    },
  });
  return c.json(sale);
});

/** DELETE /api/admin/sales/:id */
admin.delete("/sales/:id", async (c) => {
  const { id } = c.req.param();
  await prisma.sale.delete({ where: { id } });
  return c.json({ success: true });
});

export default admin;
