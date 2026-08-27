import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars — check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function createClerkSupabaseClient(
  getToken: (options?: { skipCache?: boolean }) => Promise<string | null>
): SupabaseClient {
  // Custom fetch: agar response JWT expired/401 ki wajah se fail ho,
  // to ek baar fresh token ke sath automatically retry karo.
  const fetchWithRetry: typeof fetch = async (input, init) => {
    const response = await fetch(input, init);

    if (response.status === 401) {
      const cloned = response.clone();
      let body: any = null;
      try {
        body = await cloned.json();
      } catch {
        // response JSON nahi tha, ignore
      }

      const isExpiredToken =
        body?.message?.toLowerCase().includes("jwt expired") ||
        body?.code === "PGRST301";

      if (isExpiredToken) {
        const freshToken = await getToken({ skipCache: true });

        if (freshToken) {
          const headers = new Headers(init?.headers);
          headers.set("Authorization", `Bearer ${freshToken}`);
          headers.set("apikey", supabaseAnonKey);

          // Fresh token ke sath ek hi baar retry karo
          return fetch(input, { ...init, headers });
        }
      }
    }

    return response;
  };

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    accessToken: async () => {
      return (await getToken()) ?? null; // normal case: cached token (fast)
    },
    global: {
      fetch: fetchWithRetry, // sirf failure pe fresh token retry
    },
  });
}