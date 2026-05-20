/** Core data types — matches Supabase table schemas */

export interface Album {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_photo_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined / computed
  photo_count?: number;
  cover_photo?: Photo | null;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  album_id: string;
  image_url: string;
  filename: string;
  title: string;
  description: string;
  width: number;
  height: number;
  exif_camera: string;
  exif_lens: string;
  exif_aperture: string;
  exif_shutter: string;
  exif_iso: string;
  sort_order: number;
  featured: boolean;
  created_at: string;
  // Joined
  album_name?: string;
  album_slug?: string;
  albums?: Album;
}

export interface SiteSettings {
  site_title: string;
  site_subtitle: string;
  about_text: string;
  contact_email: string;
  instagram_url: string;
}
