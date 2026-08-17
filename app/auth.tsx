import React from "react";
import { View, StyleSheet  } from "react-native";
import AuthGate from "@/components/auth/AuthGate";

export default function AuthScreen() {
  return (
    <View style={styles.container}>
      <AuthGate />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Matches the background of AuthGate
  },
});