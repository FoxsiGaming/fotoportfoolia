import { NextRequest, NextResponse } from "next/server";

// POST /api/contact — handle contact form submissions
export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // For MVP: log the message. In production, you'd send an email or store it.
    console.log("Contact form submission:", { name, email, message });

    // You could integrate with Resend, SendGrid, or store in DB here
    return NextResponse.json({
      success: true,
      message: "Thank you for your message! I'll get back to you soon.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
