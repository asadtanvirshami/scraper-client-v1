import { Button, Form, Input } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { useResetPassword } from "../hooks/";

type ResetPasswordValues = {
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

const ResetPasswordForm = () => {
  const intl = useIntl();
  const resetPassMutation = useResetPassword();
  const onFinish = async (values: ResetPasswordValues) => {
    const newValues = {
      ...values,
      email: localStorage.getItem("email") || "asadtanvir20@gmail.com",
    };
    await resetPassMutation.mutateAsync(newValues);
  };

  return (
    <Form<ResetPasswordValues>
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      className="space-y-4"
    >
      {/* OTP */}
      <Form.Item
        label={<span className="text-sm font-medium text-gray-700 dark:text-white/82"><FormattedMessage id="auth.common.verification_code_label" /></span>}
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
          className="!h-13 !rounded-2xl !border-gray-200 !bg-white !px-3 !text-gray-900 placeholder:!text-gray-400 hover:!border-gray-300 focus:!border-gray-400 focus:!shadow-none dark:!border-white/10 dark:!bg-[#1b1b21] dark:!text-white dark:placeholder:!text-white/26 dark:hover:!border-white/18 dark:focus:!border-white/22"
        />
      </Form.Item>

      {/* New Password */}
      <Form.Item
        label={<span className="text-sm font-medium text-gray-700 dark:text-white/82"><FormattedMessage id="auth.reset_password.new_password" /></span>}
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
          className="!h-13 !rounded-2xl !border-gray-200 !bg-white !px-3 !text-gray-900 placeholder:!text-gray-400 hover:!border-gray-300 focus:!border-gray-400 focus:!shadow-none dark:!border-white/10 dark:!bg-[#1b1b21] dark:!text-white dark:placeholder:!text-white/26 dark:hover:!border-white/18 dark:focus:!border-white/22"
        />
      </Form.Item>

      {/* Confirm Password */}
      <Form.Item
        label={<span className="text-sm font-medium text-gray-700 dark:text-white/82"><FormattedMessage id="auth.reset_password.confirm_password" /></span>}
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
          className="!h-13 !rounded-2xl !border-gray-200 !bg-white !px-3 !text-gray-900 placeholder:!text-gray-400 hover:!border-gray-300 focus:!border-gray-400 focus:!shadow-none dark:!border-white/10 dark:!bg-[#1b1b21] dark:!text-white dark:placeholder:!text-white/26 dark:hover:!border-white/18 dark:focus:!border-white/22"
        />
      </Form.Item>

      <div className="pt-2">
        <Button
          loading={resetPassMutation.isPending}
          htmlType="submit"
          block
          className="!h-13 !rounded-2xl !border-0 !bg-[#f2f2f3] !text-[17px] !font-bold !text-[#17171b] shadow-none hover:!bg-white"
        >
          <FormattedMessage id="auth.reset_password.buttonCTA" />
        </Button>
      </div>
    </Form>
  );
};

export default ResetPasswordForm;
