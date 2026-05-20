/**
 * Data access layer — all database queries in one place.
 * Clean separation between DB and route handlers.
 */
import { getDb } from "./db";
import { v4 as uuidv4 } from "uuid";
import type { Album, Photo, SiteSettings } from "./types";

// ─── Albums ──────────────────────────────────────────────

export function getAllAlbums(): Album[] {
  const db = getDb();
  const albums = db
    .prepare(
      `SELECT a.*,
              (SELECT COUNT(*) FROM photos WHERE album_id = a.id) as photo_count
       FROM albums a
       ORDER BY a.sort_order ASC, a.created_at DESC`
    )
    .all() as Album[];

  // Attach cover photos
  return albums.map((album) => {
    if (album.cover_photo_id) {
      album.cover_photo = db
        .prepare("SELECT * FROM photos WHERE id = ?")
        .get(album.cover_photo_id) as Photo | undefined;
    }
    if (!album.cover_photo) {
      // Fallback: use first photo in album
      album.cover_photo = db
        .prepare(
          "SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order ASC LIMIT 1"
        )
        .get(album.id) as Photo | undefined;
    }
    return album;
  });
}

export function getAlbumBySlug(slug: string): Album | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM albums WHERE slug = ?")
    .get(slug) as Album | undefined;
}

export function getAlbumById(id: string): Album | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM albums WHERE id = ?")
    .get(id) as Album | undefined;
}

export function createAlbum(name: string, description = ""): Album {
  const db = getDb();
  const id = uuidv4();
  const slug = slugify(name);
  const maxOrder = (
    db.prepare("SELECT MAX(sort_order) as max FROM albums").get() as {
      max: number | null;
    }
  ).max;

  db.prepare(
    "INSERT INTO albums (id, name, slug, description, sort_order) VALUES (?, ?, ?, ?, ?)"
  ).run(id, name, slug, description, (maxOrder ?? -1) + 1);

  return getAlbumById(id)!;
}

export function updateAlbum(
  id: string,
  data: Partial<Pick<Album, "name" | "description" | "cover_photo_id">>
): Album | undefined {
  const db = getDb();
  const updates: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    updates.push("name = ?", "slug = ?");
    values.push(data.name, slugify(data.name));
  }
  if (data.description !== undefined) {
    updates.push("description = ?");
    values.push(data.description);
  }
  if (data.cover_photo_id !== undefined) {
    updates.push("cover_photo_id = ?");
    values.push(data.cover_photo_id);
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE albums SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values
    );
  }

  return getAlbumById(id);
}

export function deleteAlbum(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM albums WHERE id = ?").run(id);
}

// ─── Photos ──────────────────────────────────────────────

export function getPhotosByAlbum(albumId: string): Photo[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order ASC")
    .all(albumId) as Photo[];
}

export function getPhotoById(id: string): Photo | undefined {
  const db = getDb();
  const photo = db
    .prepare(
      `SELECT p.*, a.name as album_name, a.slug as album_slug
       FROM photos p
       JOIN albums a ON p.album_id = a.id
       WHERE p.id = ?`
    )
    .get(id) as Photo | undefined;
  return photo;
}

export function getFeaturedPhotos(limit = 20): Photo[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT p.*, a.name as album_name, a.slug as album_slug
       FROM photos p
       JOIN albums a ON p.album_id = a.id
       WHERE p.featured = 1
       ORDER BY p.sort_order ASC
       LIMIT ?`
    )
    .all(limit) as Photo[];
}

export function getAllPhotos(limit = 100): Photo[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT p.*, a.name as album_name, a.slug as album_slug
       FROM photos p
       JOIN albums a ON p.album_id = a.id
       ORDER BY p.created_at DESC
       LIMIT ?`
    )
    .all(limit) as Photo[];
}

export function createPhoto(data: {
  album_id: string;
  filename: string;
  original_name: string;
  title?: string;
  width?: number;
  height?: number;
}): Photo {
  const db = getDb();
  const id = uuidv4();
  const maxOrder = (
    db
      .prepare(
        "SELECT MAX(sort_order) as max FROM photos WHERE album_id = ?"
      )
      .get(data.album_id) as { max: number | null }
  ).max;

  db.prepare(
    `INSERT INTO photos (id, album_id, filename, original_name, title, width, height, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    data.album_id,
    data.filename,
    data.original_name,
    data.title || data.original_name.replace(/\.[^.]+$/, ""),
    data.width || 0,
    data.height || 0,
    (maxOrder ?? -1) + 1
  );

  return getPhotoById(id)!;
}

export function updatePhoto(
  id: string,
  data: Partial<
    Pick<Photo, "title" | "description" | "featured" | "album_id"> & {
      exif_camera?: string;
      exif_lens?: string;
      exif_focal_length?: string;
      exif_aperture?: string;
      exif_shutter?: string;
      exif_iso?: string;
    }
  >
): Photo | undefined {
  const db = getDb();
  const updates: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE photos SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values
    );
  }

  return getPhotoById(id);
}

export function deletePhoto(id: string): void {
  const db = getDb();
  db.prepare("DELETE FROM photos WHERE id = ?").run(id);
}

export function reorderPhotos(
  albumId: string,
  photoIds: string[]
): void {
  const db = getDb();
  const stmt = db.prepare(
    "UPDATE photos SET sort_order = ? WHERE id = ? AND album_id = ?"
  );
  const transaction = db.transaction(() => {
    photoIds.forEach((photoId, index) => {
      stmt.run(index, photoId, albumId);
    });
  });
  transaction();
}

// ─── Settings ────────────────────────────────────────────

export function getSettings(): SiteSettings {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings as unknown as SiteSettings;
}

export function updateSettings(
  data: Partial<SiteSettings>
): SiteSettings {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)"
  );
  const transaction = db.transaction(() => {
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        stmt.run(key, value);
      }
    }
  });
  transaction();
  return getSettings();
}

// ─── Helpers ─────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
