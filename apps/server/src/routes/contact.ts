import { Hono } from "hono";
import { prisma } from "@repo/db";

const contact = new Hono();

const BUSINESS_PHONE = process.env.BUSINESS_WHATSAPP ?? "+263784923973";
const AGENT_URL = process.env.AGENT_URL ?? "http://localhost:3004";

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const res = await fetch(`${AGENT_URL}/api/whatsapp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `Agent responded with ${res.status}`);
  }
}

/**
 * POST /api/contact
 * Public — submit a contact form (name, phone, message only)
 */
contact.post("/", async (c) => {
  const { name, phone, message } = await c.req.json<{
    name: string;
    phone: string;
    message: string;
  }>();

  if (!name || !phone || !message) {
    return c.json({ error: "Name, phone number and message are required" }, 400);
  }

  // Save to DB
  const submission = await prisma.contactSubmission.create({
    data: { name, phone, message },
  });

  // Send WhatsApp to business — non-blocking, errors are logged only
  sendWhatsApp(
    BUSINESS_PHONE,
    `📩 *${name}* just entered a message on the website:\n\n${message}\n\n📞 ${phone}`,
  ).catch((err) => console.error("[contact] Failed to notify business via WhatsApp:", err));

  // Send WhatsApp confirmation to the person who submitted — non-blocking
  sendWhatsApp(
    phone,
    `Hi ${name}! 👋\n\nThank you for your message. We've received it and will get back to you as soon as possible.\n\n— Accessories World`,
  ).catch((err) => console.error("[contact] Failed to send confirmation to user via WhatsApp:", err));

  return c.json({ success: true, id: submission.id }, 201);
});

export { contact };

export default contact;
