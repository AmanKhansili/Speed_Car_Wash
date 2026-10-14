import { useAuth, useUser } from "@clerk/expo";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

import AuthGate from "@/components/auth/AuthGate";
import Colors from "@/constants/colors";
import { registerForPushTokenAsync } from "@/utils/registerPushToken";
import { syncUserToSupabase } from "@/utils/saveUser";

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === "expo";

export default function Index() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      syncUserToSupabase(user, getToken).then(() => {
        if (!isExpoGo) {
          registerForPushTokenAsync(user.id, getToken);
        }
      });
    }
  }, [isLoaded, isSignedIn, user, getToken]);

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoWrapper}>
          <Image
            source={require("@/assets/logo/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brandTitle}>SPEED CAR WASH</Text>
        <Text style={styles.brandSubtitle}>Premium Car Care & Detailing</Text>
        <ActivityIndicator
          size="large"
          color={Colors.primary || "#2563EB"}
          style={styles.loader}
        />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <AuthGate />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  logoWrapper: {
    width: 140,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: "#0F172A",
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 32,
  },
  loader: {
    marginTop: 8,
  },
});
