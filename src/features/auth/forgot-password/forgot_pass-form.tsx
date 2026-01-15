"use client";

import React from "react";
import { Button, Divider, Form, Input, Typography } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import { useForgotPassword } from "../hooks";
import { useRouter } from "next/navigation";

const { Link, Text } = Typography;

const ForgotPassForm: React.FC = () => {
  const forgotPassMutation = useForgotPassword();

  const handleSubmit = (values: { email: string }) => {
    forgotPassMutation.mutateAsync(values);
    forgotPassMutation.isSuccess && localStorage.setItem("email", values.email);
  };

  return (
    <Form
      onFinish={handleSubmit}
      layout="vertical"
      size="large"
      requiredMark={false}
    >
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_up.errors.email_required" />
            ),
          },
          {
            type: "email",
            message: (
              <FormattedMessage id="auth.sign_up.errors.invalid_email_format" />
            ),
          },
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-black/35" />}
          placeholder="xyz@gmail.com"
          className="rounded-xl"
        />
      </Form.Item>

      <div className="-mt-2 mb-4 flex justify-between w-full">
        <Link href="/auth/signup" className="text-[11px] !text-white/50">
          <FormattedMessage id="auth.sign_in.dont_have_account" />
        </Link>
      </div>

      <Form.Item className="!mb-4">
        <Button
          loading={forgotPassMutation.isPending}
          htmlType="submit"
          className="!w-full !h-11 !rounded-xl !border-0 !text-white font-medium
                     !shadow-[0_10px_26px_rgba(0,0,0,0.25)] !font-semibold
                     hover:opacity-95 !bg-yellow-500"
        >
          <FormattedMessage id="auth.forgot_password.buttonCTA" />
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ForgotPassForm;
