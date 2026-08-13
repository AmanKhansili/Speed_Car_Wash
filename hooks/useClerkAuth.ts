import { useSignIn, useSignUp, useSSO, useUser , useOAuth } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";


WebBrowser.maybeCompleteAuthSession();

export function useClerkAuth() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();

  // ── Google (SSO) ──────────────────────────────────────────
  // Sirf Clerk session activate karta hai. Supabase sync yahan nahi —
  // woh index.tsx me hota hai jab isSignedIn+user dono fully settled ho jaate hain.

const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

const signInWithGoogle = async (): Promise<boolean> => {
  const { createdSessionId, setActive } = await startOAuthFlow({
    redirectUrl: Linking.createURL("oauth-native-callback"),
  });

  if (createdSessionId && setActive) {
    await setActive({ session: createdSessionId });
    return true;
  }
  return false;
};


  // ── Email + Password: Sign In ────────────────────────────
  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) {
      throw new Error(error.message || "Invalid email or password.");
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      return !finalizeError;
    }
    return false;
  };

  // ── Email + Password: Sign Up (starts email verification) ──
  const signUpWithEmail = async (
    email: string,
    password: string,
  ): Promise<boolean> => {
    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) {
      throw new Error(error.message || "Could not sign up.");
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      throw new Error(
        sendError.message || "Could not send verification email.",
      );
    }

    return true; // caller ab "enter the code we emailed you" screen dikhaye
  };

  // ── Verify the email code from sign-up ───────────────────
  const verifyEmailOtp = async (code: string): Promise<boolean> => {
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) return false;

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
