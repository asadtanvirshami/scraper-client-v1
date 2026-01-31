"use client"
import AuthCard from "../ui/auth-card";
import OTPForm from "./otp-form";

const OTPLayout = () => {
  return (
    <div>
      <AuthCard title="auth.otp.title" children={<OTPForm />} />
    </div>
  );
};

export default OTPLayout;
