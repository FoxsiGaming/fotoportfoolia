import { NextRequest, NextResponse } from "next/server";
import {
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  getPhotosByAlbum,
} from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import fs from "fs";
import path from "path";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/albums/:id — get album with photos
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const album = getAlbumById(id);
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }
    const photos = getPhotosByAlbum(id);
    return NextResponse.json({ ...album, photos });
  } catch (error) {
    console.error("Error fetching album:", error);
    return NextResponse.json(
      { error: "Failed to fetch album" },
      { status: 500 }
    );
  }
}

// PATCH /api/albums/:id — update album
export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const data = await request.json();
    const album = updateAlbum(id, data);
    if (!album) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }
    return NextResponse.json(album);
  } catch (error) {
    console.error("Error updating album:", error);
    return NextResponse.json(
      { error: "Failed to update album" },
      { status: 500 }
    );
  }
}

// DELETE /api/albums/:id — delete album and all its photos
export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    // Delete photo files
    const photos = getPhotosByAlbum(id);
    for (const photo of photos) {
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        photo.filename
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    deleteAlbum(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting album:", error);
    return NextResponse.json(
      { error: "Failed to delete album" },
      { status: 500 }
    );
  }
}
