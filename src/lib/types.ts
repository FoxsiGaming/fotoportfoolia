/** Core data types for the portfolio */

export interface Album {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_photo_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  photo_count?: number;
  cover_photo?: Photo | null;
}

export interface Photo {
  id: string;
  album_id: string;
  filename: string;
  original_name: string;
  title: string;
  description: string;
  width: number;
  height: number;
  exif_camera: string;
  exif_lens: string;
  exif_focal_length: string;
  exif_aperture: string;
  exif_shutter: string;
  exif_iso: string;
  sort_order: number;
  featured: number;
  created_at: string;
  album_name?: string;
  album_slug?: string;
}

export interface SiteSettings {
  site_title: string;
  site_subtitle: string;
  about_text: string;
  contact_email: string;
  instagram_url: string;
  hero_photo_id: string;
}
