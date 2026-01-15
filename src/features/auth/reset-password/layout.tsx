"use client"
import AuthCard from "@/components/common/auth-card";
import ResetPasswordForm from "./reset-form";

const ResetPasswordLayout = () => {
  return (
    <div>
      <AuthCard title="auth.reset_password.title" children={<ResetPasswordForm />} />
    </div>
  );
};

export default ResetPasswordLayout;
