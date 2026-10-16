// app/oauth-native-callback.tsx
import Colors from "@/constants/colors";
import { useUser } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SSOCallback() {
  const { isLoaded, isSignedIn } = useUser();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // When Clerk settles and user is signed in, redirect to (tabs)
  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // Only fallback to / if timed out after 6 seconds
  if (timedOut) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      <Text style={styles.text}>Signing in with Google...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  text: {
    marginTop: 14,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});