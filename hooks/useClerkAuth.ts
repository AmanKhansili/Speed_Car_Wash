import { useState } from "react";
import { useSignIn, useSignUp, useOAuth } from "@clerk/expo";
import * as WebBrowser from "expo-web-browser";

// Warm up the browser for OAuth redirect on Expo
WebBrowser.maybeCompleteAuthSession();

export function useClerkAuth() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        return true;
      }
      return false;
    } catch (err: any) {
      throw new Error(err.message || "Google sign-in failed.");
    }
  };


  const signInWithEmail = async (email: string, password: string): Promise<boolean> => {
    const { error: createError } = await signIn.create({
      identifier: email,
      password,
    });

    if (createError) {
      throw new Error(createError.message || "Invalid email or password.");
    }

    if (signIn.status === "complete") {
      const { error: finalizeError } = await signIn.finalize();
      return !finalizeError;
    }

    return false;
  };

  const signUpWithEmail = async (email: string, password: string): Promise<boolean> => {
    const { error: createError } = await signUp.create({
      emailAddress: email,
      password,
    });

    if (createError) {
      throw new Error(createError.message || "Could not sign up.");
    }

    // Clerk Dashboard settings ke mutabiq email verification OTP bhejta hai
    const { error: sendError } = await signUp.verifications.sendEmailCode();
    if (sendError) {
      throw new Error(sendError.message || "Could not send verification email.");
    }

    return true;
  };


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