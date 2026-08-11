import React from "react";
import { View, StyleSheet } from "react-native";
import MobileOtpVerification from "@/components/auth/Mobileotpverification";
import { router } from "expo-router";

export default function LoginScreen() {
  const handleSendOtp = async (phone: string): Promise<void> => {
    // Mock backend send OTP logic
    console.log("Sending OTP to:", phone);
  };

  const handleVerifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    // Mock backend verify OTP logic
    return otp === "123456";
  };

  return (
    <View style={styles.container}>
      <MobileOtpVerification
        showSkip={true}
        onSkip={() => router.replace("/(tabs)")}
        onVerified={(phone) => {
          // Session save karne ke baad home/tabs par redirect karein
          router.replace("/(tabs)");
        }}
        onSendOtp={handleSendOtp}
        onVerifyOtp={handleVerifyOtp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});