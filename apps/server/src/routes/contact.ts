import { Hono } from "hono";
import { prisma } from "@repo/db";
import { sendContactNotification } from "../lib/email.js";

const contact = new Hono();

/**
 * POST /api/contact
 * Public — submit a contact form
 */
contact.post("/", async (c) => {
  const { name, email, phone, message } = await c.req.json<{
    name: string;
    email: string;
    phone?: string;
    message: string;
  }>();

  if (!name || !email || !message) {
    return c.json(
      { error: "Name, email and message are required" },
      400
    );
  }

  // Save to DB
  const submission = await prisma.contactSubmission.create({
    data: { name, email, phone, message },
  });

  // Send email notification (non-blocking)
  sendContactNotification({ name, email, phone, message }).catch((err) =>
    console.error("Failed to send contact notification email:", err)
  );

  // Send WhatsApp notification via agent (non-blocking)
  const agentUrl = process.env.AGENT_URL ?? "http://localhost:3004";
  fetch(`${agentUrl}/api/whatsapp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: process.env.BUSINESS_WHATSAPP ?? "+263784923973",
      message: `📩 New Contact Form\n\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ""}\n\nMessage:\n${message}`,
    }),
  }).catch((err) =>
    console.error("Failed to send WhatsApp notification:", err)
  );

  return c.json({ success: true, id: submission.id }, 201);
});

export default contact;
