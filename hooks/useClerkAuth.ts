import { useOAuth, useSignIn, useSignUp } from "@clerk/expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export function useClerkAuth() {
  const { signIn } = useSignIn() as any;
  const { signUp } = useSignUp() as any;

  // ── Google (SSO) ──────────────────────────────────────────
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const redirectUrl = Linking.createURL("oauth-native-callback", {
        scheme: "carwashapp",
      });

      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        return true;
      }
      return false;
    } catch (err: any) {
      console.log("GOOGLE OAUTH ERROR:", err);
      throw err;
    }
  };

  // ── Email + Password: Sign In ────────────────────────────
  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    const trimmedEmail = email.trim();

    if (!signIn) {
      throw new Error("Authentication service is loading. Please try again.");
    }

    const { error } = await signIn.password({
      emailAddress: trimmedEmail,
      password,
    });

    if (error) {
      throw new Error(error.message || "Invalid email or password.");
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        throw new Error(finalizeError.message || "Sign-in failed.");
      }
      return true;
    }
    return false;
  };

  // ── Email + Password: Sign Up ──
  const signUpWithEmail = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    const trimmedEmail = email.trim();

    if (!signUp) {
      throw new Error("Authentication service is loading. Please try again.");
    }

    const { error } = await signUp.password({
      emailAddress: trimmedEmail,
      password,
    });

    if (error) {
      throw new Error(error.message || "Could not sign up.");
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      throw new Error(
        sendError.message || "Could not send verification email.",
      );
    }

    return true;
  };

  // ── Verify Email Code ──
  const verifyEmailOtp = async (code: string): Promise<boolean> => {
    const trimmedCode = code.trim();

    if (!signUp) return false;

    const { error } = await signUp.verifications.verifyEmailCode({
      code: trimmedCode,
    });

    if (error) {
      throw new Error(error.message || "Invalid verification code.");
    }

    if (signUp.status === "complete") {
      const { error: finalizeError } = await signUp.finalize();
      return !finalizeError;
    }
    return false;
  };

  return {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    verifyEmailOtp,
  };
}
