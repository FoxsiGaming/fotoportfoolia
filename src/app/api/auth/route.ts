import { NextRequest, NextResponse } from "next/server";
import { login, logout, isAuthenticated } from "@/lib/auth";

// POST /api/auth — login
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const success = await login(password);

    if (success) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/auth — logout
export async function DELETE() {
  await logout();
  return NextResponse.json({ success: true });
}

// GET /api/auth — check auth status
export async function GET() {
  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}
