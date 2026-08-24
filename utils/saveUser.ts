import { createClerkSupabaseClient } from "@/utils/supabase";

export const syncUserToSupabase = async (user: any, getToken: any) => {
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
        phone: user.primaryPhoneNumber?.phoneNumber || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_user_id' }
    );

  if (error) {
    console.error("syncUserToSupabase error:", error.message);
  } else {
    console.log("User synced successfully to Supabase!");
  }
};