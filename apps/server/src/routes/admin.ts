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
    totalSalesRevenue,
    monthlySalesRevenue,
    totalSalesProfit,
    monthlySalesProfit,
    recentSales,
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
    // Total sales revenue
    prisma.sale.aggregate({
      _sum: { revenue: true },
    }),
    // Monthly sales revenue
    prisma.sale.aggregate({
      _sum: { revenue: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    // Total sales profit
    prisma.sale.aggregate({
      _sum: { profit: true },
    }),
    // Monthly sales profit
    prisma.sale.aggregate({
      _sum: { profit: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    // Recent sales
    prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
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
    sales: {
      revenue: {
        total: totalSalesRevenue._sum.revenue ?? 0,
        monthly: monthlySalesRevenue._sum.revenue ?? 0,
      },
      profit: {
        total: totalSalesProfit._sum.profit ?? 0,
        monthly: monthlySalesProfit._sum.profit ?? 0,
      },
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
      wholesaler: o.wholesaler.name,
      createdAt: o.createdAt,
    })),
    recentSales: recentSales.map((s) => ({
      id: s.id,
      saleNumber: s.saleNumber,
      revenue: s.revenue,
      profit: s.profit,
      quantity: s.quantity,
      createdAt: s.createdAt,
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
    stock: number;
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
    include: {
      customer: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return c.json(sales);
});

/** POST /api/admin/sales */
admin.post("/sales", async (c) => {
  const body = await c.req.json<{
    revenue: number;
    profit: number;
    quantity: number;
    productName?: string;
    customerId?: string;
    notes?: string;
  }>();

  // Generate unique sale number
  const saleCount = await prisma.sale.count();
  const saleNumber = `SAL-${String(saleCount + 1).padStart(6, "0")}`;

  const sale = await prisma.sale.create({
    data: {
      saleNumber,
      customerId: body.customerId || null,
      productName: body.productName || null,
      revenue: parseFloat(body.revenue.toString()),
      profit: parseFloat(body.profit.toString()),
      quantity: body.quantity,
      notes: body.notes || null,
    },
    include: {
      customer: true,
    },
  });

  // Send WhatsApp invoice if customer exists
  if (sale.customer) {
    const agentUrl = process.env.AGENT_URL ?? "http://localhost:3004";
    const productLine = sale.productName ? `\nProduct: ${sale.productName}` : "";

    // Invoice message — starts with "Hope you enjoyed"
    const invoiceMessage = `Hope you enjoyed your purchase! 🎉${productLine}

Sale #: ${sale.saleNumber}
Total: $${Number(sale.revenue).toFixed(2)}
Qty: ${sale.quantity}

Thank you for supporting Accessories World — it means the world to us! 💜`.trim();

    fetch(`${agentUrl}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: sale.customer.whatsapp,
        message: invoiceMessage,
      }),
    })
      .then(() =>
        prisma.sale.update({ where: { id: sale.id }, data: { invoiceSent: true } })
      )
      .catch((err) => console.error("Failed to send invoice message:", err));

    // Schedule follow-up message (15 seconds later)
    const firstName = sale.customer.fullName.split(" ")[0];
    const productRef = sale.productName
      ? sale.quantity > 1
        ? "a few products"
        : sale.productName
      : "your recent purchase";

    setTimeout(() => {
      const followUpMessage = `Hi ${firstName},

We hope you're doing well. We wanted to follow up on your recent purchase of ${productRef} from Accessories World to check that everything is meeting your expectations.

If you have any questions or need assistance, please don't hesitate to reach out — we're happy to help.

Thank you for your support. 🙏`.trim();

      fetch(`${agentUrl}/api/whatsapp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: sale.customer!.whatsapp,
          message: followUpMessage,
        }),
      }).catch((err) => console.error("Failed to send follow-up message:", err));
    }, 15000); // 15 seconds
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
      revenue: body.revenue ? parseFloat(body.revenue.toString()) : undefined,
      profit: body.profit ? parseFloat(body.profit.toString()) : undefined,
      quantity: body.quantity,
      notes: body.notes,
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

// ─── Customer Management ─────────────────────────────────────────────────────

/** GET /api/admin/customers — all customers with sales stats */
admin.get("/customers", async (c) => {
  const customers = await prisma.customer.findMany({
    include: {
      sales: {
        select: { revenue: true, productName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const customersWithStats = customers.map((customer) => ({
    id: customer.id,
    fullName: customer.fullName,
    whatsapp: customer.whatsapp,
    email: customer.email,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
    totalSpent: customer.sales.reduce((sum, sale) => sum + Number(sale.revenue), 0),
    salesCount: customer.sales.length,
    productNames: [...new Set(customer.sales.map((s) => s.productName).filter(Boolean))] as string[],
  }));

  return c.json(customersWithStats);
});

/** GET /api/admin/customers/top-buyers — top customers by total spent */
admin.get("/customers/top-buyers", async (c) => {
  const limit = parseInt(c.req.query("limit") ?? "10");
  
  const topCustomers = await prisma.customer.findMany({
    include: {
      sales: {
        select: { revenue: true },
      },
    },
  });

  const sorted = topCustomers
    .map((customer) => ({
      ...customer,
      totalSpent: customer.sales.reduce((sum, sale) => sum + Number(sale.revenue), 0),
      salesCount: customer.sales.length,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);

  return c.json(sorted);
});

/** GET /api/admin/customers/:id — single customer with full sales history */
admin.get("/customers/:id", async (c) => {
  const { id } = c.req.param();
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!customer) return c.json({ error: "Customer not found" }, 404);
  return c.json(customer);
});

/** POST /api/admin/customers — create new customer */
admin.post("/customers", async (c) => {
  const body = await c.req.json<{
    fullName: string;
    whatsapp: string;
    email?: string;
  }>();

  if (!body.fullName || !body.whatsapp) {
    return c.json(
      { error: "fullName and whatsapp are required" },
      400
    );
  }

  const customer = await prisma.customer.create({
    data: {
      fullName: body.fullName,
      whatsapp: body.whatsapp,
      email: body.email || null,
    },
  });

  return c.json(customer, 201);
});

/** PATCH /api/admin/customers/:id — update customer */
admin.patch("/customers/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      fullName: body.fullName,
      whatsapp: body.whatsapp,
      email: body.email,
    },
  });

  return c.json(customer);
});

/** DELETE /api/admin/customers/:id */
admin.delete("/customers/:id", async (c) => {
  const { id } = c.req.param();
  await prisma.sale.updateMany({
    where: { customerId: id },
    data: { customerId: null },
  });
  await prisma.customer.delete({ where: { id } });
  return c.json({ success: true });
});

export default admin;
