import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars — check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env"
  );
}

// Plain client — Clerk token NAHI bhejta. Sirf un tables ke liye use karo
// jinpe RLS nahi hai ya public policy hai (e.g. profiles).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Clerk-aware client — HAR request pe Clerk session token attach karta hai,
// taaki auth.jwt()->>'sub' wali RLS policies kaam karein.
export function createClerkSupabaseClient(
  getToken: () => Promise<string | null>
): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    accessToken: async () => {
      return (await getToken()) ?? null;
    },
  });
}