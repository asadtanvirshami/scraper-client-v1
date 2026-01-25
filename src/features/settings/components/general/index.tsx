"use client";

import React, { useEffect } from "react";
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Modal,
  Space,
  Typography,
  message,
} from "antd";
import { useIntl } from "react-intl";
import { useUserInfo } from "@/helpers/use-user";
import { useUpdateProfile } from "../../hooks";
import { logoutUser, updateProfile } from "@/redux/slices/user/user-slice";
import { useDispatch } from "react-redux";
import { persistor } from "@/redux/store";
import { clearAuthCookies } from "@/lib/cookies";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

type FormValues = {
  is_notifications_enabled: boolean;
  is_update_enabled: boolean;
};

const SettingsPreferences: React.FC = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();

  const { is_notifications_enabled, is_update_enabled, id } = useUserInfo();
  const updateProfileMutation = useUpdateProfile();

  // Keep form values in sync with user info (important when redux rehydrates)
  useEffect(() => {
    form.setFieldsValue({
      is_notifications_enabled: Boolean(is_notifications_enabled),
      is_update_enabled: Boolean(is_update_enabled),
    });
  }, [form, is_notifications_enabled, is_update_enabled]);

  const onSave = async () => {
    const userId = id ?? "";
    if (!userId) {
      message.error(
        intl.formatMessage({
          id: "settings.errors.userIdMissing",
          defaultMessage: "User id missing",
        }),
      );
      return;
    }

    try {
      const values = await form.validateFields();

      const payload = {
        _id: userId,
        is_notifications_enabled: Boolean(values.is_notifications_enabled),
        is_update_enabled: Boolean(values.is_update_enabled),
      };

      const res = await updateProfileMutation.mutateAsync(payload);

      const userData = res?.data;
      if (userData) dispatch(updateProfile(userData));

      message.success(
        intl.formatMessage({
          id: "settings.success.saved",
          defaultMessage: "Settings saved",
        }),
      );
    } catch (error: any) {
      console.error("Profile update error:", error);
      message.error(
        intl.formatMessage({
          id: "settings.errors.saveFailed",
          defaultMessage: "Failed to save settings",
        }),
      );
    }
  };

  const onCloseAccount = () => {
    Modal.confirm({
      title: intl.formatMessage({
        id: "settings.closeAccount.confirmTitle",
        defaultMessage: "Close account?",
      }),
      content: intl.formatMessage({
        id: "settings.closeAccount.confirmText",
        defaultMessage:
          "This action is permanent. Are you sure you want to continue?",
      }),
      okText: intl.formatMessage({
        id: "settings.closeAccount.confirmOk",
        defaultMessage: "Yes, close it",
      }),
      cancelText: intl.formatMessage({
        id: "settings.closeAccount.confirmCancel",
        defaultMessage: "Cancel",
      }),
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        await updateProfileMutation.mutateAsync(
          {
            _id: id,
            is_deleted: true,
          },
          {
            onSuccess: async () => {
              try {
                // 1️⃣ Clear Redux state
                dispatch(logoutUser());

                // 2️⃣ Purge persisted Redux state
                await persistor.purge();

                // 3️⃣ Clear auth cookies
                clearAuthCookies();

                // 4️⃣ Redirect to sign-in
                router.replace("/auth/signin");
              } catch (error) {
                console.error("Logout failed:", error);
              }
            },
          },
        );

        message.info(
          intl.formatMessage({
            id: "settings.closeAccount.success",
          }),
        );
      },
    });
  };

  return (
    <div className="w-full">
      <Title level={4} style={{ marginTop: 0 }}>
        {intl.formatMessage({ id: "settings.general.title" })}
      </Title>

      <Form<FormValues>
        form={form}
        layout="vertical"
        initialValues={{
          is_notifications_enabled: Boolean(is_notifications_enabled),
          is_update_enabled: Boolean(is_update_enabled),
        }}
      >
        {/* Notifications */}
        <Title level={5} style={{ marginBottom: 8 }}>
          {intl.formatMessage({ id: "settings.notifications.title" })}
        </Title>

        <Space direction="vertical" size={10}>
          <Form.Item
            name="is_notifications_enabled"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Checkbox>
              {intl.formatMessage({
                id: "settings.notifications.toggle",
                defaultMessage: "Enable notifications",
              })}
            </Checkbox>
          </Form.Item>
        </Space>

        <Divider />

        {/* Updates / Invoices */}
        <Title level={5} style={{ marginBottom: 8 }}>
          {intl.formatMessage({ id: "settings.invoices.title" })}
        </Title>

        <Form.Item
          name="is_update_enabled"
          valuePropName="checked"
          style={{ marginBottom: 0 }}
        >
          <Checkbox>
            {intl.formatMessage({
              id: "settings.invoices.receiveByEmail",
            })}
          </Checkbox>
        </Form.Item>

        <div style={{ marginTop: 18 }}>
          <Button
            type="primary"
            loading={updateProfileMutation.isPending}
            disabled={updateProfileMutation.isPending}
            onClick={onSave}
          >
            {intl.formatMessage({ id: "settings.actions.save" })}
          </Button>
        </div>
      </Form>

      <Divider style={{ marginTop: 24 }} />

      {/* Close account */}
      <Title level={5} style={{ marginBottom: 8 }}>
        {intl.formatMessage({ id: "settings.closeAccount.title" })}
      </Title>

      <Space direction="vertical" size={10}>
        <Button danger type="primary" onClick={onCloseAccount}>
          {intl.formatMessage({ id: "settings.closeAccount.button" })}
        </Button>

        <Text type="secondary">
          {intl.formatMessage({ id: "settings.closeAccount.helpText" })}
        </Text>
      </Space>
    </div>
  );
};

export default SettingsPreferences;
