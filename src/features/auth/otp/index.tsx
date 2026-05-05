"use client"
import AuthCard from "../ui/auth-card";
import OTPForm from "./otp-form";

const OTPLayout = () => {
  return (
    <div className="w-full">
      <AuthCard 
        title="auth.otp.title" 
        subtitle="auth.otp.description"
        children={<OTPForm />} 
      />
    </div>
  );
};

export default OTPLayout;
