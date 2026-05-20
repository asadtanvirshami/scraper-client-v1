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
        label={<span className="text-sm font-medium text-gray-700 dark:text-white/82"><FormattedMessage id="auth.common.email_label" /></span>}
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
          prefix={<MailOutlined className="mr-2 text-gray-400 dark:text-white/35" />}
          placeholder={intl.formatMessage({ id: "auth.common.enter_email_placeholder" })}
          className="!h-13 !rounded-2xl !border-gray-200 !bg-white !px-3 !text-gray-900 placeholder:!text-gray-400 hover:!border-gray-300 focus:!border-gray-400 focus:!shadow-none dark:!border-white/10 dark:!bg-[#1b1b21] dark:!text-white dark:placeholder:!text-white/26 dark:hover:!border-white/18 dark:focus:!border-white/22"
        />
      </Form.Item>

      <div className="pt-2">
        <Button
          loading={forgotPassMutation.isPending}
          htmlType="submit"
          block
          className="!h-13 !rounded-2xl !border-0 !bg-[#f2f2f3] !text-[17px] !font-bold !text-[#17171b] shadow-none hover:!bg-white"
        >
          <FormattedMessage id="auth.forgot_password.buttonCTA" />
        </Button>
      </div>

      <div className="text-center mt-6">
        <Text className="text-sm text-gray-500 dark:text-white/58">
          <FormattedMessage id="auth.forgot_password.remember_password_prompt" />{" "}
          <Link href="/auth/signin" className="!text-gray-900 hover:!text-gray-700 dark:!text-white dark:hover:!text-white/80">
            <FormattedMessage id="auth.common.sign_in_action" />
          </Link>
        </Text>
      </div>
    </Form>
  );
};

export default ForgotPassForm;
