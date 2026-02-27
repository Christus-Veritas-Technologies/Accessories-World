import { Hono } from "hono";
import { logger } from "hono/logger";
import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import PDFDocument from "pdfkit";

const app = new Hono();
app.use("*", logger());

// ─── WhatsApp Client ──────────────────────────────────────────────────────────

let whatsappReady = false;
let qrCode: string | null = null;

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
  qrCode = qr;
  console.log("\n📱 WhatsApp QR Code - Scan with your phone:\n");
  qrcode.generate(qr, { small: true });
  console.log("\n");
});

client.on("ready", () => {
  whatsappReady = true;
  qrCode = null;
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

// Serialize all sends — whatsapp-web.js can't handle concurrent sendMessage calls
let sendQueue: Promise<void> = Promise.resolve();

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

  return new Promise<{ success: boolean; chatId: string }>((resolve, reject) => {
    sendQueue = sendQueue
      .catch(() => {}) // don't let a previous failure stall the queue
      .then(async () => {
        try {
          await client.sendMessage(chatId, message);
          resolve({ success: true, chatId });
        } catch (err) {
          reject(err);
        }
      });
  });
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
    hasQR: !!qrCode,
  })
);

/** GET /api/whatsapp/qr — get QR code for scanning */
app.get("/api/whatsapp/qr", (c) => {
  if (whatsappReady) {
    return c.json({ message: "WhatsApp is already connected" });
  }
  if (!qrCode) {
    return c.json({ message: "No QR code available yet. Initializing..." });
  }
  return c.json({ qr: qrCode });
});

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
 * Body: { phone: string, message: string, replyTo?: string }
 */
app.post("/send-message", async (c) => {
  try {
    const { phone, message } = await c.req.json<{
      phone: string;
      message: string;
      replyTo?: string;
    }>();

    const result = await sendWhatsAppMessage(phone, message);
    return c.json(result);
  } catch (err: any) {
    const status = err.message.includes("not connected") ? 503 : 400;
    return c.json({ error: err.message || "Failed to send message" }, status);
  }
});

// ─── PDF Receipt Generation ───────────────────────────────────────────────────

interface ReceiptData {
  saleNumber: string;
  customerName: string;
  customerWhatsapp: string;
  productName?: string;
  revenue: number;
  quantity: number;
  notes?: string;
}

function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const RED = "#DC2626";
    const DARK = "#111827";
    const GRAY = "#6B7280";
    const L = 50;
    const R = doc.page.width - 50;
    const W = R - L;

    // ── Red header ──
    doc.rect(0, 0, doc.page.width, 105).fill(RED);

    doc
      .fontSize(26)
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .text("ACCESSORIES WORLD", L, 22);

    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#FFFFFF")
      .text("Your Accessories Destination in Mutare", L, 58)
      .text("info@accessoriesworldmutare.co.zw", L, 74);

    // ── Receipt heading ──
    doc
      .fontSize(20)
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .text("RECEIPT", L, 125);

    // ── Info row labels ──
    const date = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    doc.fontSize(9).font("Helvetica-Bold").fillColor(GRAY);
    doc.text("RECEIPT NO.", L, 163);
    doc.text("DATE", L + 185, 163);
    doc.text("CUSTOMER", L + 350, 163);

    // ── Info row values ──
    doc.fontSize(11).font("Helvetica").fillColor(DARK);
    doc.text(data.saleNumber, L, 177);
    doc.text(date, L + 185, 177);
    doc.text(data.customerName, L + 350, 177, { width: 145, ellipsis: true });

    // ── Divider ──
    doc.moveTo(L, 205).lineTo(R, 205).strokeColor("#E5E7EB").lineWidth(1).stroke();

    // ── Table header ──
    doc.rect(L, 215, W, 28).fill("#F3F4F6");
    doc.fontSize(9).font("Helvetica-Bold").fillColor(GRAY);
    doc.text("ITEM", L + 8, 226);
    doc.text("QTY", L + 340, 226);
    doc.text("AMOUNT", R - 65, 226);

    // ── Table row ──
    const item = data.productName ?? "Accessories";
    doc.fontSize(11).font("Helvetica").fillColor(DARK);
    doc.text(item, L + 8, 260, { width: 295 });
    doc.text(String(data.quantity), L + 340, 260);
    doc.text(`$${Number(data.revenue).toFixed(2)}`, R - 65, 260);

    // ── Notes (if any) ──
    let noteY = 290;
    if (data.notes) {
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(GRAY)
        .text(`Note: ${data.notes}`, L + 8, noteY, { width: W - 8 });
      noteY += 20;
    }

    // ── Total ──
    const totalY = noteY + 15;
    doc
      .moveTo(L, totalY)
      .lineTo(R, totalY)
      .strokeColor("#E5E7EB")
      .lineWidth(1)
      .stroke();

    doc.rect(R - 175, totalY + 12, 175, 34).fill("#FEF2F2");
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor(RED)
      .text("TOTAL:", R - 165, totalY + 22)
      .text(`$${Number(data.revenue).toFixed(2)}`, R - 65, totalY + 22);

    // ── Red accent ──
    const accentY = totalY + 65;
    doc.moveTo(L, accentY).lineTo(R, accentY).strokeColor(RED).lineWidth(2).stroke();

    // ── Thank you ──
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor(RED)
      .text("Thank you for shopping at Accessories World!", L, accentY + 20, {
        align: "center",
        width: W,
      });

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(GRAY)
      .text(
        "We truly appreciate your support. If you have any questions about your purchase,\nplease reach out — we are always happy to help.",
        L,
        accentY + 48,
        { align: "center", width: W }
      );

    // ── Footer ──
    const footerY = doc.page.height - 55;
    doc.rect(0, footerY, doc.page.width, 55).fill("#F9FAFB");
    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(GRAY)
      .text(
        "Accessories World  ·  Mutare, Zimbabwe  ·  info@accessoriesworldmutare.co.zw",
        L,
        footerY + 20,
        { align: "center", width: W }
      );

    doc.end();
  });
}

/**
 * POST /api/receipt/send
 * Generates a PDF receipt and sends it to the customer via WhatsApp.
 * Body: { saleNumber, customerName, customerWhatsapp, productName?, revenue, quantity, notes? }
 */
app.post("/api/receipt/send", async (c) => {
  try {
    const body = await c.req.json<ReceiptData>();

    if (!body.customerWhatsapp) {
      return c.json({ error: "customerWhatsapp is required" }, 400);
    }
    if (!body.saleNumber || body.revenue == null) {
      return c.json({ error: "saleNumber and revenue are required" }, 400);
    }
    if (!whatsappReady) {
      return c.json({ error: "WhatsApp client is not connected" }, 503);
    }

    // Step 1: Generate PDF — must succeed before any WhatsApp sends
    const pdfBuffer = await generateReceiptPDF(body);

    // Step 2: Prepare WhatsApp message + media
    const cleanPhone = body.customerWhatsapp.replace(/[\s\-\+]/g, "");
    const chatId = `${cleanPhone}@c.us`;
    const productLine = body.productName ? `\nProduct: ${body.productName}` : "";
    const greeting = `Hope you enjoyed your purchase! 🎉${productLine}\n\nSale #: ${body.saleNumber}\nTotal: $${Number(body.revenue).toFixed(2)}\nQty: ${body.quantity}\n\nThank you for supporting Accessories World — it means the world to us! 💜`;
    const media = new MessageMedia(
      "application/pdf",
      pdfBuffer.toString("base64"),
      `receipt-${body.saleNumber}.pdf`
    );

    // Step 3: Send via serialized queue
    await new Promise<void>((resolve, reject) => {
      sendQueue = sendQueue
        .catch(() => {})
        .then(async () => {
          try {
            await client.sendMessage(chatId, greeting);
            await client.sendMessage(chatId, media, { caption: "Your receipt is attached 📄" });
            resolve();
          } catch (err) {
            reject(err);
          }
        });
    });

    return c.json({ success: true });
  } catch (err: any) {
    const status = err.message?.includes("not connected") ? 503 : 500;
    return c.json({ error: err.message || "Failed to send receipt" }, status);
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3004);
console.log(`🤖 Accessories World Agent running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
