import { Hono } from "hono";
import { prisma } from "@repo/db";

const testimonials = new Hono();

/**
 * GET /api/testimonials
 * Public — returns published testimonials
 * Query params: limit, featured
 */
testimonials.get("/", async (c) => {
  const { limit = "10", featured } = c.req.query();

  const where: Record<string, any> = { published: true };
  if (featured === "true") {
    where.featured = true;
  }

  const items = await prisma.testimonial.findMany({
    where,
    take: Number(limit),
    orderBy: { createdAt: "desc" },
  });

  return c.json({ items });
});

/**
 * POST /api/testimonials
 * Admin only — create a new testimonial
 */
testimonials.post("/", async (c) => {
  const body = await c.req.json();
  const { name, location, message, rating = 5, featured = false } = body;

  if (!name || !message) {
    return c.json({ error: "Name and message are required" }, 400);
  }

  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        location: location || null,
        message,
        rating: Math.max(1, Math.min(5, Number(rating))),
        featured,
        published: true,
      },
    });

    return c.json(testimonial, 201);
  } catch (error) {
    return c.json({ error: "Failed to create testimonial" }, 500);
  }
});

/**
 * DELETE /api/testimonials/:id
 * Admin only — delete a testimonial
 */
testimonials.delete("/:id", async (c) => {
  const { id } = c.req.param();

  try {
    await prisma.testimonial.delete({
      where: { id },
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    return c.json({ error: "Testimonial not found" }, 404);
  }
});

export default testimonials;
