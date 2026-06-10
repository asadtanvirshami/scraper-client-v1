"use client";

import React from "react";
import { Button, Form, Input, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useSignUp } from "../hooks";

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
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        {/* First Name */}
        <Form.Item
          name="first_name"
          label={<span className="text-sm font-medium text-white/82"><FormattedMessage id="auth.common.first_name_label" /></span>}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage id="auth.sign_up.errors.first_name_required" />
              )
            }
          ]}
          className="!mb-0"
        >
          <Input
            placeholder={intl.formatMessage({
              id: "auth.sign_up.placeholders.first_name"
            })}
            className="!h-13 !rounded-2xl !border-white/10 !bg-[#1b1b21] !px-3 !text-white placeholder:!text-white/26 hover:!border-white/18 focus:!border-white/22 focus:!shadow-none"
            autoComplete="given-name"
          />
        </Form.Item>

        {/* Last Name */}
        <Form.Item
          name="last_name"
          label={<span className="text-sm font-medium text-white/82"><FormattedMessage id="auth.common.last_name_label" /></span>}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage id="auth.sign_up.errors.last_name_required" />
              )
            }
          ]}
          className="!mb-0"
        >
          <Input
            placeholder={intl.formatMessage({
              id: "auth.sign_up.placeholders.last_name"
            })}
            className="!h-13 !rounded-2xl !border-white/10 !bg-[#1b1b21] !px-3 !text-white placeholder:!text-white/26 hover:!border-white/18 focus:!border-white/22 focus:!shadow-none"
            autoComplete="family-name"
          />
        </Form.Item>
      </div>

      {/* Email */}
      <Form.Item
        name="email"
        label={<span className="text-sm font-medium text-white/82"><FormattedMessage id="auth.common.email_label" /></span>}
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
          prefix={<MailOutlined className="mr-2 text-white/35" />}
          placeholder={intl.formatMessage({
            id: "auth.sign_up.placeholders.email"
          })}
          className="!h-13 !rounded-2xl !border-white/10 !bg-[#1b1b21] !px-3 !text-white placeholder:!text-white/26 hover:!border-white/18 focus:!border-white/22 focus:!shadow-none"
          autoComplete="email"
        />
      </Form.Item>

      {/* Password */}
      <Form.Item
        name="password"
        label={<span className="text-sm font-medium text-white/82"><FormattedMessage id="auth.common.password_label" /></span>}
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
          prefix={<LockOutlined className="mr-2 text-white/35" />}
          placeholder={intl.formatMessage({
            id: "auth.sign_up.placeholders.password"
          })}
          className="!h-13 !rounded-2xl !border-white/10 !bg-[#1b1b21] !px-3 !text-white placeholder:!text-white/26 hover:!border-white/18 focus:!border-white/22 focus:!shadow-none"
          autoComplete="new-password"
        />
      </Form.Item>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="primary"
          htmlType="submit"
          loading={signupMutation.isPending}
          disabled={signupMutation.isPending}
          block
          className="!h-13 !rounded-2xl !border-0 !text-[17px] !font-bold shadow-none"
        >
          <FormattedMessage id="auth.sign_up.buttonCTA" />
        </Button>
      </div>

      <div className="text-center mt-6">
        <Text className="text-sm text-white/58">
          <FormattedMessage id="auth.sign_up.have_account_prompt" />{" "}
          <Link href="/auth/signin" className="!text-white hover:!text-white/80">
            <FormattedMessage id="auth.common.sign_in_action" />
          </Link>
        </Text>
      </div>
    </Form>
  );
};

export default SignUpForm;
