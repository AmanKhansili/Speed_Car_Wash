import { supabase } from "@/utils/supabase";

export const syncUserToSupabase = async (user: any) => {
  if (!user) return;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        clerk_user_id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? '',
        name: user.fullName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        first_name: user.firstName ?? '',
        last_name: user.lastName ?? '',
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