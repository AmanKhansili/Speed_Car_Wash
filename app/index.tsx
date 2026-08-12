import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";
import { View, ActivityIndicator } from "react-native";
import Colors from "@/constants/colors";
import AuthGate from "@/components/auth/AuthGate";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  // Jab tak Clerk state load ho rahi hai, loading spinner dikhayein
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Agar user signed-in hai, toh seedha main tabs par bhej dein
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // Agar signed-out hai, toh naya Google/Email wala AuthGate render karein
  return <AuthGate />;
}