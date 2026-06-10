"use client";

import Link from "next/link";
import React, { useRef, useState } from "react";
import { Button, Form, Input, Typography } from "antd";
import { FormattedMessage } from "react-intl";
import { useOTPResend, useVerifyOtp } from "../hooks";
import { useRouter } from "next/navigation";

const { Text } = Typography;

type OTPFormProps = {
  length?: number;
  onSubmit?: (otp: string) => void;
  loading?: boolean;
};

const OTPForm: React.FC<OTPFormProps> = ({
  length = 6,
  onSubmit,
  loading = false,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const verifyMutation = useVerifyOtp();
  const resendOTPMutation = useOTPResend();
  const router = useRouter();
  const otpPurpose =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_otp_purpose")
      : null;
  const email =
    (typeof window !== "undefined"
      ? localStorage.getItem("auth_otp_email")
      : null) ||
    (otpPurpose === "password_reset"
      ? typeof window !== "undefined"
        ? localStorage.getItem("password_reset_email")
        : null
      : typeof window !== "undefined"
        ? localStorage.getItem("email")
        : null);
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .slice(0, length)
      .replace(/\D/g, "")
      .split("");

    if (pasted.length === 0) return;

    const newOtp = [...otp];
    pasted.forEach((char, i) => {
      if (i < length) newOtp[i] = char;
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== length || !email) return;

    const response = await verifyMutation.mutateAsync({ email, otp: code });

    if (otpPurpose === "password_reset" && response?.success) {
      localStorage.setItem("password_reset_email", email);
      localStorage.setItem("password_reset_otp", code);
      localStorage.setItem("password_reset_verified", "true");
      router.replace("/auth/reset-password");
    }
  };

  const handleResendOtp = () => {
    if (!email) return;
    if (otpPurpose === "password_reset") {
      localStorage.removeItem("password_reset_otp");
      localStorage.removeItem("password_reset_verified");
    }
    resendOTPMutation.mutate({ email });
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <Form onFinish={handleSubmit} className="space-y-6">
      <div className="flex justify-center gap-3">
        {otp.map((digit, index) => (
          <Input
            key={index}
            value={digit}
            ref={(el: any) =>
              (inputsRef.current[index] = (el as any) || null)
            }
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            inputMode="numeric"
            maxLength={1}
            autoComplete="one-time-code"
            className="!h-14 !w-12 !rounded-2xl !border-white/10 !bg-[#1b1b21] !text-center !text-xl !font-bold !text-white hover:!border-white/18 focus:!border-white/22 focus:!shadow-none"
          />
        ))}
      </div>

      <div className="pt-2">
        <Button
          type="primary"
          htmlType="submit"
          disabled={!isComplete}
          loading={verifyMutation.isPending}
          block
          className="!h-13 !rounded-2xl !border-0 !text-[17px] !font-bold shadow-none disabled:!bg-white/15 disabled:!text-white/35"
        >
          <FormattedMessage id="auth.otp.verify_button" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4 mt-6">
        <Text className="text-sm text-white/58">
          <FormattedMessage id="auth.otp.didnt_receive_code" />{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            className="cursor-pointer border-none bg-transparent p-0 font-semibold text-white hover:text-white/80"
          >
            <FormattedMessage id="auth.otp.resend_code" />
          </button>
        </Text>

        <Link href="/auth/signin" className="text-xs text-white/45 transition-colors hover:text-white/80">
          <FormattedMessage id="auth.otp.back_to_signin" />
        </Link>
      </div>
    </Form>
  );
};

export default OTPForm;
