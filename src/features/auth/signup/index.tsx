"use client"
import AuthCard from "../ui/auth-card";
import OTPForm from "./signup-form";

const SignUpLayout = () => {
  return (
    <div className="w-full">
      <AuthCard 
        title="auth.sign_up.sign_up_with_email" 
        subtitle="auth.sign_up.create_account_description"
        children={<OTPForm />} 
      />
    </div>
  );
};

export default SignUpLayout;
