"use client";
import AuthCard from "../ui/auth-card";
import ForgotPassForm from "./forgot-form";

const ForgotPasswordLayout = () => {
  return (
    <div className="w-full">
      <AuthCard
        title="auth.forgot_password.title"
        subtitle="auth.forgot_password.description"
        children={<ForgotPassForm />}
      />
    </div>
  );
};

export default ForgotPasswordLayout;
