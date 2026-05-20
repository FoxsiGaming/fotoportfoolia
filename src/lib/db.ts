/**
 * Database connection and schema setup using better-sqlite3.
 * SQLite is perfect for a solo photographer portfolio — zero config,
 * file-based, and fast enough for thousands of photos.
 */
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

// Store the database in the project's data/ directory
const DB_PATH = path.join(process.cwd(), "data", "portfolio.db");

// Ensure the data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Singleton connection — reused across requests in dev
let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL"); // Better concurrent read performance
    _db.pragma("foreign_keys = ON");
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      cover_photo_id TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      album_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      title TEXT DEFAULT '',
      description TEXT DEFAULT '',
      width INTEGER DEFAULT 0,
      height INTEGER DEFAULT 0,
      exif_camera TEXT DEFAULT '',
      exif_lens TEXT DEFAULT '',
      exif_focal_length TEXT DEFAULT '',
      exif_aperture TEXT DEFAULT '',
      exif_shutter TEXT DEFAULT '',
      exif_iso TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_photos_album ON photos(album_id);
    CREATE INDEX IF NOT EXISTS idx_photos_featured ON photos(featured);
    CREATE INDEX IF NOT EXISTS idx_albums_slug ON albums(slug);
  `);

  // Insert default admin password if not exists (password: "admin123" — change this!)
  const existing = db
    .prepare("SELECT key FROM settings WHERE key = 'admin_password'")
    .get();
  if (!existing) {
    const hash = bcrypt.hashSync("admin123", 12);
    db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run(
      "admin_password",
      hash
    );
  }

  // Default site settings
  const defaults: Record<string, string> = {
    site_title: "Portfolio",
    site_subtitle: "Photography by Artist",
    about_text:
      "A passionate photographer capturing moments that matter. Based in Tallinn, Estonia.",
    contact_email: "",
    instagram_url: "",
    hero_photo_id: "",
  };

  const insertSetting = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)"
  );
  for (const [key, value] of Object.entries(defaults)) {
    insertSetting.run(key, value);
  }
}
