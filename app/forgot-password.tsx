import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useSignIn, useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  // 💡 Type assertion 'as any' use karke TypeScript warnings bypass karo
  const { isLoaded, signIn } = useSignIn() as any;
  const { setActive } = useClerk();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");

  // Step 1: Send OTP Code
  const onRequestReset = async () => {
    if (!isLoaded || !signIn) return;

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setStep("reset");
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Failed to send code");
    }
  };

  // Step 2: Verify OTP & Change Password
  const onResetPassword = async () => {
    if (!isLoaded || !signIn) return;

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        Alert.alert("Success", "Password reset successfully!");
        router.replace("/");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors?.[0]?.message || "Invalid OTP code");
    }
  };

  return (
    <View style={styles.container}>
      {step === "email" ? (
        <>
          <Text style={styles.title}>Forgot Password?</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
          />
          <TouchableOpacity onPress={onRequestReset} style={styles.button}>
            <Text style={styles.btnText}>Send OTP Code</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Enter OTP & New Password</Text>
          <TextInput
            placeholder="OTP Code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            style={styles.input}
          />
          <TextInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
          />
          <TouchableOpacity onPress={onResetPassword} style={styles.button}>
            <Text style={styles.btnText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#DDD", padding: 12, marginVertical: 8, borderRadius: 8 },
  button: { backgroundColor: "#6366F1", padding: 14, borderRadius: 8, marginTop: 12 },
  btnText: { color: "#FFF", textAlign: "center", fontWeight: "bold" },
});