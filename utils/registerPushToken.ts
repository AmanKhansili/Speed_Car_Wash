import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { createClerkSupabaseClient } from "@/utils/supabase";

// Expo Go detection
const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === "expo";

export const registerForPushTokenAsync = async (
  clerkUserId: string,
  getToken: any
): Promise<string | null> => {
  // Gracefully skip in Expo Go because SDK 53 removed remote notifications from Expo Go on Android
  if (isExpoGo) {
    console.log(
      "ℹ️ [PushNotifications] Skipped in Expo Go. Remote push notifications on Android require a Development Build (EAS Build)."
    );
    return null;
  }

  if (!Device.isDevice) {
    console.log("Push notifications require a physical device, skipping.");
    return null;
  }

  // Dynamically require expo-notifications only in non-Expo Go environments (Development/Production builds)
  let Notifications: any;
  try {
    Notifications = require("expo-notifications");
  } catch (err) {
    console.warn("Could not load expo-notifications module:", err);
    return null;
  }

  try {
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

    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    // Save token to Supabase using authenticated client
    const clerkSupabase = createClerkSupabaseClient(getToken);

    const { error } = await clerkSupabase
      .from("profiles")
      .update({ push_token: token, updated_at: new Date().toISOString() })
      .eq("clerk_user_id", clerkUserId);

    if (error) {
      console.error("Failed to save push token to Supabase:", error.message);
    } else {
      console.log("Push token saved successfully to Supabase!");
    }

    return token;
  } catch (err) {
    console.error("Error registering push token:", err);
    return null;
  }
};
