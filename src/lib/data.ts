/**
 * Data access layer — all Supabase queries in one place.
 * These are client-side calls that run in the browser.
 */
import { supabase } from "./supabase";
import type { Album, Photo, SiteSettings } from "./types";

// ─── Albums ──────────────────────────────────────────────

export async function getAllAlbums(): Promise<Album[]> {
  const { data: albums, error } = await supabase
    .from("albums")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error || !albums) return [];

  // Get photo counts and cover photos
  const enriched = await Promise.all(
    albums.map(async (album) => {
      const { count } = await supabase
        .from("photos")
        .select("*", { count: "exact", head: true })
        .eq("album_id", album.id);

      let cover_photo: Photo | null = null;
      if (album.cover_photo_id) {
        const { data } = await supabase
          .from("photos")
          .select("*")
          .eq("id", album.cover_photo_id)
          .single();
        cover_photo = data;
      }
      if (!cover_photo) {
        const { data } = await supabase
          .from("photos")
          .select("*")
          .eq("album_id", album.id)
          .order("sort_order", { ascending: true })
          .limit(1)
          .single();
        cover_photo = data;
      }

      return { ...album, photo_count: count || 0, cover_photo };
    })
  );

  return enriched;
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

export async function createAlbum(
  name: string,
  description = ""
): Promise<Album | null> {
  const slug = slugify(name);

  // Get max sort order
  const { data: maxRow } = await supabase
    .from("albums")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("albums")
    .insert({ name, slug, description, sort_order: sortOrder })
    .select()
    .single();

  if (error) {
    console.error("Error creating album:", error);
    return null;
  }
  return data;
}

export async function updateAlbum(
  id: string,
  updates: Partial<Pick<Album, "name" | "description" | "cover_photo_id">>
): Promise<Album | null> {
  const patch: Record<string, unknown> = { ...updates };
  if (updates.name) {
    patch.slug = slugify(updates.name);
  }

  const { data, error } = await supabase
    .from("albums")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating album:", error);
    return null;
  }
  return data;
}

export async function deleteAlbum(id: string): Promise<boolean> {
  // Photos are cascade-deleted by the FK constraint
  const { error } = await supabase.from("albums").delete().eq("id", id);
  return !error;
}

// ─── Photos ──────────────────────────────────────────────

export async function getPhotosByAlbum(albumId: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true });

  if (error) return [];
  return data || [];
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  const { data, error } = await supabase
    .from("photos")
    .select("*, albums(name, slug)")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  // Flatten the joined album data
  const album = data.albums as unknown as { name: string; slug: string } | null;
  return {
    ...data,
    album_name: album?.name,
    album_slug: album?.slug,
    albums: undefined,
  } as Photo;
}

export async function getFeaturedPhotos(limit = 20): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*, albums(name, slug)")
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) return [];
  return (data || []).map((p) => {
    const album = p.albums as unknown as { name: string; slug: string } | null;
    return { ...p, album_name: album?.name, album_slug: album?.slug };
  }) as Photo[];
}

export async function getAllPhotos(limit = 100): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("*, albums(name, slug)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map((p) => {
    const album = p.albums as unknown as { name: string; slug: string } | null;
    return { ...p, album_name: album?.name, album_slug: album?.slug };
  }) as Photo[];
}

export async function createPhoto(data: {
  album_id: string;
  image_url: string;
  filename: string;
  title?: string;
  width?: number;
  height?: number;
}): Promise<Photo | null> {
  // Get max sort order in album
  const { data: maxRow } = await supabase
    .from("photos")
    .select("sort_order")
    .eq("album_id", data.album_id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data: photo, error } = await supabase
    .from("photos")
    .insert({
      album_id: data.album_id,
      image_url: data.image_url,
      filename: data.filename,
      title: data.title || data.filename.replace(/\.[^.]+$/, ""),
      width: data.width || 0,
      height: data.height || 0,
      sort_order: sortOrder,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating photo:", error);
    return null;
  }
  return photo;
}

export async function updatePhoto(
  id: string,
  updates: Partial<
    Pick<Photo, "title" | "description" | "featured" | "album_id">
  >
): Promise<Photo | null> {
  const { data, error } = await supabase
    .from("photos")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function deletePhoto(id: string): Promise<boolean> {
  // Also delete from storage
  const photo = await getPhotoById(id);
  if (photo?.filename) {
    await supabase.storage.from("photos").remove([photo.filename]);
  }

  const { error } = await supabase.from("photos").delete().eq("id", id);
  return !error;
}

export async function reorderPhotos(
  albumId: string,
  photoIds: string[]
): Promise<boolean> {
  const updates = photoIds.map((id, index) =>
    supabase
      .from("photos")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("album_id", albumId)
  );

  const results = await Promise.all(updates);
  return results.every((r) => !r.error);
}

// ─── Upload ──────────────────────────────────────────────

export async function uploadPhoto(
  file: File,
  albumId: string
): Promise<Photo | null> {
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(filename, file);

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(filename);

  return createPhoto({
    album_id: albumId,
    image_url: publicUrl,
    filename,
    title: file.name.replace(/\.[^.]+$/, ""),
  });
}

// ─── Settings ────────────────────────────────────────────

export async function getSettings(): Promise<SiteSettings> {
  const { data } = await supabase.from("settings").select("key, value");

  const defaults: SiteSettings = {
    site_title: "Portfolio",
    site_subtitle: "Photography",
    about_text: "A passionate photographer capturing moments that matter.",
    contact_email: "",
    instagram_url: "",
  };

  if (!data) return defaults;

  const settings: Record<string, string> = {};
  for (const row of data) {
    settings[row.key] = row.value;
  }

  return { ...defaults, ...settings } as SiteSettings;
}

// ─── Auth ────────────────────────────────────────────────

export async function signIn(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { error: error?.message || null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// ─── Helpers ─────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
