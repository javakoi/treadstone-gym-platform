import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL. Add it in Vercel: Project Settings → Environment Variables"
  );
}
if (!supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it in Vercel: Project Settings → Environment Variables"
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role for admin operations (use in API routes only)
export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel: Project Settings → Environment Variables"
    );
  }
  return createClient(supabaseUrl, serviceKey);
}
