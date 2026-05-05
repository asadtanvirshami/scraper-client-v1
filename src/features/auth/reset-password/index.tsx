"use client"
import AuthCard from "../ui/auth-card";
import ResetPasswordForm from "./reset-form";

const ResetPasswordLayout = () => {
  return (
    <div className="w-full">
      <AuthCard 
        title="auth.reset_password.title" 
        subtitle="auth.reset_password.description"
        children={<ResetPasswordForm />} 
      />
    </div>
  );
};

export default ResetPasswordLayout;
