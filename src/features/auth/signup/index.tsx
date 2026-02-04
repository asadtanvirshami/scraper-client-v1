"use client"
import AuthCard from "../ui/auth-card";
import OTPForm from "./signup-form";

const SignUpLayout = () => {
  return (
    <div>
      <AuthCard title="auth.sign_up.sign_up_with_email" children={<OTPForm />} />
    </div>
  );
};

export default SignUpLayout;
