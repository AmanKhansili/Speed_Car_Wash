import { createClient, SupabaseClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars — check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env",
  );
}

// 1. Unauthenticated/Public Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// 2. Clerk Authenticated Client (Custom Fetch Wrapper)
export function createClerkSupabaseClient(getToken: () => Promise<string | null>): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: async (url, options = {}) => {
        // Har network call par fresh, unexpired token auto-inject hoga
        const clerkToken = await getToken();

        const headers = new Headers(options?.headers);
        if (clerkToken) {
          headers.set("Authorization", `Bearer ${clerkToken}`);
        }

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
}
