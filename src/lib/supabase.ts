import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// import.meta.env works at build time (Vite inlines it).
// process.env is the fallback for Vercel serverless functions at runtime.
const url = import.meta.env.PUBLIC_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_URL : undefined);
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.PUBLIC_SUPABASE_ANON_KEY : undefined);

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;
