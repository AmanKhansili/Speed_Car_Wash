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
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSignIn, useSignUp, useOAuth } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import Colors from "@/constants/colors";

// Warm up the browser for OAuth redirect on Expo
WebBrowser.maybeCompleteAuthSession();

export default function AuthGate() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Google OAuth Handler
  const handleGoogleAuth = async () => {
    setError(null);
    try {
      setLoading(true);
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Email & Password Handler (Sign In / Sign Up / Verification)
  const handleEmailAuth = async () => {
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      if (pendingVerification) {
        const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
        if (verifyError) throw new Error(verifyError.message || "Invalid verification code.");

        if (signUp.status === "complete") {
          await signUp.finalize();
          router.replace("/(tabs)");
        }
        return;
      }

      if (isSignUp) {
        const { error: signUpError } = await signUp.create({
          emailAddress: email,
          password,
        });
        if (signUpError) throw new Error(signUpError.message || "Sign up failed.");

        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) throw new Error(sendError.message || "Could not send verification email.");

        setPendingVerification(true);
      } else {
        const { error: signInError } = await signIn.create({
          identifier: email,
          password,
        });
        if (signInError) throw new Error(signInError.message || "Invalid email or password.");

        if (signIn.status === "complete") {
          await signIn.finalize();
          router.replace("/(tabs)");
        }
      }
      Keyboard.dismiss();
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
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
          onPress={() => router.replace("/(tabs)")}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Ionicons
              name={pendingVerification ? "mail-outline" : "lock-closed-outline"}
              size={32}
              color={Colors.primary}
            />
          </View>

          <Text style={styles.title}>
            {pendingVerification
              ? "Verify Your Email"
              : isSignUp
              ? "Create Account"
              : "Welcome Back"}
          </Text>
          <Text style={styles.subtitle}>
            {pendingVerification
              ? `Enter the verification code sent to ${email}`
              : "Sign in or sign up with Google or Email"}
          </Text>

          {!pendingVerification && (
            <>
              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleAuth}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>
            </>
          )}

          {pendingVerification ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
                autoFocus
              />
              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                onPress={handleEmailAuth}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify Code</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
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
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                onPress={handleEmailAuth}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {isSignUp ? "Sign Up" : "Sign In"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchModeBtn}
                onPress={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
              >
                <Text style={styles.switchModeText}>
                  {isSignUp
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Sign Up"}
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
  container: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 24, paddingTop: 20 },
  skipBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 4 },
  skipText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary, marginRight: 2 },
  content: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%" },
  iconWrapper: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 20, fontWeight: "700", color: "#111827", textAlign: "center" },
  subtitle: { fontSize: 13.5, color: Colors.textSecondary, textAlign: "center", marginTop: 8, marginBottom: 24, lineHeight: 19 },
  googleBtn: { flexDirection: "row", width: "100%", borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF", marginBottom: 16 },
  googleBtnText: { fontSize: 15, fontWeight: "600", color: "#111827" },
  dividerRow: { flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { marginHorizontal: 10, color: Colors.textSecondary, fontSize: 13 },
  input: { width: "100%", borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#111827", marginBottom: 12 },
  errorText: { color: "#DC2626", fontSize: 12.5, marginBottom: 12, width: "100%", textAlign: "left", paddingLeft: 4 },
  primaryBtn: { width: "100%", backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 4 },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },
  switchModeBtn: { marginTop: 16, alignItems: "center" },
  switchModeText: { fontSize: 13.5, fontWeight: "600", color: Colors.primary },
});