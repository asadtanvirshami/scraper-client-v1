"use client"
import AuthCard from "../ui/auth-card";
import SignInForm from "./signin-form";

const SignInLayout = () => {
  return (
    <div>
      <AuthCard title="auth.sign_in.sign_in_with_email" children={<SignInForm />} />
    </div>
  );
};

export default SignInLayout;
