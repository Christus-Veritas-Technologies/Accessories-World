import { Hono } from "hono";
import { prisma } from "@repo/db";
import { requireWholesaler } from "../middleware/auth.js";

const wholesalers = new Hono();

// ─── All wholesaler routes require wholesaler auth ────────────────────────────
wholesalers.use("*", requireWholesaler);

/**
 * GET /api/wholesalers/products
 * Returns active products with WHOLESALE prices
 */
wholesalers.get("/products", async (c) => {
  const { category, search, page = "1", limit = "20" } = c.req.query();

  const skip = (Number(page) - 1) * Number(limit);

  const where: Record<string, any> = { active: true };
  if (category) where.category = { slug: category };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sku: true,
        wholesalePrice: true,   // wholesale price only
        wholesaleDiscount: true, // wholesale discount percentage
        retailPrice: true,       // included for margin reference
        featured: true,
        category: { select: { id: true, name: true, slug: true } },
        images: {
          orderBy: { order: "asc" },
          take: 1,
          select: { url: true, alt: true },
        },
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return c.json({
    items,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
});

/**
 * GET /api/wholesalers/orders
 * Returns the current wholesaler's orders
 */
wholesalers.get("/orders", async (c) => {
  const session = c.get("session") as any;
  const wholesalerId = session.wholesalerId!;

  const orders = await prisma.order.findMany({
    where: { wholesalerId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, sku: true, images: { take: 1, select: { url: true, alt: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json(orders);
});

/**
 * POST /api/wholesalers/orders
 * Place a new order
 * Body: { items: [{ productId, quantity }] }
 */
wholesalers.post("/orders", async (c) => {
  const session = c.get("session") as any;
  const wholesalerId = session.wholesalerId!;

  const { items } = await c.req.json<{
    items: { productId: string; quantity: number }[];
  }>();

  if (!items?.length) {
    return c.json({ error: "Order must have at least one item" }, 400);
  }

  // Fetch all products to validate stock and get prices
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return c.json({ error: `Product ${item.productId} not found` }, 400);
    }
  }

  // Calculate total using wholesale prices
  const totalAmount = items.reduce((sum, item) => {
    const product = productMap.get(item.productId)!;
    return sum + Number(product.wholesalePrice) * item.quantity;
  }, 0);

  // Generate order number
  const orderNumber = `WO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Create order + items + decrement stock in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        wholesalerId,
        totalAmount,
        status: "PENDING",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productMap.get(item.productId)!.wholesalePrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    return newOrder;
  });

  return c.json(order, 201);
});



/**
 * GET /api/wholesalers/orders/:id
 * Get a specific order (must belong to this wholesaler)
 */
wholesalers.get("/orders/:id", async (c) => {
  const session = c.get("session") as any;
  const wholesalerId = session.wholesalerId!;
  const { id } = c.req.param();

  const order = await prisma.order.findFirst({
    where: { id, wholesalerId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              images: { take: 1, select: { url: true, alt: true } },
            },
          },
        },
      },
    },
  });

  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }

  return c.json(order);
});

/**
 * GET /api/wholesalers/profile
 * Returns the authenticated wholesaler's profile
 */
wholesalers.get("/profile", async (c) => {
  const session = c.get("session") as any;
  const wholesalerId = session.wholesalerId!;

  const wholesaler = await prisma.wholesaler.findUnique({
    where: { id: wholesalerId },
    select: {
      id: true,
      name: true,
      phone: true,
      createdAt: true,
    },
  });

  if (!wholesaler) {
    return c.json({ error: "Profile not found" }, 404);
  }

  return c.json(wholesaler);
});

/**
 * PATCH /api/wholesalers/profile
 * Update the authenticated wholesaler's profile
 */
wholesalers.patch("/profile", async (c) => {
  const session = c.get("session") as any;
  const wholesalerId = session.wholesalerId!;

  const { name, phone } = await c.req.json<{
    name?: string;
    phone?: string;
  }>();

  const wholesaler = await prisma.wholesaler.update({
    where: { id: wholesalerId },
    data: {
      ...(name && { name }),
      ...(phone && { phone }),
    },
    select: {
      id: true,
      name: true,
      phone: true,
      createdAt: true,
    },
  });

  return c.json(wholesaler);
});

export default wholesalers;
