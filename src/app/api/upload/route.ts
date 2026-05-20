import { NextRequest, NextResponse } from "next/server";
import { createPhoto } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// POST /api/upload — upload one or more images
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const albumId = formData.get("album_id") as string;
    const files = formData.getAll("files") as File[];

    if (!albumId) {
      return NextResponse.json(
        { error: "album_id is required" },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });

    const photos = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Generate unique filename
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${uuidv4()}${ext}`;
      const filePath = path.join(uploadDir, filename);

      // Write file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fs.writeFileSync(filePath, buffer);

      // Try to get image dimensions (basic approach)
      let width = 0;
      let height = 0;

      // Create photo record
      const photo = createPhoto({
        album_id: albumId,
        filename,
        original_name: file.name,
        title: file.name.replace(/\.[^.]+$/, ""),
        width,
        height,
      });

      photos.push(photo);
    }

    return NextResponse.json({ photos, count: photos.length }, { status: 201 });
  } catch (error) {
    console.error("Error uploading:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
