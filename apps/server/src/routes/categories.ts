import { Hono } from "hono";
import { prisma } from "@repo/db";

const categories = new Hono();

/**
 * GET /api/categories
 * Public — lists all categories with product counts
 */
categories.get("/", async (c) => {
  const cats = await prisma.category.findMany({
    include: {
      _count: { select: { products: { where: { active: true } } } },
    },
    orderBy: { name: "asc" },
  });

  return c.json(
    cats.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      productCount: cat._count.products,
    }))
  );
});

/**
 * GET /api/categories/:slug
 * Public — returns a single category and its products
 */
categories.get("/:slug", async (c) => {
  const { slug } = c.req.param();

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { active: true },
        select: {
          id: true,
          name: true,
          slug: true,
          retailPrice: true,
          stock: true,
          images: {
            take: 1,
            orderBy: { order: "asc" },
            select: { url: true, alt: true },
          },
        },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!category) {
    return c.json({ error: "Category not found" }, 404);
  }

  return c.json(category);
});

export default categories;
