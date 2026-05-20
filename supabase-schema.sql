-- ============================================
-- Photography Portfolio — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Albums table
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  cover_photo_id UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  width INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  exif_camera TEXT DEFAULT '',
  exif_lens TEXT DEFAULT '',
  exif_aperture TEXT DEFAULT '',
  exif_shutter TEXT DEFAULT '',
  exif_iso TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site settings (key-value store)
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('site_title', 'Portfolio'),
  ('site_subtitle', 'Photography'),
  ('about_text', 'A passionate photographer capturing moments that matter.'),
  ('contact_email', ''),
  ('instagram_url', '');

-- Indexes
CREATE INDEX idx_photos_album ON photos(album_id);
CREATE INDEX idx_photos_featured ON photos(featured);
CREATE INDEX idx_albums_slug ON albums(slug);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public can read everything
CREATE POLICY "Public can read albums" ON albums FOR SELECT USING (TRUE);
CREATE POLICY "Public can read photos" ON photos FOR SELECT USING (TRUE);
CREATE POLICY "Public can read settings" ON settings FOR SELECT USING (TRUE);

-- Only authenticated users can write
CREATE POLICY "Auth users manage albums" ON albums FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth users manage photos" ON photos FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth users manage settings" ON settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- Storage Bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Auth users can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users can update photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Auth users can delete photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

-- ============================================
-- Auto-update timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
