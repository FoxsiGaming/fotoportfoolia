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
  filename: string;             // Smart-renamed file: AlbumName_1.jpg
  original_filename: string;    // User's original upload name: DSC_0042.jpg
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
  loadout_id: string | null;    // FK → loadouts
  created_at: string;
  // Joined
  album_name?: string;
  album_slug?: string;
  albums?: Album;
  loadout?: Loadout | null;     // Populated when joined
}

/** A saved gear configuration (camera + lens + settings) */
export interface Loadout {
  id: string;
  name: string;                 // e.g. "Wildlife Prime Kit"
  camera_body: string;          // e.g. "Sony A7IV"
  lens: string;                 // e.g. "70-200mm f/2.8 GM"
  settings: string;             // e.g. "f/2.8, 1/1000s, ISO 400"
  accessories: string;          // tripod, filters, flash, etc.
  notes: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  site_title: string;
  site_subtitle: string;
  about_text: string;
  contact_email: string;
  instagram_url: string;
}
