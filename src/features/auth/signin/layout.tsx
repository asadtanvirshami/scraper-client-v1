"use client"
import AuthCard from "../ui/auth-card";
import SignInForm from "./signin-form";

const SignInLayout = () => {
  return (
    <div className="w-full">
      <AuthCard 
        title="auth.sign_in.sign_in_with_email" 
        subtitle="auth.sign_in.welcome_back"
        children={<SignInForm />} 
      />
    </div>
  );
};

export default SignInLayout;
