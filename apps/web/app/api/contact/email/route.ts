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

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    // Use email if provided, otherwise skip confirmation email
    if (!email) {
      return NextResponse.json(
        { error: "Email is required for email contact method" },
        { status: 400 }
      );
    }

    // Get server URL from environment
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3003";

    // Call server endpoint to send emails
    const response = await fetch(`${serverUrl}/api/contact/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Server error:", error);
      throw new Error(error.error || "Failed to send email");
    }

    const result = await response.json();

    return NextResponse.json(
      { success: true, message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email. Please try again later." },
      { status: 500 }
    );
  }
}
