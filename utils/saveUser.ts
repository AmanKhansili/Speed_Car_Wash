import { createClerkSupabaseClient } from "@/utils/supabase";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const syncUserToSupabase = async (
  user: any,
  getToken: any,
  retryCount: number = 0
): Promise<void> => {
  if (!user) return;

  const clerkSupabase = createClerkSupabaseClient(getToken);

  const { data, error } = await clerkSupabase
    .from('profiles')
    .upsert(
      {
        clerk_user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? '',
        name: user.fullName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        avatar_url: user.imageUrl ?? '',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_user_id' }
    );

  if (error) {
    const isJwtTimingError = error.message?.includes('JWT not yet valid');

    if (isJwtTimingError && retryCount < 3) {
      console.warn(`syncUserToSupabase: JWT not ready yet, retrying (${retryCount + 1}/3)...`);
      await delay(800 * (retryCount + 1)); // 800ms, 1600ms, 2400ms — increasing backoff
      return syncUserToSupabase(user, getToken, retryCount + 1);
    }

    console.error("syncUserToSupabase error:", error.message);
  } else {
    console.log("User synced successfully to Supabase!");
  }
};