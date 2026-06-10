import { ForgotPassword, GoogleSignIn, Login, ResendOTP, ResetPassword, VerifyOTP } from "@/api/api_calls/auth";
import { useMutation } from "@tanstack/react-query";
import { Register } from "@/api/api_calls/auth";
import { message } from "antd";
import { getErrorMessage, getSuccessMessage } from "@/utils/extractor/auth";
import { useRouter } from "next/navigation";
import { useIntl } from "react-intl";

export function useVerifyOtp() {
  const intl = useIntl();

  return useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: async (input: any) => await VerifyOTP(input), // Use async/await to wrap the promise
    onSuccess: (data) => {
      const successKey = getSuccessMessage(data?.message);
      message.success(intl.formatMessage({ id: successKey }));
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("Sign-up error:", error);
      message.error(intl.formatMessage({ id: errorMessage }));
    },
  });
}

export function useSignUp() {
  const router = useRouter();
  const intl = useIntl();

  return useMutation({
    mutationKey: ["sign-up"],
    mutationFn: async (input: any) => await Register(input), // Use async/await to wrap the promise
    onSuccess: (data) => {
      const successKey = getSuccessMessage(data?.message);
      message.success(intl.formatMessage({ id: successKey }));
      router.replace("/auth/signin");
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("Sign-up error:", error);
      message.error(intl.formatMessage({ id: errorMessage }));
    },
  });
}

export function useLogin() {
  const intl = useIntl();

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (input: any) => await Login(input),

    onSuccess: (data) => {
      const successKey = getSuccessMessage(data?.message);
      message.success(intl.formatMessage({ id: successKey }));
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("Sign-In error:", error);
      message.error(intl.formatMessage({ id: errorMessage }));
    },
  });
}

export function useForgotPassword () {
  const router = useRouter();
  const intl = useIntl();

  return useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: async (input: any) => await ForgotPassword(input),
    onSuccess: (data, variables) => {
      const email = String(variables?.email || "").trim().toLowerCase();
      if (email) {
        localStorage.setItem("password_reset_email", email);
        localStorage.setItem("auth_otp_email", email);
        localStorage.setItem("auth_otp_purpose", "password_reset");
      }
      localStorage.removeItem("password_reset_otp");
      localStorage.removeItem("password_reset_verified");
      const successKey = getSuccessMessage(data?.message);
      message.success(intl.formatMessage({ id: successKey }));
      router.replace("/auth/otp");
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("OTP resend error:", error);
      message.error(intl.formatMessage({ id: errorMessage }));
    },
  });
}

export function useOTPResend() {
  const intl = useIntl();

  return useMutation({
    mutationKey: ["otp-resend"],
    mutationFn: async (input: any) => await ResendOTP(input),
    onSuccess: (data) => {
      const successKey = getSuccessMessage(data?.message);
      message.success(intl.formatMessage({ id: successKey }));
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("OTP resend error:", error);
      message.error(intl.formatMessage({ id: errorMessage }));
    },
  });
}

export function useResetPassword () {
  const intl = useIntl();
  const router = useRouter();

  return useMutation({
    mutationKey: ["reset-password"],
    mutationFn: async (input: any) => await ResetPassword(input),
    onSuccess: (data) => {
      localStorage.removeItem("password_reset_email");
      localStorage.removeItem("password_reset_otp");
      localStorage.removeItem("password_reset_verified");
      localStorage.removeItem("auth_otp_email");
      localStorage.removeItem("auth_otp_purpose");
      localStorage.removeItem("email");
      const successKey = getSuccessMessage(data?.message);
      message.success(intl.formatMessage({ id: successKey }));
      router.replace("/auth/signin");
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("OTP resend error:", error);
      message.error(intl.formatMessage({ id: errorMessage }));
    },
  });
}

export function useGoogleSignin () {
  const intl = useIntl();

  return useMutation({
    mutationKey: ["google-signin"],
    mutationFn: async (input: any) => await GoogleSignIn(input), // Use async/await to wrap the promise
    onSuccess: (data) => {
      const successKey = getSuccessMessage(data?.message);
      message.success(intl.formatMessage({ id: successKey }));
      return data;
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error);
      console.error("Sign-up error:", error);
      message.error(intl.formatMessage({ id: errorMessage }));
    },
  });
}
