import { Hono } from "hono";
import { logger } from "hono/logger";
import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import PDFDocument from "pdfkit";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const app = new Hono();
app.use("*", logger());

// ─── R2 Storage Client ────────────────────────────────────────────────────────

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/** Upload PDF buffer to R2 and return public URL */
async function uploadPdfToR2(pdfBuffer: Buffer, fileName: string, requestId: string): Promise<string> {
  console.log(`☁️  [${requestId}] Starting R2 upload for: ${fileName}`);
  
  const safeName = fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
  const key = `receipts/${Date.now()}-${safeName}`;
  
  try {
    console.log(`☁️  [${requestId}] Uploading to R2: s3://${process.env.R2_BUCKET}/${key}`);
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
      })
    );
    
    const url = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
    console.log(`✓ [${requestId}] PDF uploaded to R2: ${url}`);
    return url;
  } catch (err: any) {
    console.error(`❌ [${requestId}] R2 upload failed:`, err?.message);
    throw new Error(`Failed to upload PDF to R2: ${err?.message || "Unknown error"}`);
  }
}

// ─── WhatsApp Client ──────────────────────────────────────────────────────────

let whatsappReady = false;
let qrCode: string | null = null;

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: ".wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
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

/** Retry logic for WhatsApp sends */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelayMs: number = 500
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      
      // Don't retry on validation errors
      if (err?.message?.includes("WhatsApp") || err?.message?.includes("validation")) {
        throw err;
      }
      
      if (attempt < maxRetries) {
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        console.warn(`⚠️  Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
}

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
          await retryWithBackoff(() => client.sendMessage(chatId, message), 2, 500);
          resolve({ success: true, chatId });
        } catch (err) {
          reject(err);
        }
      });
  });
}

/** Generate a sale/receipt number server-side using UUID */
function generateSaleNumber(): string {
  // short, human-friendly: first UUID segment uppercased (e.g. "A1B2C3D4")
  return randomUUID().split("-")[0].toUpperCase();
}

/** Convert phone number to valid WhatsApp chat ID with validation */
async function toChatId(rawPhone: string, requestId: string): Promise<string> {
  console.log(`📞 [${requestId}] Converting phone number: ${rawPhone}`);
  
  // Step 1: Strip whitespace, dashes, plus signs
  let phone = rawPhone.replace(/[\s\-\+]/g, "");
  console.log(`📞 [${requestId}] After stripping special chars: ${phone}`);
  
  // Step 2: Zimbabwe normalization (0775... → 263775...)
  if (phone.startsWith("0")) {
    phone = "263" + phone.slice(1);
    console.log(`📞 [${requestId}] Converted local format (0...) to international: ${phone}`);
  }
  
  // Step 3: Validate with WhatsApp
  console.log(`📞 [${requestId}] Validating with WhatsApp (getNumberId)...`);
  try {
    const numberId = await client.getNumberId(phone);
    if (!numberId) {
      console.error(`❌ [${requestId}] Phone number validation failed: not registered on WhatsApp`);
      throw new Error(`Phone number ${rawPhone} is not registered on WhatsApp (or invalid format). Validated as: ${phone}`);
    }
    
    const chatId = numberId._serialized;
    console.log(`✓ [${requestId}] Phone number validated and converted to chat ID: ${chatId}`);
    return chatId;
  } catch (err: any) {
    console.error(`❌ [${requestId}] WhatsApp validation error:`, err?.message);
    throw new Error(`Failed to validate WhatsApp number: ${err?.message || "Unknown error"}`);
  }
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
    const status = err?.message?.includes("not connected") ? 503 : 400;
    return c.json({ error: err?.message || "Failed to send message" }, status);
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
    const status = err?.message?.includes("not connected") ? 503 : 400;
    return c.json({ error: err?.message || "Failed to send message" }, status);
  }
});

// ─── PDF Receipt Generation ───────────────────────────────────────────────────

interface MinifiedProduct {
  name: string;
  price: string; // stored as string for precision
}

interface ReceiptData {
  saleNumber: string; // generated server-side
  customerName: string;
  customerWhatsapp: string;
  products: MinifiedProduct[]; // array of {name, price}
  revenue: number; // total
  notes?: string;
}

type NotifyMode = "message" | "receipt";

interface ReceiptPayload {
  saleNumber?: string;
  customerName?: string | null;
  customerWhatsapp?: string;
  products?: MinifiedProduct[];
  revenue?: number | string;
  notes?: string;
  message?: string;
  sendPdf?: boolean;
  pdfCaption?: string;
  pdfFileName?: string;
}

interface NotifyRequestBody {
  type?: NotifyMode;
  phone?: string;
  customerWhatsapp?: string;
  message?: string;
  text?: string;
  sendPdf?: boolean;
  pdfCaption?: string;
  receipt?: ReceiptPayload;
  // Legacy receipt payload fields (kept for backward compatibility)
  customerName?: string | null;
  products?: MinifiedProduct[];
  revenue?: number | string;
  notes?: string;
}

interface NormalizedMessageRequest {
  phone: string;
  message: string;
}

interface NormalizedReceiptRequest {
  phone: string;
  message: string;
  receiptData: ReceiptData;
  sendPdf: boolean;
  pdfCaption: string;
  pdfFileName: string;
}

function badRequest(message: string): never {
  const err = new Error(message) as Error & { status?: number };
  err.status = 400;
  throw err;
}

function resolvePhone(body: NotifyRequestBody): string {
  const candidate =
    body.phone ?? body.customerWhatsapp ?? body.receipt?.customerWhatsapp ?? "";
  const phone = String(candidate).trim();
  if (!phone) {
    badRequest("phone (or customerWhatsapp) is required");
  }
  return phone;
}

function resolveMode(body: NotifyRequestBody): NotifyMode {
  if (body.type === "message") return "message";
  if (body.type === "receipt") return "receipt";
  if (
    body.receipt ||
    body.revenue != null ||
    Array.isArray(body.products) ||
    body.notes != null
  ) {
    return "receipt";
  }
  return "message";
}

function buildReceiptMessage(receiptData: ReceiptData): string {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    `Receipt from Accessories World\n\n` +
    `Sale No: ${receiptData.saleNumber}\n` +
    `Date: ${date}\n` +
    `Items: ${receiptData.products.length}\n` +
    `Total Paid: $${Number(receiptData.revenue).toFixed(2)}\n\n` +
    `Your receipt is attached as a PDF for your records.\n\n` +
    `Thank you for shopping with Accessories World.`
  );
}

function normalizeMessageRequest(body: NotifyRequestBody): NormalizedMessageRequest {
  const phone = resolvePhone(body);
  const message = String(body.message ?? body.text ?? "").trim();
  if (!message) {
    badRequest("message is required for message mode");
  }
  return { phone, message };
}

function normalizeReceiptRequest(body: NotifyRequestBody): NormalizedReceiptRequest {
  const phone = resolvePhone(body);
  const receipt = body.receipt ?? {};

  const rawProducts = receipt.products ?? body.products;
  if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
    badRequest("products must be a non-empty array for receipt mode");
  }

  const products = rawProducts.map((product, index) => {
    const name = String(product?.name ?? "").trim();
    const price = String(product?.price ?? "").trim();
    if (!name) {
      badRequest(`products[${index}].name is required`);
    }
    const priceNumber = Number(price);
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      badRequest(`products[${index}].price must be a valid number > 0`);
    }
    return { name, price: priceNumber.toFixed(2) };
  });

  const rawRevenue = receipt.revenue ?? body.revenue;
  if (rawRevenue == null) {
    badRequest("revenue is required for receipt mode");
  }
  const revenue = Number(rawRevenue);
  if (!Number.isFinite(revenue) || revenue <= 0) {
    badRequest("revenue must be a valid number > 0");
  }

  const saleNumber = String(receipt.saleNumber ?? "").trim() || generateSaleNumber();
  const customerName =
    String(receipt.customerName ?? body.customerName ?? "").trim() || "Customer";
  const notes = String(receipt.notes ?? body.notes ?? "").trim() || undefined;

  const receiptData: ReceiptData = {
    saleNumber,
    customerName,
    customerWhatsapp: phone,
    products,
    revenue,
    notes,
  };

  const message = String(
    receipt.message ?? body.message ?? body.text ?? buildReceiptMessage(receiptData)
  ).trim();
  if (!message) {
    badRequest("message must not be empty");
  }

  const sendPdf = (receipt.sendPdf ?? body.sendPdf) !== false;
  const pdfCaption = String(receipt.pdfCaption ?? body.pdfCaption ?? "Here's your receipt");
  const pdfFileName =
    String(receipt.pdfFileName ?? "").trim() ||
    `ACCESSORIES-WORLD-${receiptData.saleNumber}.pdf`;

  return {
    phone,
    message,
    receiptData,
    sendPdf,
    pdfCaption,
    pdfFileName,
  };
}

async function enqueueSend(
  requestId: string,
  chatId: string,
  message: string,
  media?: MessageMedia,
  mediaCaption?: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    sendQueue = sendQueue
      .catch((queueErr) => {
        console.warn(`[${requestId}] Previous queue item failed, continuing...`, queueErr);
      })
      .then(async () => {
        try {
          await new Promise((r) => setTimeout(r, 200));
          await retryWithBackoff(() => client.sendMessage(chatId, message), 2, 600);

          if (media) {
            await new Promise((r) => setTimeout(r, 300));
            await retryWithBackoff(
              () => client.sendMessage(chatId, media, { caption: mediaCaption }),
              2,
              600
            );
          }

          resolve();
        } catch (err) {
          reject(err);
        }
      });
  });
}

function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const RED = "#DC2626";
    const DARK = "#111827";
    const GRAY = "#6B7280";
    const L = 30;
    const R = doc.page.width - 30;
    const W = R - L;

    // ── Red header ──
    doc.rect(0, 0, doc.page.width, 75).fill(RED);

    doc
      .fontSize(20)
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .text("ACCESSORIES WORLD", L, 15);

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#FFFFFF")
      .text("Your Accessories Destination in Mutare", L, 42)
      .text("info@accessoriesworldmutare.co.zw", L, 54);

    // ── Receipt heading ──
    doc
      .fontSize(16)
      .fillColor(DARK)
      .font("Helvetica-Bold")
      .text("RECEIPT", L, 90);

    // ── Info row labels ──
    const date = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    doc.fontSize(8).font("Helvetica-Bold").fillColor(GRAY);
    doc.text("RECEIPT NO.", L, 112);
    doc.text("DATE", L + 140, 112);
    doc.text("CUSTOMER", L + 220, 112);

    // ── Info row values ──
    doc.fontSize(10).font("Helvetica").fillColor(DARK);
    doc.text(data.saleNumber, L, 124);
    doc.text(date, L + 140, 124);
    doc.text(data.customerName, L + 220, 124, { width: 110, ellipsis: true });

    // ── Divider ──
    doc
      .moveTo(L, 148)
      .lineTo(R, 148)
      .strokeColor("#E5E7EB")
      .lineWidth(1)
      .stroke();

    // ── Table header ──
    doc.rect(L, 155, W, 20).fill("#F3F4F6");
    doc.fontSize(8).font("Helvetica-Bold").fillColor(GRAY);
    doc.text("ITEM", L + 5, 161);
    doc.text("PRICE", R - 50, 161, { align: "right" });

    // ── Table rows (products) ──
    doc.fontSize(9).font("Helvetica").fillColor(DARK);
    let rowY = 180;
    for (const product of data.products) {
      doc.text(product.name, L + 5, rowY, { width: 235 });
      doc.text(`$${Number(product.price).toFixed(2)}`, R - 50, rowY, { align: "right" });
      rowY += 18;
    }
    rowY -= 3; // adjust for last row

    // ── Notes (if any) ──
    let noteY = rowY + 8;
    if (data.notes) {
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(GRAY)
        .text(`Note: ${data.notes}`, L + 5, noteY, { width: W - 10 });
      noteY += 12;
    }

    // ── Total ──
    const totalY = noteY + 5;
    doc
      .moveTo(L, totalY)
      .lineTo(R, totalY)
      .strokeColor("#E5E7EB")
      .lineWidth(1)
      .stroke();

    doc.rect(R - 140, totalY + 8, 140, 24).fill("#FEF2F2");
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor(RED)
      .text("TOTAL:", R - 135, totalY + 14)
      .text(`$${Number(data.revenue).toFixed(2)}`, R - 50, totalY + 14, { align: "right" });

    // ── Red accent ──
    const accentY = totalY + 45;
    doc
      .moveTo(L, accentY)
      .lineTo(R, accentY)
      .strokeColor(RED)
      .lineWidth(2)
      .stroke();

    // ── Thank you ──
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor(RED)
      .text("Thank you for shopping at Accessories World!", L, accentY + 12, {
        align: "center",
        width: W,
      });

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(GRAY)
      .text(
        "We appreciate your support. For any questions, reach out to us anytime.",
        L,
        accentY + 30,
        { align: "center", width: W }
      );

    // ── Footer ──
    const footerY = doc.page.height - 40;
    doc.rect(0, footerY, doc.page.width, 40).fill("#F9FAFB");
    doc
      .fontSize(7)
      .font("Helvetica")
      .fillColor(GRAY)
      .text(
        "Accessories World  ·  Mutare, Zimbabwe  ·  info@accessoriesworldmutare.co.zw",
        L,
        footerY + 12,
        { align: "center", width: W }
      );

    doc.end();
  });
}

/**
 * POST /api/receipt/send (legacy path)
 * POST /api/notify/send (general path)
 *
 * Supported payloads:
 * 1) Message mode:
 *    { "type": "message", "phone": "+2637...", "message": "text..." }
 *
 * 2) Receipt mode (new):
 *    {
 *      "type": "receipt",
 *      "phone": "+2637...",
 *      "receipt": {
 *        "customerName": "Jane",
 *        "products": [{ "name": "Case", "price": "10" }],
 *        "revenue": 10,
 *        "sendPdf": true
 *      }
 *    }
 *
 * 3) Receipt mode (legacy, still supported):
 *    {
 *      "customerWhatsapp": "+2637...",
 *      "products": [{ "name": "Case", "price": "10" }],
 *      "revenue": 10
 *    }
 */
const sendFlexibleNotification = async (c: any) => {
  const requestId = randomUUID().split("-")[0].toUpperCase();

  try {
    const body = (await c.req.json()) as NotifyRequestBody;

    if (!whatsappReady) {
      return c.json({ error: "WhatsApp client is not connected" }, 503);
    }

    const mode = resolveMode(body);

    if (mode === "message") {
      const normalized = normalizeMessageRequest(body);
      const chatId = await toChatId(normalized.phone, requestId);
      await enqueueSend(requestId, chatId, normalized.message);
      return c.json({
        success: true,
        mode,
        recipient: chatId,
      });
    }

    const normalized = normalizeReceiptRequest(body);
    const chatId = await toChatId(normalized.phone, requestId);

    let pdfUrl: string | undefined;
    let media: MessageMedia | undefined;

    if (normalized.sendPdf) {
      const pdfBuffer = await generateReceiptPDF(normalized.receiptData);
      pdfUrl = await uploadPdfToR2(pdfBuffer, normalized.pdfFileName, requestId);
      media = await MessageMedia.fromUrl(pdfUrl);
    }

    await enqueueSend(
      requestId,
      chatId,
      normalized.message,
      media,
      normalized.pdfCaption
    );

    return c.json({
      success: true,
      mode,
      recipient: chatId,
      saleNumber: normalized.receiptData.saleNumber,
      pdfUrl: pdfUrl ?? null,
    });
  } catch (err: any) {
    const statusFromError = Number(err?.status);
    let status = Number.isFinite(statusFromError) && statusFromError >= 400
      ? statusFromError
      : 500;

    if (status === 500) {
      const message = String(err?.message ?? "").toLowerCase();
      if (message.includes("required") || message.includes("must")) {
        status = 400;
      } else if (message.includes("not connected")) {
        status = 503;
      }
    }

    console.error(`[${requestId}] Notification send failed:`, err);
    return c.json(
      { error: err?.message || "Failed to send WhatsApp notification" },
      status
    );
  }
};

app.post("/api/receipt/send", sendFlexibleNotification);
app.post("/api/notify/send", sendFlexibleNotification);

// Start
const port = Number(process.env.PORT ?? 3004);
console.log(`🤖 Accessories World Agent running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
