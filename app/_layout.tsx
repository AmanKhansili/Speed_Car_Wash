import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import useUser , { UserProvider } from "@/context/userContext"; 
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

// Internal Navigation Component jo UserContext ko consume karega
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { userData } = useUser();

  // Agar User Data local storage se load ho raha hai (optional guard)
  // Aap context mein 'isLoading' state rakh ke bhi conditional rendering kar sakte ho
  
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="booking" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// Main Root Layout Provider Wrapper
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Dynamic Backend Sync ke liye agar Auth ID ho toh userId prop pass kar sakte ho */}
      <UserProvider>
        <RootLayoutNav />
      </UserProvider>
    </GestureHandlerRootView>
  );
}