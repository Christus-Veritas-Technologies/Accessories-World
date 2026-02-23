import { NextRequest, NextResponse } from "next/server";

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

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required for WhatsApp" },
        { status: 400 }
      );
    }

    // Normalize phone number
    let normalizedPhone = phone.trim();
    
    // If it starts with 0, replace with +263 (Zimbabwe)
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "+263" + normalizedPhone.substring(1);
    }
    
    // If it doesn't start with +, add +263
    if (!normalizedPhone.startsWith("+")) {
      normalizedPhone = "+263" + normalizedPhone;
    }

    // Check if agent service is configured
    const agentUrl = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:3004";

    // Call agent endpoint to send WhatsApp message
    const response = await fetch(`${agentUrl}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        message: `Hello ${name}!\n\nThank you for contacting Accessories World. We received your message:\n\n"${message}"\n\nWe'll get back to you shortly.\n\nBest regards,\nAccessories World Team`,
        replyTo: email || null,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Agent error:", result);
      throw new Error(result.error || "Failed to send WhatsApp message");
    }

    return NextResponse.json(
      { success: true, message: "WhatsApp message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("WhatsApp sending error:", error);
    return NextResponse.json(
      { error: "Failed to send WhatsApp message. Please try email instead or try again later." },
      { status: 500 }
    );
  }
}
