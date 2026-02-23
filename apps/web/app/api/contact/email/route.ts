import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate input
    if (!name || !message) {
      return NextResponse.json(
        { error: "Name and message are required" },
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    // Check if SMTP credentials are configured
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !smtpFrom) {
      console.error("SMTP credentials not configured");
      return NextResponse.json(
        { error: "Email service is not configured. Please try WhatsApp instead." },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === "465", // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // User's email (for reply)
    const userEmail = email || smtpFrom;

    // Send confirmation email to user
    await transporter.sendMail({
      from: smtpFrom,
      to: userEmail,
      subject: "We received your message - Accessories World",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #dc2626;">Accessories World</h2>
          <p>Hi ${name},</p>
          <p>Thank you for reaching out! We've received your message and will get back to you as soon as possible.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
          </div>
          <p>Best regards,<br><strong>Accessories World Team</strong></p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            49-51 Second Street, Mutare, Zimbabwe<br>
            Phone: +263 78 492 3973<br>
            Email: info@accessoriesworld.co.zw
          </p>
        </div>
      `,
    });

    // Send notification email to business
    await transporter.sendMail({
      from: smtpFrom,
      to: process.env.BUSINESS_EMAIL || smtpFrom,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #dc2626;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email || "Not provided"}</p>
          <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p>${message.replace(/\n/g, "<br>")}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 }
    );
  }
}
