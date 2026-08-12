import { useState } from "react";
import { useSignIn, useSignUp } from "@clerk/expo";

export function useClerkPhoneAuth() {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const [mode, setMode] = useState<"signIn" | "signUp" | null>(null);

  const sendOtp = async (phone: string) => {
    const { error: createError } = await signIn.create({ identifier: phone });

    if (!createError) {
      const { error: sendError } = await signIn.phoneCode.sendCode();
      if (sendError) {
        throw new Error(sendError.message || "Could not send OTP.");
      }
      setMode("signIn");
      return;
    }

    if (createError.code !== "form_identifier_not_found") {
      throw new Error(createError.message || "Could not send OTP.");
    }

    const { error: signUpCreateError } = await signUp.create({ phoneNumber: phone });
    if (signUpCreateError) {
      throw new Error(signUpCreateError.message || "Could not start sign up.");
    }

    const { error: signUpSendError } = await signUp.verifications.sendPhoneCode();
    if (signUpSendError) {
      throw new Error(signUpSendError.message || "Could not send OTP.");
    }

    setMode("signUp");
  };

  const verifyOtp = async (_phone: string, code: string): Promise<boolean> => {
    if (mode === "signIn") {
      const { error } = await signIn.phoneCode.verifyCode({ code });
      if (error) return false;

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        return !finalizeError;
      }
      return false;
    }

    if (mode === "signUp") {
      const { error } = await signUp.verifications.verifyPhoneCode({ code });
      if (error) return false;

      if (signUp.status === "complete") {
        const { error: finalizeError } = await signUp.finalize();
        return !finalizeError;
      }
      return false;
    }

    throw new Error("Call sendOtp before verifyOtp.");
  };

  return { sendOtp, verifyOtp };
}