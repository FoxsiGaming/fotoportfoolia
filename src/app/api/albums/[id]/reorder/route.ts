import { NextRequest, NextResponse } from "next/server";
import { reorderPhotos } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/albums/:id/reorder — reorder photos in album
export async function POST(request: NextRequest, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const { photoIds } = await request.json();
    if (!Array.isArray(photoIds)) {
      return NextResponse.json(
        { error: "photoIds must be an array" },
        { status: 400 }
      );
    }
    reorderPhotos(id, photoIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering photos:", error);
    return NextResponse.json(
      { error: "Failed to reorder photos" },
      { status: 500 }
    );
  }
}
