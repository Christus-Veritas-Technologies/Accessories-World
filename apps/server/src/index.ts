import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import auth from "./routes/auth.js";
import products from "./routes/products.js";
import categories from "./routes/categories.js";
import adminRoutes from "./routes/admin.js";
import wholesalerRoutes from "./routes/wholesalers.js";

const app = new Hono();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(
  "*",
  cors({
    origin: [
      process.env.WEB_URL ?? "http://localhost:3000",
      process.env.ADMIN_URL ?? "http://localhost:3001",
      process.env.WHOLESALER_URL ?? "http://localhost:3002",
    ],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("*", logger());
app.use("*", prettyJSON());

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get("/", (c) => {
  return c.json({
    name: "Accessories World API",
    version: "1.0.0",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (c) => c.json({ status: "ok" }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.route("/api/auth", auth);
app.route("/api/products", products);
app.route("/api/categories", categories);
app.route("/api/admin", adminRoutes);
app.route("/api/wholesalers", wholesalerRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.notFound((c) => c.json({ error: "Not found" }, 404));

// ─── Error Handler ────────────────────────────────────────────────────────────

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

// ─── Start ────────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3003);
console.log(`🚀 Accessories World API running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
