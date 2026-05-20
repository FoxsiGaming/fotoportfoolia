/**
 * Supabase client — used by both public pages and admin panel.
 * Reads config from environment variables (prefixed NEXT_PUBLIC_ so
 * they're available in the browser bundle).
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase env vars. Copy .env.example to .env.local and fill in your project credentials."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
