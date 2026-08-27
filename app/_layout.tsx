import React, { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import * as Notifications from "expo-notifications";

import { /*useUser,*/ UserProvider } from "@/context/userContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

// this for notification testing only while app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const unstable_settings = {
  anchor: "(tabs)",
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — check your .env file",
  );
}

// Internal Navigation Component jo UserContext ko consume karega
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  // const { userData } = useUser();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as {
          bookingId?: string;
          type?: string;
        };

        if (!data?.type) return;

        if (data.type === "status_check" || data.type === "review_request") {
          router.push({
            pathname: "/booking/service-check",
            params: { bookingId: data.bookingId, type: data.type },
          });
        } else if (
          data.type === "booking_reminder_evening" ||
          data.type === "booking_reminder_morning"
        ) {
          router.push("/(tabs)/bookings" as any);
        }
      },
    );

    return () => subscription.remove();
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="booking" />
        <Stack.Screen name="auth" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// Naya wrapper — Clerk se userId nikaal ke UserProvider ko pass karega
function UserProviderWithClerk({ children }: { children: React.ReactNode }) {
  const { userId, getToken } = useAuth();

  return (
    <UserProvider userId={userId} getToken={getToken}>
      {children}
    </UserProvider>
  );
}

// Main Root Layout Provider Wrapper
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <UserProviderWithClerk>
            <RootLayoutNav />
          </UserProviderWithClerk>
        </GestureHandlerRootView>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
