import { Hono } from "hono";
import { prisma } from "@repo/db";

const products = new Hono();

/**
 * GET /api/products
 * Public — returns active products with retail price and discount.
 * Query params: category (slug), featured, search, page, limit, price (0-50, 50-100, 100-500, 500+), stock (in-stock, out-of-stock)
 */
products.get("/", async (c) => {
  const { category, featured, search, page = "1", limit = "20", price } = c.req.query();

  const skip = (Number(page) - 1) * Number(limit);

  const where: Record<string, any> = { active: true };
  
  if (category) {
    where.category = { slug: category };
  }
  if (featured === "true") {
    where.featured = true;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  // Price range filtering
  if (price) {
    switch (price) {
      case "0-50":
        where.retailPrice = { gte: 0, lte: 50 };
        break;
      case "50-100":
        where.retailPrice = { gte: 50, lte: 100 };
        break;
      case "100-500":
        where.retailPrice = { gte: 100, lte: 500 };
        break;
      case "500+":
        where.retailPrice = { gte: 500 };
        break;
    }
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
        retailPrice: true,
        retailDiscount: true,
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
 * GET /api/products/trending
 * Public — returns most viewed/trending products
 * Query params: limit (default: 8)
 */
products.get("/trending", async (c) => {
  const { limit = "8" } = c.req.query();

  const items = await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sku: true,
      retailPrice: true,
      retailDiscount: true,
      stock: true,
      featured: true,
      category: { select: { id: true, name: true, slug: true } },
      images: {
        orderBy: { order: "asc" },
        take: 1,
        select: { url: true, alt: true },
      },
      _count: {
        select: { views: true },
      },
    },
    orderBy: {
      views: {
        _count: "desc",
      },
    },
    take: Number(limit),
  });

  // Transform to match expected format
  const transformed = items.map((product: any) => ({
    ...product,
    views: product._count.views,
    _count: undefined,
  }));

  return c.json({ items: transformed });
});

/**
 * GET /api/products/:slug
 * Public — returns a single product by slug with retail price + all images
 */
products.get("/:slug", async (c) => {
  const { slug } = c.req.param();

  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sku: true,
      retailPrice: true,
      retailDiscount: true,
      featured: true,
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { order: "asc" }, select: { url: true, alt: true, order: true } },
    },
  });

  if (!product) {
    return c.json({ error: "Product not found" }, 404);
  }

  // Track product view (non-blocking)
  const ip = c.req.header("x-forwarded-for") ?? c.req.header("x-real-ip") ?? "unknown";
  const userAgent = c.req.header("user-agent") ?? "";
  prisma.productView
    .create({ data: { productId: product.id, ip, userAgent } })
    .catch(() => {});

  return c.json(product);
});

/**
 * GET /api/products/trending/popular
 * Public — returns most viewed/popular products
 * Query params: limit
 */
products.get("/trending/popular", async (c) => {
  const { limit = "6" } = c.req.query();

  const items = await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sku: true,
      retailPrice: true,
      retailDiscount: true,
      stock: true,
      featured: true,
      category: { select: { id: true, name: true, slug: true } },
      images: {
        orderBy: { order: "asc" },
        take: 1,
        select: { url: true, alt: true },
      },
      _count: {
        select: { views: true },
      },
    },
    orderBy: {
      views: {
        _count: "desc",
      },
    },
    take: Number(limit),
  });

  // Transform to match expected format
  const transformed = items.map((product: any) => ({
    ...product,
    viewCount: product._count.views,
    _count: undefined,
  }));

  return c.json({ items: transformed });
});

export default products;
