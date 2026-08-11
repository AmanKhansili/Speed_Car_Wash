/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

/**
 * Reusable Mobile Number + OTP verification component.
 *
 * USAGE 1 — As the very first screen (before Home), with Skip allowed:
 * <MobileOtpVerification
 *   showSkip={true}
 *   onSkip={() => router.replace("/home")}
 *   onVerified={(phone) => { saveUser(phone); router.replace("/home"); }}
 *   onSendOtp={(phone) => myBackend.sendOtp(phone)}
 *   onVerifyOtp={(phone, otp) => myBackend.verifyOtp(phone, otp)}
 * />
 *
 * USAGE 2 — Inside some other screen (e.g. checkout), Skip NOT allowed:
 * <MobileOtpVerification
 *   showSkip={false}
 *   onVerified={(phone) => proceedToPayment(phone)}
 *   onSendOtp={(phone) => myBackend.sendOtp(phone)}
 *   onVerifyOtp={(phone, otp) => myBackend.verifyOtp(phone, otp)}
 * />
 *
 * NOTE: onSendOtp / onVerifyOtp are where you plug in Firebase Phone Auth,
 * Supabase signInWithOtp, or your own custom backend call. This component
 * only handles the UI + flow (phone entry -> OTP entry -> resend timer).
 */

interface MobileOtpVerificationProps {
  /** Show a "Skip" button (e.g. true on the first/home gate screen). Default: false */
  showSkip?: boolean;
  /** Called when user taps Skip */
  onSkip?: () => void;
  /** Called with the verified phone number once OTP is correct */
  onVerified: (phone: string) => void;
  /**
   * Plug your backend here (Firebase / Supabase / custom) to actually send the OTP.
   * Should throw an error if sending fails.
   */
  onSendOtp: (phone: string) => Promise<void>;
  /**
   * Plug your backend here to verify the entered OTP.
   * Should return true if verified, false (or throw) if invalid.
   */
  onVerifyOtp: (phone: string, otp: string) => Promise<boolean>;
  /** Country code shown before the number. Default: "+91" */
  countryCode?: string;
  /** Seconds before "Resend OTP" becomes active. Default: 30 */
  resendCooldown?: number;
  /** Heading text on the phone entry step */
  title?: string;
  /** Subtext under the heading */
  subtitle?: string;
}

const OTP_LENGTH = 6;

export default function MobileOtpVerification({
  showSkip = false,
  onSkip,
  onVerified,
  onSendOtp,
  onVerifyOtp,
  countryCode = "+91",
  resendCooldown = 30,
  title = "Verify Your Mobile Number",
  subtitle = "We'll send you a One-Time Password to verify your number",
}: MobileOtpVerificationProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startResendTimer = () => {
    setTimer(resendCooldown);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isValidPhone = (value: string) => /^\d{10}$/.test(value);

  const handleGetOtp = async () => {
    setError(null);

    if (!isValidPhone(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setIsSending(true);
      await onSendOtp(`${countryCode}${phone}`);
      setStep("otp");
      startResendTimer();
      Keyboard.dismiss();
    } catch (err) {
      setError("Could not send OTP. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setError(null);
    try {
      setIsSending(true);
      await onSendOtp(`${countryCode}${phone}`);
      setOtp("");
      startResendTimer();
    } catch (err) {
      setError("Could not resend OTP. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);

    if (otp.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit OTP.`);
      return;
    }

    try {
      setIsVerifying(true);
      const isValid = await onVerifyOtp(`${countryCode}${phone}`, otp);
      if (isValid) {
        onVerified(`${countryCode}${phone}`);
      } else {
        setError("Incorrect OTP. Please try again.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangeNumber = () => {
    setStep("phone");
    setOtp("");
    setError(null);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimer(0);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {showSkip && (
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}

        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Ionicons
              name={step === "phone" ? "call-outline" : "shield-checkmark-outline"}
              size={32}
              color={Colors.primary}
            />
          </View>

          {step === "phone" ? (
            <>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>

              <View style={styles.phoneInputRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={(val) => setPhone(val.replace(/[^0-9]/g, ""))}
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, isSending && styles.primaryBtnDisabled]}
                activeOpacity={0.85}
                onPress={handleGetOtp}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Get OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Enter OTP</Text>
              <Text style={styles.subtitle}>
                Sent to {countryCode} {phone}{" "}
                <Text style={styles.changeNumberLink} onPress={handleChangeNumber}>
                  Change
                </Text>
              </Text>

              <TextInput
                style={styles.otpInput}
                placeholder="- - - - - -"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                value={otp}
                onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, ""))}
                autoFocus
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, isVerifying && styles.primaryBtnDisabled]}
                activeOpacity={0.85}
                onPress={handleVerifyOtp}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResendOtp}
                disabled={timer > 0 || isSending}
              >
                <Text style={[styles.resendText, timer > 0 && styles.resendTextDisabled]}>
                  {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
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
  skipText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary, marginRight: 2 },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#111827", textAlign: "center" },
  subtitle: {
    fontSize: 13.5,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 19,
  },
  changeNumberLink: { color: Colors.primary, fontWeight: "700" },

  phoneInputRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 8,
  },
  countryCodeBox: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#F9FAFB",
  },
  countryCodeText: { fontSize: 15, fontWeight: "600", color: "#111827" },
  phoneInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },

  otpInput: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: "center",
    color: "#111827",
    marginBottom: 8,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 12.5,
    marginBottom: 12,
    alignSelf: "flex-start",
  },

  primaryBtn: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: { color: "#FFF", fontSize: 15, fontWeight: "700" },

  resendBtn: { marginTop: 16, alignItems: "center" },
  resendText: { fontSize: 13.5, fontWeight: "600", color: Colors.primary },
  resendTextDisabled: { color: Colors.textSecondary },
});