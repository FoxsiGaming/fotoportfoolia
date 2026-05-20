import { NextRequest, NextResponse } from "next/server";
import { getPhotoById, updatePhoto, deletePhoto } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import fs from "fs";
import path from "path";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/photos/:id
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const photo = getPhotoById(id);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }
    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}

// PATCH /api/photos/:id — update photo metadata
export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const data = await request.json();
    const photo = updatePhoto(id, data);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }
    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error updating photo:", error);
    return NextResponse.json(
      { error: "Failed to update photo" },
      { status: 500 }
    );
  }
}

// DELETE /api/photos/:id
export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const photo = getPhotoById(id);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete file
    const filePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      photo.filename
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    deletePhoto(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
