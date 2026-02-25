import { Hono } from "hono";
import { logger } from "hono/logger";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const app = new Hono();
app.use("*", logger());

// ─── WhatsApp Client ──────────────────────────────────────────────────────────

let whatsappReady = false;

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
  puppeteer: {
      headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
  },
});

client.on("qr", (qr) => {
  console.log("\n📱 WhatsApp QR Code - Scan with your phone:\n");
  qrcode.generate(qr, { small: true });
  console.log("\n");
});

client.on("ready", () => {
  whatsappReady = true;
  console.log("✅ WhatsApp client is ready!");
});

client.on("disconnected", (reason) => {
  whatsappReady = false;
  console.log("❌ WhatsApp disconnected:", reason);
});

client.on("auth_failure", (msg) => {
  console.error("🔒 WhatsApp auth failure:", msg);
});

// Initialize the client
client.initialize().catch((err) => {
  console.error("Failed to initialize WhatsApp client:", err);
});

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Send a WhatsApp message */
async function sendWhatsAppMessage(phone: string, message: string) {
  if (!whatsappReady) {
    throw new Error("WhatsApp client is not connected");
  }

  if (!phone || !message) {
    throw new Error("Phone and message are required");
  }

  // Normalize phone: remove +, spaces, dashes
  const cleanPhone = phone.replace(/[\s\-\+]/g, "");
  const chatId = `${cleanPhone}@c.us`;

  await client.sendMessage(chatId, message);
  return { success: true, chatId };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/** Health check */
app.get("/", (c) =>
  c.json({
    name: "Accessories World Agent",
    version: "1.0.0",
    whatsapp: whatsappReady ? "connected" : "disconnected",
  })
);

/** GET /api/whatsapp/status — check WhatsApp connection status */
app.get("/api/whatsapp/status", (c) =>
  c.json({
    ready: whatsappReady,
    status: whatsappReady ? "connected" : "disconnected",
  })
);

/**
 * POST /api/whatsapp/send
 * Body: { phone: string, message: string }
 * Phone format: country code + number, e.g. "+263784923973" or "0784923973"
 */
app.post("/api/whatsapp/send", async (c) => {
  try {
    const { phone, message } = await c.req.json<{
      phone: string;
      message: string;
    }>();

    const result = await sendWhatsAppMessage(phone, message);
    return c.json(result);
  } catch (err: any) {
    const status = err.message.includes("not connected") ? 503 : 400;
    return c.json({ error: err.message || "Failed to send message" }, status);
  }
});

/**
 * POST /send-message
 * Send a WhatsApp message (alternative endpoint for web app)
 * Body: { phone: string, message: string }
 */
app.post("/send-message", async (c) => {
  try {
    const { phone, message } = await c.req.json<{
      phone: string;
      message: string;
    }>();

    const result = await sendWhatsAppMessage(phone, message);
    return c.json(result);
  } catch (err: any) {
    const status = err.message.includes("not connected") ? 503 : 400;
    return c.json({ error: err.message || "Failed to send message" }, status);
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3004);
console.log(`🤖 Accessories World Agent running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
