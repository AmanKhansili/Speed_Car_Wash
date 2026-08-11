import MobileOtpVerification from "@/components/auth/Mobileotpverification";
import { router } from "expo-router";
import { Alert } from "react-native";

export default function AuthGate() {
  // Changed return type to Promise<void>
  const handleSendOtp = async (phone: string): Promise<void> => {
    console.log(`[Mock Backend] Sending OTP to ${phone}`);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    Alert.alert("OTP Sent", "Use '123456' as your placeholder OTP.");
  };

  const handleVerifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    console.log(`[Mock Backend] Verifying OTP ${otp} for ${phone}`);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (otp === "123456") {
      return true;
    } else {
      Alert.alert("Invalid OTP", "Please use the placeholder OTP: 123456");
      return false;
    }
  };

  return (
    <MobileOtpVerification
      showSkip={true}
      onSkip={() => router.replace("/(tabs)")}
      onVerified={(phone) => {
        console.log("User verified with phone:", phone);
        router.replace("/(tabs)");
      }}
      onSendOtp={handleSendOtp}
      onVerifyOtp={handleVerifyOtp}
    />
  );
}