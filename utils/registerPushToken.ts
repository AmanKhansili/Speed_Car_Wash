import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { createClerkSupabaseClient } from "@/utils/supabase";

export const registerForPushTokenAsync = async (
  clerkUserId: string,
  getToken: any
): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device, skipping.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted.");
    return null;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    console.error("EAS projectId not found in app.json/app.config — cannot generate push token.");
    return null;
  }

  let token: string | null = null;
  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    token = tokenResponse.data;
  } catch (err) {
    console.error("Error getting Expo push token:", err);
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Save token to Supabase using the same authenticated client pattern
  const clerkSupabase = createClerkSupabaseClient(getToken);

  const { error } = await clerkSupabase
    .from("profiles")
    .update({ push_token: token, updated_at: new Date().toISOString() })
    .eq("clerk_user_id", clerkUserId);

  if (error) {
    console.error("Failed to save push token to Supabase:", error.message);
  } else {
    console.log("Push token saved successfully!");
  }

  return token;
};