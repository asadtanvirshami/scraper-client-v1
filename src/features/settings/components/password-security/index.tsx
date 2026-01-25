"use client";

import { Card, Typography, Button, Modal, message } from "antd";
import { useRouter } from "next/navigation";
import { FormattedMessage, useIntl } from "react-intl";
import { useForgotPassword } from "@/features/auth/hooks";
import { useUserInfo } from "@/helpers/use-user";

const { Text, Title } = Typography;

const PasswordSecruityForm = () => {
  const router = useRouter();
  const intl = useIntl();
  const forgotPassMutation = useForgotPassword();
  const { email } = useUserInfo();
  // Replace this with your actual API / mutation
  const handleSendOTPpasswordReset = async () => {
    // Example:
    forgotPassMutation.mutateAsync({email});
    return new Promise((resolve) => setTimeout(resolve, 800));
  };

  const handleConfirm = () => {
    Modal.confirm({
      title: intl.formatMessage({ id: "password_and_security.confirm.title" }),
      content: intl.formatMessage({
        id: "password_and_security.confirm.description",
      }),
      okText: intl.formatMessage({
        id: "password_and_security.confirm.confirmButton",
      }),
      cancelText: intl.formatMessage({
        id: "password_and_security.confirm.cancelButton",
      }),
      centered: true,
      async onOk() {
        try {
          await handleSendOTPpasswordReset();
          router.push("/auth/reset-password");
        } catch (err) {
          message.error("Failed to send OTP. Please try again.");
          throw err; // keeps modal open if needed
        }
      },
    });
  };

  return (
    <Card className="w-full max-w-md">
      <Title level={4}>
        <FormattedMessage id="password_and_security.title" />
      </Title>

      <Text type="secondary">
        <FormattedMessage id="password_and_security.description" />
      </Text>

      <div className="mt-4">
        <Button loading={forgotPassMutation.isPending} disabled={forgotPassMutation.isPending} danger type="primary" onClick={handleConfirm}>
          <FormattedMessage id="password_and_security.resetPassword" />
        </Button>
      </div>
    </Card>
  );
};

export default PasswordSecruityForm;
