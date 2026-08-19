import { supabase } from "@/utils/supabase";

export const syncUserToSupabase = async (user: any) => {
  if (!user) return;

  const fullName =
    user.fullName || `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User";

  const { data, error } = await supabase.from("profiles").upsert(
    {
      clerk_user_id: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      name: fullName,
      avatar_url: user.imageUrl ?? "",
      phone: user.primaryPhoneNumber?.phoneNumber || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" },
  );

  if (error) {
    console.error("syncUserToSupabase error:", error.message);
  } else {
    console.log("User synced successfully to Supabase!");
  }
};
