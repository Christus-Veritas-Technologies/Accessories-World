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
    doc
      .moveTo(L, 205)
      .lineTo(R, 205)
      .strokeColor("#E5E7EB")
      .lineWidth(1)
      .stroke();

    // ── Table header ──
    doc.rect(L, 215, W, 28).fill("#F3F4F6");
    doc.fontSize(9).font("Helvetica-Bold").fillColor(GRAY);
    doc.text("ITEM", L + 8, 226);
    doc.text("PRICE", R - 65, 226, { align: "right" });

    // ── Table rows (products) ──
    doc.fontSize(11).font("Helvetica").fillColor(DARK);
    let rowY = 250;
    for (const product of data.products) {
      doc.text(product.name, L + 8, rowY, { width: 295 });
      doc.text(`$${Number(product.price).toFixed(2)}`, R - 65, rowY, { align: "right" });
      rowY += 30;
    }
    rowY -= 10; // adjust for last row

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
    doc
      .moveTo(L, accentY)
      .lineTo(R, accentY)
      .strokeColor(RED)
      .lineWidth(2)
      .stroke();

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
 *
 * Body: {
 *   customerName?: string,
 *   customerWhatsapp: string,
 *   products: {name: string, price: string}[],
 *   revenue: number,
 *   notes?: string
 * }
 *
 * NOTE: saleNumber is generated server-side using UUID.
 */
app.post("/api/receipt/send", async (c) => {
  const requestId = randomUUID().split("-")[0].toUpperCase();
  console.log(`\n📨 [${requestId}] ============ RECEIPT REQUEST START ============`);
  
  let body: any;
  
  try {
    console.log(`📨 [${requestId}] Parsing request body...`);
    body = await c.req.json<{
      customerName?: string | null;
      customerWhatsapp: string;
      products: MinifiedProduct[];
      revenue: number;
      notes?: string;
    }>();

    console.log(`📨 [${requestId}] ✓ Request body parsed:`, {
      customerName: body.customerName,
      customerWhatsapp: body.customerWhatsapp?.substring(0, 5) + "***",
      productCount: body.products?.length ?? 0,
      revenue: body.revenue,
      notes: body.notes ? `"${body.notes.substring(0, 20)}..."` : undefined,
    });

    // Validate customerWhatsapp
    if (!body.customerWhatsapp) {
      console.error(`❌ [${requestId}] Validation failed: Missing customerWhatsapp`);
      return c.json({ error: "customerWhatsapp is required" }, 400);
    }
    console.log(`✓ [${requestId}] customerWhatsapp: ${body.customerWhatsapp}`);

    // Validate products array
    if (!Array.isArray(body.products) || body.products.length === 0) {
      console.error(`❌ [${requestId}] Validation failed: products must be a non-empty array`);
      return c.json({ error: "products must be a non-empty array" }, 400);
    }
    console.log(`✓ [${requestId}] products array valid: ${body.products.length} item(s)`);

    // Validate revenue
    if (body.revenue == null) {
      console.error(`❌ [${requestId}] Validation failed: Missing revenue`);
      return c.json({ error: "revenue is required" }, 400);
    }
    console.log(`✓ [${requestId}] revenue field present: ${body.revenue}`);

    const revenueNumber = Number(body.revenue);
    console.log(`📊 [${requestId}] revenue converted to number: ${revenueNumber}`);
    
    if (!Number.isFinite(revenueNumber) || revenueNumber <= 0) {
      console.error(`❌ [${requestId}] Validation failed: Invalid revenue value (${revenueNumber})`);
      return c.json({ error: "revenue must be a valid number > 0" }, 400);
    }
    console.log(`✓ [${requestId}] revenue is valid: $${revenueNumber.toFixed(2)}`);

    // Check WhatsApp status
    console.log(`🔗 [${requestId}] Checking WhatsApp client status... (ready: ${whatsappReady})`);
    if (!whatsappReady) {
      console.error(`❌ [${requestId}] WhatsApp client not connected`);
      return c.json({ error: "WhatsApp client is not connected" }, 503);
    }
    console.log(`✓ [${requestId}] WhatsApp client is ready`);

    // ✅ Generate sale number server-side
    console.log(`🎫 [${requestId}] Generating sale number...`);
    const saleNumber = generateSaleNumber();
    console.log(`✓ [${requestId}] Sale number generated: ${saleNumber}`);

    const receiptData: ReceiptData = {
      saleNumber,
      customerName: (body.customerName ?? "").trim() || "Customer",
      customerWhatsapp: body.customerWhatsapp,
      products: body.products,
      revenue: revenueNumber,
      notes: body.notes,
    };

    console.log(`📄 [${requestId}] Receipt data prepared:`, {
      saleNumber: receiptData.saleNumber,
      customerName: receiptData.customerName,
      customerWhatsapp: receiptData.customerWhatsapp?.substring(0, 5) + "***",
      productCount: receiptData.products.length,
      revenue: receiptData.revenue,
    });

    // Step 1: Generate PDF — must succeed before any WhatsApp sends
    console.log(`📝 [${requestId}] Step 1: Starting PDF generation...`);
    const startPdfTime = Date.now();
    const pdfBuffer = await generateReceiptPDF(receiptData);
    const pdfGenerationTime = Date.now() - startPdfTime;
    console.log(`✓ [${requestId}] PDF generated successfully in ${pdfGenerationTime}ms (${pdfBuffer.length} bytes)`);

    // Step 1b: Upload PDF to R2
    console.log(`📝 [${requestId}] Step 1b: Uploading PDF to R2...`);
    let pdfUrl: string;
    try {
      pdfUrl = await uploadPdfToR2(
        pdfBuffer,
        `receipt-${receiptData.saleNumber}.pdf`,
        requestId
      );
    } catch (uploadErr: any) {
      console.error(`❌ [${requestId}] PDF upload failed:`, uploadErr.message);
      return c.json({ error: uploadErr.message }, 500);
    }

    // Step 2: Prepare WhatsApp message + media
    console.log(`📲 [${requestId}] Step 2: Preparing WhatsApp message...`);
    
    // Convert and validate phone number
    let chatId: string;
    try {
      chatId = await toChatId(receiptData.customerWhatsapp, requestId);
    } catch (validationErr: any) {
      console.error(`❌ [${requestId}] Phone number validation failed:`, validationErr.message);
      return c.json({ error: validationErr.message }, 400);
    }
    
    console.log(`💬 [${requestId}] Chat ID: ${chatId}`);
    
    const productLine = receiptData.productName
      ? `\nProduct: ${receiptData.productName}`
      : "";
    const greeting =
      `Hope you enjoyed your purchase! 🎉${productLine}\n\n` +
      `Sale #: ${receiptData.saleNumber}\n` +
      `Total: $${Number(receiptData.revenue).toFixed(2)}\n` +
      `Qty: ${receiptData.quantity}\n\n` +
      `Thank you for supporting Accessories World — it means the world to us! 💜`;

    console.log(`📝 [${requestId}] Greeting message prepared:\n${greeting}`);

    // Load PDF from R2 URL as MessageMedia
    console.log(`📄 [${requestId}] Loading PDF from R2: ${pdfUrl}`);
    let media: MessageMedia;
    try {
      media = await MessageMedia.fromUrl(pdfUrl);
      console.log(`✓ [${requestId}] PDF loaded from R2 as MessageMedia`);
    } catch (mediaErr: any) {
      console.error(`❌ [${requestId}] Failed to load PDF from R2:`, mediaErr.message);
      return c.json({ error: `Failed to load PDF: ${mediaErr.message}` }, 500);
    }

    // Step 3: Send via serialized queue
    console.log(`⏳ [${requestId}] Step 3: Adding to WhatsApp send queue...`);
    console.log(`📊 [${requestId}] Current send queue status: pending`);
    
    await new Promise<void>((resolve, reject) => {
      sendQueue = sendQueue
        .catch((queueErr) => {
          console.warn(`⚠️  [${requestId}] Previous queue item failed, continuing...`, queueErr);
        })
        .then(async () => {
          try {
            console.log(`📤 [${requestId}] Sending greeting message to ${chatId}...`);
            console.log(`📤 [${requestId}] Message content:\n${greeting}`);
            console.log(`📤 [${requestId}] Chat ID: ${chatId}`);
            console.log(`📤 [${requestId}] WhatsApp client ready: ${whatsappReady}`);
            
            const sendTime1 = Date.now();
            // Add small delay before sending to allow frame stability
            await new Promise(r => setTimeout(r, 200));
            
            await retryWithBackoff(
              () => client.sendMessage(chatId, greeting),
              2,
              600
            );
            const time1 = Date.now() - sendTime1;
            console.log(`✓ [${requestId}] Greeting sent successfully in ${time1}ms`);

            // Add delay between messages for stability
            await new Promise(r => setTimeout(r, 300));

            console.log(`📤 [${requestId}] Sending PDF receipt to ${chatId}...`);
            console.log(`📤 [${requestId}] PDF URL: ${pdfUrl}`);
            console.log(`📤 [${requestId}] Media caption: "Your receipt is attached 📄"`);
            
            const sendTime2 = Date.now();
            await retryWithBackoff(
              () => client.sendMessage(chatId, media, {
                caption: "Your receipt is attached 📄",
              }),
              2,
              600
            );
            const time2 = Date.now() - sendTime2;
            console.log(`✓ [${requestId}] PDF receipt sent successfully in ${time2}ms`);

            console.log(`✅ [${requestId}] Both messages sent successfully to ${chatId}`);
            resolve();
          } catch (err) {
            console.error(`❌ [${requestId}] Error sending messages`);
            console.error(`❌ [${requestId}] Error constructor:`, err?.constructor?.name);
            console.error(`❌ [${requestId}] Error keys:`, Object.keys(err || {}));
            console.error(`❌ [${requestId}] Error toString():`, err?.toString?.());
            console.error(`❌ [${requestId}] Error message:`, err?.message);
            console.error(`❌ [${requestId}] Error code:`, err?.code);
            console.error(`❌ [${requestId}] Error response:`, err?.response);
            console.error(`❌ [${requestId}] Full error object:`, JSON.stringify(err, null, 2).substring(0, 500));
            console.error(`❌ [${requestId}] Stack trace:`, err?.stack?.split('\n').slice(0, 5).join('\n'));
            console.error(`❌ [${requestId}] WhatsApp client state after error - ready: ${whatsappReady}`);
            reject(err);
          }
        });
    });

    console.log(`🎉 [${requestId}] ============ RECEIPT SUCCESS ============\n`);
    return c.json({ success: true, saleNumber: receiptData.saleNumber });
  } catch (err: any) {
    console.error(`\n🚨 [${requestId}] ============ RECEIPT ERROR ============`);
    console.error(`❌ [${requestId}] Error occurred at: ${new Date().toISOString()}`);
    console.error(`❌ [${requestId}] Error constructor name:`, err?.constructor?.name || "Unknown");
    console.error(`❌ [${requestId}] Error message:`, err?.message || "No message");
    console.error(`❌ [${requestId}] Error code:`, err?.code || "No code");
    console.error(`❌ [${requestId}] Error name:`, err?.name || "No name");
    
    // Log all enumerable properties
    if (err && typeof err === "object") {
      const props = Object.getOwnPropertyNames(err);
      console.error(`❌ [${requestId}] Error properties:`, props);
      props.forEach(prop => {
        try {
          console.error(`    - ${prop}:`, err[prop]);
        } catch (e) {
          console.error(`    - ${prop}: [unable to read]`);
        }
      });
    }
    
    console.error(`❌ [${requestId}] Stack (first 10 lines):`);
    if (err?.stack) {
      err.stack.split('\n').slice(0, 10).forEach((line: string) => {
        console.error(`    ${line}`);
      });
    } else {
      console.error(`    [No stack trace available]`);
    }
    
    // Log error as string representations
    try {
      console.error(`❌ [${requestId}] Error.toString():`, err?.toString?.());
    } catch (e) {
      console.error(`❌ [${requestId}] Error.toString(): [failed to stringify]`);
    }
    
    try {
      console.error(`❌ [${requestId}] Error JSON:`, JSON.stringify(err, null, 2).substring(0, 800));
    } catch (e) {
      console.error(`❌ [${requestId}] Error JSON: [failed to stringify]`);
    }
    
    console.error(`❌ [${requestId}] WhatsApp client state: ready=${whatsappReady}`);
    console.error(`❌ [${requestId}] Request details: phone=${body?.customerWhatsapp}, customer=${body?.customerName}`);
    
    const status = err?.message?.includes("not connected") || !whatsappReady ? 503 : 500;
    const errorResponse = { error: err?.message || "Failed to send receipt" };
    console.error(`❌ [${requestId}] Returning HTTP ${status}:`, errorResponse);
    console.error(`❌ [${requestId}] ============ REQUEST FAILED ============\n`);
    
    return c.json(errorResponse, status);
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3004);
console.log(`🤖 Accessories World Agent running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};