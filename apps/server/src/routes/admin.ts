import { Hono } from "hono";
import { prisma } from "@repo/db";
import { requireAdmin } from "../middleware/auth.js";
import { generatePassword } from "../lib/email.js";
import { scheduleFollowUp } from "../lib/scheduler.js";

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

  const { name, isAdmin: makeAdmin } = await c.req.json<{
    name: string;
    isAdmin?: boolean;
  }>();

  if (!name || !name.trim()) {
    return c.json({ error: "Username is required" }, 400);
  }

  const username = name.trim().toLowerCase();

  // Check if username is taken
  const existing = await prisma.admin.findUnique({ where: { name: username } });
  if (existing) {
    return c.json({ error: "An account with this username already exists" }, 409);
  }

  // Generate strong 8-character password
  const password = generatePassword(8);
  const passwordHash = await Bun.password.hash(password);

  const account = await prisma.admin.create({
    data: {
      name: username,
      passwordHash,
      isAdmin: makeAdmin ?? false,
    },
    select: {
      id: true,
      name: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  // Send credentials to AW WhatsApp (non-blocking)
  const agentUrl = process.env.AGENT_URL ?? "http://localhost:3004";
  const role = makeAdmin ? "Administrator" : "Staff Member";
  const whatsappMessage = `New ${role} account created for Accessories World.\n\nUsername: ${username}\nPassword: ${password}\n\nPlease ask the user to change their password after their first login.`;

  fetch(`${agentUrl}/api/whatsapp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: process.env.BUSINESS_WHATSAPP ?? "+263784923973",
      message: whatsappMessage,
    }),
  }).catch((err) =>
    console.error("Failed to send account credentials to WhatsApp:", err)
  );

  return c.json(account, 201);
});

/** PATCH /api/admin/accounts/:id — update an account */
admin.patch("/accounts/:id", async (c) => {
  const session = c.get("session") as any;
  if (!session.admin?.isAdmin) {
    return c.json({ error: "Only administrators can update accounts" }, 403);
  }

  const { id } = c.req.param();
  const { name, isAdmin: makeAdmin, password } = await c.req.json<{
    name?: string;
    isAdmin?: boolean;
    password?: string;
  }>();

  const updateData: any = {};

  if (name !== undefined) {
    const username = name.trim().toLowerCase();
    // Check uniqueness (exclude self)
    const existing = await prisma.admin.findFirst({
      where: { name: username, NOT: { id } },
    });
    if (existing) {
      return c.json({ error: "An account with this username already exists" }, 409);
    }
    updateData.name = username;
  }

  if (makeAdmin !== undefined) {
    updateData.isAdmin = makeAdmin;
  }

  if (password && password.trim().length > 0) {
    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }
    updateData.passwordHash = await Bun.password.hash(password);
  }

  const account = await prisma.admin.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return c.json(account);
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

    // Send WhatsApp credentials to the wholesaler (non-blocking)
    const agentUrl = process.env.AGENT_URL ?? "http://localhost:3004";
    const businessWhatsapp = process.env.BUSINESS_WHATSAPP ?? "+263784923973";
    const whatsappMessage = `🎉 *Welcome to Accessories World!*\n\n👋 Hello ${name}!\n\nYour Wholesaler account has been created.\n\n📱 *Phone:* ${phone}\n🔑 *Password:* ${password}\n\n🚀 Use these credentials to log in to the Wholesaler Portal!`;

    fetch(`${agentUrl}/api/receipt/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "message",
        phone,
        message: whatsappMessage,
      }),
    }).catch((err) =>
      console.error("Failed to send wholesaler WhatsApp notification:", err)
    );

    // Notify Accessories World number about the new wholesaler account
    const awMessage = `🏪 *New Wholesaler Account Created*\n\n👤 Name: ${name}\n📱 Phone: ${phone}\n📅 Created: ${new Date().toLocaleDateString("en-GB")}\n\n✅ Account is ready for use.`;
    fetch(`${agentUrl}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: businessWhatsapp,
        message: awMessage,
      }),
    }).catch((err) =>
      console.error("Failed to send AW wholesaler account notification:", err)
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
    customerPhone?: string | null;    // unified phone/WhatsApp field
    customerWhatsapp?: string | null; // legacy – still accepted
    products?: { name: string; price: string }[]; // MinifiedProduct[]
  }>();

  // Validate revenue
  if (!body.revenue) {
    return c.json({ error: "revenue is required" }, 400);
  }

  const revenueNumber = Number(body.revenue);
  if (!Number.isFinite(revenueNumber) || revenueNumber <= 0) {
    return c.json({ error: "revenue must be a valid number > 0" }, 400);
  }

  // Validate products if provided
  const products = body.products ?? [];
  if (Array.isArray(products) && products.length === 0) {
    return c.json({ error: "products array must contain at least one item" }, 400);
  }

  // Resolve unified phone field (prefer customerPhone, fall back to legacy customerWhatsapp)
  const customerPhone = body.customerPhone || body.customerWhatsapp || null;

  // Generate unique sale number
  const saleCount = await prisma.sale.count();
  const saleNumber = `SAL-${String(saleCount + 1).padStart(6, "0")}`;

  const sale = await prisma.sale.create({
    data: {
      saleNumber,
      amount: parseFloat(revenueNumber.toString()),
      customerName: body.customerName || null,
      customerPhone,                    // unified field
      customerWhatsapp: customerPhone,  // keep in sync for legacy compatibility
      products,
    },
  });

  const agentUrl = process.env.AGENT_URL ?? "http://localhost:3004";
  const businessWhatsapp = process.env.BUSINESS_WHATSAPP ?? "+263784923973";

  if (customerPhone) {
    // Try to send WhatsApp receipt — await so we can detect failure
    const agentRes = await fetch(`${agentUrl}/api/receipt/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "receipt",
        phone: customerPhone,
        receipt: {
          customerName: sale.customerName,
          customerPhone,
          products,
          revenue: Number(sale.amount),
        },
      }),
    }).catch(() => null);

    const receiptSent = agentRes?.ok === true;

    if (receiptSent && body.customerName && products.length > 0) {
      // Receipt sent successfully — schedule personalized follow-up message
      const productNames = products.map((p) => p.name);
      scheduleFollowUp({
        customerName: body.customerName,
        customerPhone,
        productNames,
        agentUrl,
        businessWhatsapp,
      });
    } else if (!receiptSent) {
      // WhatsApp delivery failed — notify the business to follow up manually
      const productList = products
        .map((p) => `  - ${p.name}: $${Number(p.price).toFixed(2)}`)
        .join("\n");

      const followUpMessage = [
        `Follow-up needed for sale ${saleNumber}.`,
        ``,
        `${body.customerName || "A customer"} bought the following:`,
        productList,
        `Total: $${revenueNumber.toFixed(2)}`,
        ``,
        `Their number is ${customerPhone} but the WhatsApp receipt could not be delivered.`,
        `Please reach out to them directly at ${customerPhone}.`,
      ].join("\n");

      fetch(`${agentUrl}/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: businessWhatsapp, message: followUpMessage }),
      }).catch((err) => console.error("Failed to send follow-up:", err));
    }
  }

  return c.json(sale, 201);
});

/** PATCH /api/admin/sales/:id */
admin.patch("/sales/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const phone = body.customerPhone ?? body.customerWhatsapp ?? undefined;
  const sale = await prisma.sale.update({
    where: { id },
    data: {
      amount: body.amount ? parseFloat(body.amount.toString()) : undefined,
      customerName: body.customerName,
      customerPhone: phone,
      customerWhatsapp: phone, // keep in sync with legacy field
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
