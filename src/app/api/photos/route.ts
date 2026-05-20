import { NextRequest, NextResponse } from "next/server";
import { getAllPhotos, getFeaturedPhotos } from "@/lib/data";

// GET /api/photos — list photos (optionally filtered)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (featured === "true") {
      const photos = getFeaturedPhotos(limit);
      return NextResponse.json(photos);
    }

    const photos = getAllPhotos(limit);
    return NextResponse.json(photos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
