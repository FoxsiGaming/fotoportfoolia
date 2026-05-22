-- ============================================
-- Migration 001: Loadouts + Smart Photo Renaming
-- Run this in your Supabase SQL Editor AFTER
-- the initial schema (supabase-schema.sql).
-- ============================================


-- ─── 1. Loadouts table ──────────────────────────────────

CREATE TABLE loadouts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  camera_body TEXT DEFAULT '',
  lens        TEXT DEFAULT '',
  settings    TEXT DEFAULT '',      -- e.g. "f/2.8, 1/1000s, ISO 400"
  accessories TEXT DEFAULT '',      -- tripod, filters, flash, etc.
  notes       TEXT DEFAULT '',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update timestamp trigger (reuses the function from initial schema)
CREATE TRIGGER loadouts_updated_at
  BEFORE UPDATE ON loadouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_loadouts_sort ON loadouts(sort_order);


-- ─── 2. Alter photos table ──────────────────────────────

-- Store the user's original upload filename (e.g. "DSC_0042.NEF")
ALTER TABLE photos
  ADD COLUMN original_filename TEXT DEFAULT '';

-- Link each photo to a gear loadout (nullable — not every photo needs one)
ALTER TABLE photos
  ADD COLUMN loadout_id UUID REFERENCES loadouts(id) ON DELETE SET NULL;

CREATE INDEX idx_photos_loadout ON photos(loadout_id);


-- ─── 3. Backfill original_filename for existing photos ──

-- For any photos already in the DB, copy filename → original_filename
-- so the column is never empty for old records.
UPDATE photos
  SET original_filename = filename
  WHERE original_filename = '' OR original_filename IS NULL;


-- ─── 4. PL/pgSQL: find the next available photo number ──
--    Fills gaps — if album has [1, 3, 4], returns 2.
--    If no gaps, returns max + 1.
-- ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_next_photo_number(p_album_id UUID)
RETURNS INTEGER AS $$
DECLARE
  used_numbers INTEGER[];
  next_num     INTEGER;
  i            INTEGER;
BEGIN
  -- Extract the trailing number from each filename in this album.
  -- Filename format: AlbumName_<number>.ext
  -- We grab everything between the last '_' and the '.' before the extension.
  SELECT ARRAY_AGG(
    CAST(
      SUBSTRING(filename FROM '_(\d+)\.[^.]+$')
      AS INTEGER
    )
  )
  INTO used_numbers
  FROM photos
  WHERE album_id = p_album_id
    AND filename ~ '_\d+\.[^.]+$';

  -- No photos yet → start at 1
  IF used_numbers IS NULL OR array_length(used_numbers, 1) IS NULL THEN
    RETURN 1;
  END IF;

  -- Sort the array and find the first gap
  SELECT ARRAY_AGG(n ORDER BY n) INTO used_numbers FROM unnest(used_numbers) AS n;

  FOR i IN 1 .. (used_numbers[array_upper(used_numbers, 1)] + 1) LOOP
    IF NOT (i = ANY(used_numbers)) THEN
      RETURN i;
    END IF;
  END LOOP;

  -- Fallback (shouldn't reach here)
  RETURN array_upper(used_numbers, 1) + 1;
END;
$$ LANGUAGE plpgsql STABLE;


-- ─── 5. PL/pgSQL: generate the smart filename ──────────
--    Given an album name and number, produces e.g. "Portrait_Session_3.jpg"
-- ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_photo_filename(
  p_album_name TEXT,
  p_number     INTEGER,
  p_extension  TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN REPLACE(TRIM(p_album_name), ' ', '_')
    || '_'
    || p_number::TEXT
    || '.'
    || LOWER(p_extension);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ─── 6. RLS policies for loadouts ───────────────────────

ALTER TABLE loadouts ENABLE ROW LEVEL SECURITY;

-- Public can read loadouts (visible on photo detail pages)
CREATE POLICY "Public can read loadouts"
  ON loadouts FOR SELECT
  USING (TRUE);

-- Only authenticated users can manage loadouts
CREATE POLICY "Auth users manage loadouts"
  ON loadouts FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ============================================
-- Done! After running this migration:
--
-- 1. The `loadouts` table is ready for CRUD.
-- 2. Every photo now tracks `original_filename`
--    and an optional `loadout_id`.
-- 3. Call `get_next_photo_number(album_id)` from
--    your upload logic to get the next smart number.
-- 4. Call `generate_photo_filename(album_name, number, ext)`
--    to build the filename string.
-- ============================================
