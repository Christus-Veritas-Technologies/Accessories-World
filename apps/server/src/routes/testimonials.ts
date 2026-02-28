import { Hono } from "hono";

const testimonials = new Hono();

const STATIC_TESTIMONIALS = [
  {
    id: "1",
    name: "Tatenda Moyo",
    location: "Mutare",
    message:
      "Amazing quality products! I bought a phone case and a charger, both have lasted over a year. Highly recommend Accessories World!",
    rating: 5,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Chiedza Nhamo",
    location: "Mutare CBD",
    message:
      "Best accessory shop in Mutare. The staff are friendly and the prices are very fair. My whole family now shops here.",
    rating: 5,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Blessing Mutasa",
    location: "Sakubva",
    message:
      "I was worried about quality but these are genuine products. My earphones are still going strong after 8 months!",
    rating: 5,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Farai Chikwanda",
    location: "Dangamvura",
    message:
      "Great service and fast delivery. I ordered a car charger and it arrived the same day. Will definitely be back!",
    rating: 5,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Rudo Banda",
    location: "Mutare",
    message:
      "Accessories World is my go-to shop for all phone accessories. Competitive prices and genuine products every time.",
    rating: 5,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Tinashe Chirisa",
    location: "Mutare",
    message:
      "Bought a screen protector and the staff installed it for free! That kind of service keeps me coming back.",
    rating: 5,
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/** GET /api/testimonials — returns static testimonials */
testimonials.get("/", (c) => {
  const { limit = "10", featured } = c.req.query();
  let items = featured === "true"
    ? STATIC_TESTIMONIALS.filter((t) => t.featured)
    : STATIC_TESTIMONIALS;
  items = items.slice(0, Number(limit));
  return c.json({ items });
});

/** POST /api/testimonials — disabled, testimonials are now static */
testimonials.post("/", (c) => {
  return c.json({ error: "Testimonials are now managed statically" }, 501);
});

/** DELETE /api/testimonials/:id — disabled, testimonials are now static */
testimonials.delete("/:id", (c) => {
  return c.json({ error: "Testimonials are now managed statically" }, 501);
});

export default testimonials;
