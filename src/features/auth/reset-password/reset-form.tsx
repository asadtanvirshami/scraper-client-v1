import { Button, Form, Input } from "antd";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FormattedMessage, useIntl } from "react-intl";
import { useResetPassword } from "../hooks/";

type ResetPasswordValues = {
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

const ResetPasswordForm = () => {
  const intl = useIntl();
  const router = useRouter();
  const resetPassMutation = useResetPassword();

  useEffect(() => {
    const email = localStorage.getItem("password_reset_email");
    const isOtpVerified = localStorage.getItem("password_reset_verified") === "true";

    if (!email) {
      router.replace("/auth/forgot-password");
      return;
    }

    if (!isOtpVerified) {
      router.replace("/auth/otp");
    }
  }, [router]);

  const onFinish = async (values: ResetPasswordValues) => {
    const email = localStorage.getItem("password_reset_email");
    if (!email) {
      router.replace("/auth/forgot-password");
      return;
    }

    if (localStorage.getItem("password_reset_verified") !== "true") {
      router.replace("/auth/otp");
      return;
    }

    const newValues = {
      email,
      otp: values.otp.trim(),
      newPassword: values.newPassword,
    };
    await resetPassMutation.mutateAsync(newValues);
  };

  return (
    <Form<ResetPasswordValues>
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      className="space-y-4"
      initialValues={{
        otp: typeof window !== "undefined" ? localStorage.getItem("password_reset_otp") ?? "" : "",
      }}
    >
      <Form.Item
        label={<span className="text-sm font-medium text-white/82"><FormattedMessage id="auth.reset_password.otp" /></span>}
        name="otp"
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "auth.reset_password.otp_required",
            }),
          },
          {
            len: 6,
            message: intl.formatMessage({
              id: "auth.reset_password.otp_length",
            }),
          },
          {
            pattern: /^\d+$/,
            message: intl.formatMessage({
              id: "auth.reset_password.otp_numeric",
            }),
          },
        ]}
      >
        <Input
          size="large"
          inputMode="numeric"
          maxLength={6}
          placeholder={intl.formatMessage({
            id: "auth.reset_password.otp_placeholder",
          })}
          className="!h-13 !rounded-2xl !border-white/10 !bg-[#1b1b21] !px-3 !text-white placeholder:!text-white/26 hover:!border-white/18 focus:!border-white/22 focus:!shadow-none"
        />
      </Form.Item>

      {/* New Password */}
      <Form.Item
        label={<span className="text-sm font-medium text-white/82"><FormattedMessage id="auth.reset_password.new_password" /></span>}
        name="newPassword"
        hasFeedback
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "auth.reset_password.password_required",
            }),
          },
          {
            min: 8,
            message: intl.formatMessage({
              id: "auth.reset_password.password_too_short",
            }),
          },
        ]}
      >
        <Input.Password
          size="large"
          placeholder={intl.formatMessage({
            id: "auth.reset_password.new_password_placeholder",
          })}
          className="!h-13 !rounded-2xl !border-white/10 !bg-[#1b1b21] !px-3 !text-white placeholder:!text-white/26 hover:!border-white/18 focus:!border-white/22 focus:!shadow-none"
        />
      </Form.Item>

      {/* Confirm Password */}
      <Form.Item
        label={<span className="text-sm font-medium text-white/82"><FormattedMessage id="auth.reset_password.confirm_password" /></span>}
        name="confirmPassword"
        dependencies={["newPassword"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "auth.reset_password.password_required",
            }),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(
                  intl.formatMessage({
                    id: "auth.reset_password.password_mismatch",
                  }),
                ),
              );
            },
          }),
        ]}
      >
        <Input.Password
          size="large"
          placeholder={intl.formatMessage({
            id: "auth.reset_password.confirm_password_placeholder",
          })}
          className="!h-13 !rounded-2xl !border-white/10 !bg-[#1b1b21] !px-3 !text-white placeholder:!text-white/26 hover:!border-white/18 focus:!border-white/22 focus:!shadow-none"
        />
      </Form.Item>

      <div className="pt-2">
        <Button
          type="primary"
          loading={resetPassMutation.isPending}
          htmlType="submit"
          block
          className="!h-13 !rounded-2xl !border-0 !text-[17px] !font-bold shadow-none"
        >
          <FormattedMessage id="auth.reset_password.buttonCTA" />
        </Button>
      </div>
    </Form>
  );
};

export default ResetPasswordForm;
