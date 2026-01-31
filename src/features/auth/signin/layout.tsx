"use client"
import AuthCard from "../ui/auth-card";
import OTPForm from "./signin-form";

const SignInLayout = () => {
  return (
    <div>
      <AuthCard title="auth.sign_in.sign_in_with_email" children={<OTPForm />} />
    </div>
  );
};

export default SignInLayout;
