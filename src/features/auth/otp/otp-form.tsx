"use client";

import React, { useRef, useState } from "react";
import { Button, Form, Input, Typography } from "antd";
import { useOTPResend, useVerifyOtp } from "../hooks/";

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
  const email = localStorage.getItem("email");
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
    index: number
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

  const handleSubmit = () => {
    const code = otp.join("");
    if (code.length === length) {
      verifyMutation.mutate({ email: email, otp: code });
    }
  };

  const handleResendOtp = () => {
    resendOTPMutation.mutate({ email: email });
  };

  const isComplete = otp.every((digit) => digit !== "");

  return (
    <Form onFinish={handleSubmit}>
      <div className="flex justify-center gap-3 mb-4">
        {otp.map((digit, index) => (
          <Input
            key={index}
            value={digit}
            ref={(el) => (inputsRef.current[index] = el)}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            inputMode="numeric"
            maxLength={1}
            autoComplete="one-time-code"
            className="!w-12 !h-12 text-center text-lg font-semibold rounded-xl"
          />
        ))}
      </div>

      <Button
        htmlType="submit"
        disabled={!isComplete}
        loading={loading}
        className="!w-full !h-11 !rounded-xl !bg-yellow-500 !text-white font-semibold"
      >
        Verify OTP
      </Button>

      <div className="mt-3 text-center">
        <Text type="secondary" className="text-xs">
          Enter the 6-digit code sent to your email
        </Text>
      </div>

      <div className="mt-3 text-right">
        <Button
          onClick={handleResendOtp}
          htmlType="button"
          type="text"
          className="text-xs"
        >
          Resend OTP
        </Button>
      </div>
    </Form>
  );
};

export default OTPForm;
