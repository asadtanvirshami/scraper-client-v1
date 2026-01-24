import { ForgotPassword, Login, ResendOTP, ResetPassword, VerifyOTP } from "@/api/api_calls/auth";
import { useMutation } from "@tanstack/react-query";
import { Register } from "@/api/api_calls/auth";
import { notification } from "@/lib/notification";
import { getErrorMessage } from "@/extractor/auth";
import { useRouter } from "next/navigation";

export function useVerifyOtp() {
  return useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: async (input: any) => await VerifyOTP(input), // Use async/await to wrap the promise
    onSuccess: (data) => {
      notification.success({
        messageKey: "auth.messages.success.account_verified",
      });
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("Sign-up error:", error);
      notification.error({
        messageKey: errorMessage,
      });
    },
  });
}

export function useSignUp() {
  return useMutation({
    mutationKey: ["sign-up"],
    mutationFn: async (input: any) => await Register(input), // Use async/await to wrap the promise
    onSuccess: (data) => {
      notification.success({
        messageKey: "auth.messages.success.account_created",
      });
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("Sign-up error:", error);
      notification.error({
        messageKey: errorMessage,
      });
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (input: any) => await Login(input),

    onSuccess: (data) => {
      notification.success({
        messageKey: "auth.messages.success.signed_in_successfully",
      })
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("Sign-In error:", error);
      notification.error({
        messageKey: errorMessage,
      });
    },
  });
}

export function useForgotPassword () {
  const router = useRouter();
  return useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: async (input: any) => await ForgotPassword(input),
    onSuccess: (data) => {
      notification.success({
        messageKey: "auth.messages.success.otp_sent",
      })
      router.replace("/auth/reset-password");
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("OTP resend error:", error);
      notification.error({
        messageKey: errorMessage,
      });
    },
  });
}

export function useOTPResend() {
  return useMutation({
    mutationKey: ["otp-resend"],
    mutationFn: async (input: any) => await ResendOTP(input),
    onSuccess: (data) => {
      notification.success({
        messageKey: "auth.messages.success.otp_sent",
      })
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("OTP resend error:", error);
      notification.error({
        messageKey: errorMessage,
      });
    },
  });
}

export function useResetPassword () {
  return useMutation({
    mutationKey: ["reset-password"],
    mutationFn: async (input: any) => await ResetPassword(input),
    onSuccess: (data) => {
      notification.success({
        messageKey: "auth.messages.success.password_reset",
      })
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("OTP resend error:", error);
      notification.error({
        messageKey: errorMessage,
      });
    },
  });
}