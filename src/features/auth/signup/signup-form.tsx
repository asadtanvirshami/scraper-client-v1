"use client";

import React from "react";
import { Button, Divider, Form, Input, Typography } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useSignUp } from "../hooks/";

const { Link, Text } = Typography;

type SignUpValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
};

const SignUpForm: React.FC = () => {
  const intl = useIntl();
  const signupMutation = useSignUp();

  const handleSubmit = (values: SignUpValues) => {
    signupMutation.mutate(values);
  };

  return (
    <Form<SignUpValues>
      layout="vertical"
      size="large"
      requiredMark={false}
      onFinish={handleSubmit}
    >
      {/* First Name */}
      <Form.Item
        name="first_name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_up.errors.first_name_required" />
            )
          }
        ]}
      >
        <Input
          placeholder={intl.formatMessage({
            id: "auth.sign_up.placeholders.first_name"
          })}
          className="rounded-xl"
          autoComplete="given-name"
        />
      </Form.Item>

      {/* Last Name */}
      <Form.Item
        name="last_name"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_up.errors.last_name_required" />
            )
          }
        ]}
      >
        <Input
          placeholder={intl.formatMessage({
            id: "auth.sign_up.placeholders.last_name"
          })}
          className="rounded-xl"
          autoComplete="family-name"
        />
      </Form.Item>

      {/* Email */}
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_up.errors.email_required" />
            )
          },
          {
            type: "email",
            message: (
              <FormattedMessage id="auth.sign_up.errors.invalid_email_format" />
            )
          }
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-black/35" />}
          placeholder={intl.formatMessage({
            id: "auth.sign_up.placeholders.email"
          })}
          className="rounded-xl"
          autoComplete="email"
        />
      </Form.Item>

      {/* Password */}
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_up.errors.password_required" />
            )
          },
          {
            min: 8,
            message: (
              <FormattedMessage id="auth.sign_up.errors.password_too_short" />
            )
          }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="text-black/35" />}
          placeholder={intl.formatMessage({
            id: "auth.sign_up.placeholders.password"
          })}
          className="rounded-xl"
          autoComplete="new-password"
        />
      </Form.Item>

      {/* Already have account */}
      <div className="-mt-2 mb-4 flex justify-end">
        <Link href="/auth/signin" className="text-[11px] !text-white/50">
          <FormattedMessage id="auth.sign_up.have_account" />
        </Link>
      </div>

      {/* Submit */}
      <Form.Item className="!mb-4">
        <Button
          htmlType="submit"
          loading={signupMutation.isPending}
          disabled={signupMutation.isPending}
          className="!w-full !h-11 !rounded-xl !border-0 !text-white font-medium
                     !shadow-[0_10px_26px_rgba(0,0,0,0.25)]
                     hover:opacity-95 !bg-yellow-500"
        >
          <FormattedMessage id="auth.sign_up.buttonCTA" />
        </Button>
      </Form.Item>

      {/* Divider */}
      <Divider className="!my-3">
        <Text className="text-[12px]">
          <FormattedMessage id="auth.sign_up.strip_line" />
        </Text>
      </Divider>

      {/* Social Sign Up */}
      <div className="flex items-center justify-center gap-4">
        <Button
          type="default"
          shape="circle"
          className="!h-10 !w-10 !rounded-full !bg-white/70 !border-white/60 hover:!bg-white"
          icon={<GoogleOutlined className="text-[18px] text-black/70" />}
          onClick={() => {
            // TODO: Google sign-up flow
          }}
        />
      </div>
    </Form>
  );
};

export default SignUpForm;
