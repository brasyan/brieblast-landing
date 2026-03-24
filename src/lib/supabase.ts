import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseUrl) console.warn("Missing VITE_SUPABASE_URL environment variable. Auth features will not be available. Check your .env file.");
if (!supabaseAnonKey) console.warn("Missing VITE_SUPABASE_ANON_KEY environment variable. Auth features will not be available. Check your .env file.");

export const supabase = createClient(
  supabaseUrl || "https://unconfigured.supabase.co",
  supabaseAnonKey || "unconfigured-anon-key"
);
