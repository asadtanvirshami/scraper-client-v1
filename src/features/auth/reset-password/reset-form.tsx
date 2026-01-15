import { Button, Form, Input } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { useResetPassword } from "../hooks";

type ResetPasswordValues = {
  otp: string;
  newPassword: string;
  confirmPassword: string;
};

const ResetPasswordForm = () => {
  const intl = useIntl();
  const resetPassMutation = useResetPassword();
  const onFinish = async (values: ResetPasswordValues) => {
    const newValues= {
      ...values,
      email: localStorage.getItem("email") || "asadtanvir20@gmail.com"
    };
    await resetPassMutation.mutateAsync(newValues);
  };

  return (
    <Form<ResetPasswordValues>
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      style={{ maxWidth: 420 }}
    >
      {/* OTP */}
      <Form.Item
        label={<FormattedMessage id="auth.reset_password.otp" />}
        name="otp"
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "auth.reset_password.otp_required"
            })
          },
          {
            len: 6,
            message: intl.formatMessage({
              id: "auth.reset_password.otp_length"
            })
          },
          {
            pattern: /^\d+$/,
            message: intl.formatMessage({
              id: "auth.reset_password.otp_numeric"
            })
          }
        ]}
      >
        <Input
          size="large"
          inputMode="numeric"
          maxLength={6}
          placeholder={intl.formatMessage({
            id: "auth.reset_password.otp_placeholder"
          })}
        />
      </Form.Item>

      {/* New Password */}
      <Form.Item
        label={<FormattedMessage id="auth.reset_password.new_password" />}
        name="newPassword"
        hasFeedback
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "auth.reset_password.password_required"
            })
          },
          {
            min: 8,
            message: intl.formatMessage({
              id: "auth.reset_password.password_too_short"
            })
          }
        ]}
      >
        <Input.Password
          size="large"
          placeholder={intl.formatMessage({
            id: "auth.reset_password.new_password_placeholder"
          })}
        />
      </Form.Item>

      {/* Confirm Password */}
      <Form.Item
        label={<FormattedMessage id="auth.reset_password.confirm_password" />}
        name="confirmPassword"
        dependencies={["newPassword"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "auth.reset_password.password_required"
            })
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(
                  intl.formatMessage({
                    id: "auth.reset_password.password_mismatch"
                  })
                )
              );
            }
          })
        ]}
      >
        <Input.Password
          size="large"
          placeholder={intl.formatMessage({
            id: "auth.reset_password.confirm_password_placeholder"
          })}
        />
      </Form.Item>

      <Form.Item style={{ marginTop: 8 }}>
        <Button loading={resetPassMutation.isPending} type="primary" size="large" htmlType="submit" block>
          <FormattedMessage id="auth.reset_password.buttonCTA" />
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ResetPasswordForm;
