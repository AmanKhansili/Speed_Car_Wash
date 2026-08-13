import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useClerkAuth } from "@/hooks/useClerkAuth";

type Mode = "signIn" | "signUp" | "verifyEmail";

export default function AuthGate() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, verifyEmailOtp } =
    useClerkAuth();

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const goHome = () => router.replace("/(tabs)");

  const handleGoogleAuth = async () => {
    setError(null);
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.log("GOOGLE AUTH ERROR:", err); // catch me bhi log karo
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setError(null);

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === "signUp") {
        await signUpWithEmail(email, password);
        setMode("verifyEmail");
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    setError(null);

    if (code.length < 4) {
      setError("Please enter the code sent to your email.");
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await verifyEmailOtp(code);
      if (!success) {
        setError("Incorrect code. Please try again.");
      }
      // success true hone par bhi goHome() nahi — index.tsx handle karega
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={goHome}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Ionicons
              name="car-sport-outline"
              size={32}
              color={Colors.primary}
            />
          </View>

          {mode === "verifyEmail" ? (
            <>
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                We sent a verification code to {email}
              </Text>

              <TextInput
                style={styles.otpInput}
                placeholder="Enter code"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                autoFocus
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  isSubmitting && styles.primaryBtnDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleVerifyCode}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>
                {mode === "signIn" ? "Welcome Back" : "Create Your Account"}
              </Text>
              <Text style={styles.subtitle}>
                {mode === "signIn"
                  ? "Sign in to book your car wash"
                  : "Sign up to get started"}
              </Text>

              <TouchableOpacity
                style={styles.googleBtn}
                activeOpacity={0.85}
                onPress={handleGoogleAuth}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator size="small" color={Colors.text} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={18} color="#111827" />
                    <Text style={styles.googleBtnText}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  isSubmitting && styles.primaryBtnDisabled,
                ]}
                activeOpacity={0.85}
                onPress={handleEmailAuth}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {mode === "signIn" ? "Sign In" : "Sign Up"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchModeBtn}
                onPress={() => {
                  setMode(mode === "signIn" ? "signUp" : "signIn");
                  setError(null);
                }}
              >
                <Text style={styles.switchModeText}>
                  {mode === "signIn"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <Text style={styles.switchModeLink}>
                    {mode === "signIn" ? "Sign Up" : "Sign In"}
                  </Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginRight: 2,
  },
  content: { flex: 1, justifyContent: "center" },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    alignSelf: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 20,
  },
  googleBtnText: { fontSize: 14.5, fontWeight: "700", color: "#111827" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12.5,
    color: Colors.textSecondary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    marginBottom: 12,
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: "center",
    color: "#111827",
    marginBottom: 12,
  },
  errorText: { color: "#DC2626", fontSize: 12.5, marginBottom: 12 },
  primaryBtn: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  switchModeBtn: { marginTop: 18, alignItems: "center" },
  switchModeText: { fontSize: 13.5, color: Colors.textSecondary },
  switchModeLink: { color: Colors.primary, fontWeight: "700" },
});
