import { NextRequest, NextResponse } from "next/server";
import { getAllAlbums, createAlbum } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

// GET /api/albums — list all albums
export async function GET() {
  try {
    const albums = getAllAlbums();
    return NextResponse.json(albums);
  } catch (error) {
    console.error("Error fetching albums:", error);
    return NextResponse.json(
      { error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

// POST /api/albums — create album (auth required)
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Album name is required" },
        { status: 400 }
      );
    }
    const album = createAlbum(name.trim(), description?.trim() || "");
    return NextResponse.json(album, { status: 201 });
  } catch (error) {
    console.error("Error creating album:", error);
    return NextResponse.json(
      { error: "Failed to create album" },
      { status: 500 }
    );
  }
}
