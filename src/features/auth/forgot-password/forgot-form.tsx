"use client";

import React from "react";
import { Button, Form, Input, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useForgotPassword } from "@/features/auth/hooks";
const { Link, Text } = Typography;

const ForgotPassForm: React.FC = () => {
  const intl = useIntl();
  const forgotPassMutation = useForgotPassword();

  const handleSubmit = (values: { email: string }) => {
    const email = values.email.trim().toLowerCase();
    forgotPassMutation.mutateAsync({ email });
  };

  return (
    <Form
      onFinish={handleSubmit}
      layout="vertical"
      size="large"
      requiredMark={false}
      className="space-y-4"
    >
      <Form.Item
        name="email"
        label={<span className="text-sm font-medium text-white/82"><FormattedMessage id="auth.common.email_label" /></span>}
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
          prefix={<MailOutlined className="mr-2 text-white/35" />}
          placeholder={intl.formatMessage({ id: "auth.common.enter_email_placeholder" })}
          className="!h-13 !rounded-2xl !border-white/10 !bg-[#1b1b21] !px-3 !text-white placeholder:!text-white/26 hover:!border-white/18 focus:!border-white/22 focus:!shadow-none"
        />
      </Form.Item>

      <div className="pt-2">
        <Button
          type="primary"
          loading={forgotPassMutation.isPending}
          htmlType="submit"
          block
          className="!h-13 !rounded-2xl !border-0 !text-[17px] !font-bold shadow-none"
        >
          <FormattedMessage id="auth.forgot_password.buttonCTA" />
        </Button>
      </div>

      <div className="text-center mt-6">
        <Text className="text-sm text-white/58">
          <FormattedMessage id="auth.forgot_password.remember_password_prompt" />{" "}
          <Link href="/auth/signin" className="!text-white hover:!text-white/80">
            <FormattedMessage id="auth.common.sign_in_action" />
          </Link>
        </Text>
      </div>
    </Form>
  );
};

export default ForgotPassForm;
