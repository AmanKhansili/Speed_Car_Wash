import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { UserProvider } from "@/context/userContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

// Check if running inside Expo Go
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Setup notifications only outside Expo Go (Development / Production builds)
if (!isExpoGo) {
  try {
    const Notifications = require("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (err) {
    console.warn("Notifications setup skipped:", err);
  }
}

export const unstable_settings = {
  anchor: "(tabs)",
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — check your .env file");
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    if (isExpoGo) return;

    try {
      const Notifications = require("expo-notifications");
      const subscription = Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          const data = response?.notification?.request?.content?.data as {
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
    } catch (err) {
      console.warn("Notifications listener error:", err);
    }
  }, [router]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === "dark" ? "#0F172A" : "#FFFFFF",
          },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="booking" />
        <Stack.Screen name="auth" />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </>
  );
}

function UserProviderWithClerk({ children }: { children: React.ReactNode }) {
  const { userId, getToken } = useAuth();

  return (
    <UserProvider userId={userId} getToken={getToken}>
      {children}
    </UserProvider>
  );
}

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
