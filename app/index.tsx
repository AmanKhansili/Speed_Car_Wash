import { useAuth, useUser } from "@clerk/expo";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import AuthGate from "@/components/auth/AuthGate";
import Colors from "@/constants/colors";
import { registerForPushTokenAsync } from "@/utils/registerPushToken";
import { syncUserToSupabase } from "@/utils/saveUser";

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary || "#2563EB"} />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <AuthGate />;
}
