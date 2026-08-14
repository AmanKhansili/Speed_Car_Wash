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
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSignIn, useClerk } from "@clerk/expo";
import Colors from "@/constants/colors";
import { useClerkAuth } from "@/hooks/useClerkAuth";

type Mode = "signIn" | "signUp" | "verifyEmail" | "forgotPassword" | "resetPassword";

export default function AuthGate() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, verifyEmailOtp } =
    useClerkAuth();

  // Clerk hooks for password reset
  const { isLoaded, signIn } = useSignIn() as any;
  const { setActive } = useClerk();

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UI state for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const goHome = () => router.replace("/(tabs)");

  // 1️⃣ Google Auth
  const handleGoogleAuth = async () => {
    setError(null);
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.log("GOOGLE AUTH ERROR:", err);
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 2️⃣ Sign In / Sign Up
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

  // 3️⃣ Email OTP Verification (Sign Up)
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
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4️⃣ Request Password Reset Code
  const handleRequestReset = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isLoaded || !signIn) return;

    try {
      setIsSubmitting(true);
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setCode("");
      setMode("resetPassword");
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || "Failed to send reset code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5️⃣ Verify OTP & Set New Password
  const handleResetPassword = async () => {
    setError(null);
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (!isLoaded || !signIn) return;

    try {
      setIsSubmitting(true);
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code.trim(),
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        goHome();
      } else {
        setError("Reset incomplete. Please try again.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || err.message || "Invalid OTP code or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* Top Header Row with Skip Button */}
              <View style={styles.headerRow}>
                <TouchableOpacity
                  style={styles.skipBtn}
                  onPress={goHome}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skipText}>Skip</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Colors.primary || "#5B4DFB"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                {/* Brand Logo Container */}
                <View style={styles.brandContainer}>
                  <View style={styles.iconWrapper}>
                    <Image
                                  source={require("@/assets/images/icon.png")}
                                  style={{ width: 80, height: 80 }}
                                  resizeMode="contain"
                                />
                  </View>
                  <Text style={styles.appName}>SPEED CAR WASH</Text>
                </View>

                {/* 🟢 VIEW 1: Verify Email */}
                {mode === "verifyEmail" ? (
                  <>
                    <Text style={styles.title}>Check Your Email</Text>
                    <Text style={styles.subtitle}>
                      We sent a verification code to{"\n"}
                      <Text style={styles.highlightText}>{email}</Text>
                    </Text>

                    <View
                      style={[
                        styles.inputContainer,
                        focusedField === "code" && styles.inputFocused,
                      ]}
                    >
                      <Ionicons
                        name="keypad-outline"
                        size={20}
                        color="#6B7280"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.otpInput}
                        placeholder="Enter OTP Code"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        value={code}
                        onChangeText={setCode}
                        onFocus={() => setFocusedField("code")}
                        onBlur={() => setFocusedField(null)}
                        autoFocus
                      />
                    </View>

                    {error && (
                      <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    )}

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
                        <Text style={styles.primaryBtnText}>Verify Email</Text>
                      )}
                    </TouchableOpacity>
                  </>
                ) : mode === "forgotPassword" ? (
                  /* 🟢 VIEW 2: Forgot Password - Request OTP */
                  <>
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                      Enter your email to receive a password reset code
                    </Text>

                    <View
                      style={[
                        styles.inputContainer,
                        focusedField === "email" && styles.inputFocused,
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color="#6B7280"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Email address"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>

                    {error && (
                      <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.primaryBtn,
                        isSubmitting && styles.primaryBtnDisabled,
                      ]}
                      activeOpacity={0.85}
                      onPress={handleRequestReset}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.switchModeBtn}
                      onPress={() => {
                        setMode("signIn");
                        setError(null);
                      }}
                    >
                      <Text style={styles.switchModeText}>
                        Remembered password?{" "}
                        <Text style={styles.switchModeLink}>Sign In</Text>
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : mode === "resetPassword" ? (
                  /* 🟢 VIEW 3: Forgot Password - OTP + New Password */
                  <>
                    <Text style={styles.title}>Set New Password</Text>
                    <Text style={styles.subtitle}>
                      Enter the code sent to <Text style={styles.highlightText}>{email}</Text> and your new password
                    </Text>

                    <View
                      style={[
                        styles.inputContainer,
                        focusedField === "code" && styles.inputFocused,
                      ]}
                    >
                      <Ionicons
                        name="keypad-outline"
                        size={20}
                        color="#6B7280"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter OTP Code"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        value={code}
                        onChangeText={setCode}
                        onFocus={() => setFocusedField("code")}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>

                    <View
                      style={[
                        styles.inputContainer,
                        focusedField === "newPassword" && styles.inputFocused,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="#6B7280"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        onFocus={() => setFocusedField("newPassword")}
                        onBlur={() => setFocusedField(null)}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>

                    {error && (
                      <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={[
                        styles.primaryBtn,
                        isSubmitting && styles.primaryBtnDisabled,
                      ]}
                      activeOpacity={0.85}
                      onPress={handleResetPassword}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.primaryBtnText}>Reset Password</Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.switchModeBtn}
                      onPress={() => {
                        setMode("signIn");
                        setError(null);
                      }}
                    >
                      <Text style={styles.switchModeText}>
                        Back to <Text style={styles.switchModeLink}>Sign In</Text>
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  /* 🟢 VIEW 4: Normal Sign In / Sign Up */
                  <>
                    <Text style={styles.title}>
                      {mode === "signIn" ? "Welcome Back" : "Create Account"}
                    </Text>
                    <Text style={styles.subtitle}>
                      {mode === "signIn"
                        ? "Sign in to book your car wash & manage services"
                        : "Sign up to get started with fresh rides"}
                    </Text>

                    <TouchableOpacity
                      style={styles.googleBtn}
                      activeOpacity={0.85}
                      onPress={handleGoogleAuth}
                      disabled={isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <ActivityIndicator size="small" color={Colors.primary || "#5B4DFB"} />
                      ) : (
                        <>
                          <Ionicons name="logo-google" size={18} color="#EA4335" />
                          <Text style={styles.googleBtnText}>
                            Continue with Google
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <View style={styles.dividerRow}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>or continue with email</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    {/* Email Input */}
                    <View
                      style={[
                        styles.inputContainer,
                        focusedField === "email" && styles.inputFocused,
                      ]}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color="#6B7280"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Email address"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>

                    {/* Password Input */}
                    <View
                      style={[
                        styles.inputContainer,
                        focusedField === "password" && styles.inputFocused,
                      ]}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color="#6B7280"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color="#6B7280"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Forgot Password Link */}
                    {mode === "signIn" && (
                      <TouchableOpacity
                        style={styles.forgotPasswordBtn}
                        onPress={() => {
                          setMode("forgotPassword");
                          setError(null);
                        }}
                      >
                        <Text style={styles.forgotPasswordText}>
                          Forgot Password?
                        </Text>
                      </TouchableOpacity>
                    )}

                    {error && (
                      <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    )}

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
                          {mode === "signIn" ? "Sign In" : "Create Account"}
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
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PRIMARY_COLOR = Colors?.primary || "#5B4DFB";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  flex: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  headerRow: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 26,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  skipText: {
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY_COLOR,
    marginRight: 2,
  },
  content: {
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingTop: 38,

  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconWrapper: {
    borderRadius: 34,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  appName: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: PRIMARY_COLOR,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13.5,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 18,
  },
  highlightText: {
    color: "#111827",
    fontWeight: "600",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 13,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  googleBtnText: {
    fontSize: 14.5,
    fontWeight: "600",
    color: "#1F2937",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#FAFAFA",
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 14.5,
    color: "#111827",
  },
  otpInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 16,
    letterSpacing: 4,
    fontWeight: "600",
    color: "#111827",
  },
  eyeIcon: {
    padding: 6,
  },
  forgotPasswordBtn: {
    alignSelf: "flex-end",
    marginTop: -2,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12.5,
    fontWeight: "500",
    flex: 1,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnDisabled: {
    opacity: 0.65,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  switchModeBtn: {
    marginTop: 20,
    alignItems: "center",
  },
  switchModeText: {
    fontSize: 13.5,
    color: "#6B7280",
  },
  switchModeLink: {
    color: PRIMARY_COLOR,
    fontWeight: "700",
  },
});