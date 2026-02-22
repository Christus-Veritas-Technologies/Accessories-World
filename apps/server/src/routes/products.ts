import { Hono } from "hono";
import { prisma } from "@repo/db";

const products = new Hono();

/**
 * GET /api/products
 * Public — returns active products with retail price and discount.
 * Query params: category (slug), featured, search, page, limit
 */
products.get("/", async (c) => {
  const { category, featured, search, page = "1", limit = "20" } = c.req.query();

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
        stock: true,
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
      stock: true,
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

export default products;
