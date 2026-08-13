// app/auth/oauth-native-callback.tsx
import { useUser } from "@clerk/expo";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import Colors from "@/constants/colors";

export default function SSOCallback() {
  const { isLoaded, isSignedIn } = useUser();

  // Jab tak Clerk state settle nahi hoti (setActive() resolve hone ka wait),
  // spinner dikhao — kahin navigate mat karo.
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // State settle ho gayi — ab decide karo kahan jaana hai.
  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/" />;
}