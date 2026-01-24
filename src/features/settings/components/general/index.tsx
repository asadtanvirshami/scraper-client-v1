"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Radio,
  Select,
  Space,
  Typography,
} from "antd";
import { useIntl } from "react-intl";

const { Title, Text } = Typography;

type FormValues = {
  timezone: string;
  timeFormat: "24" | "12";
  dateFormat: "DD-MM-YYYY" | "MM-DD-YYYY";
  deactivateBrevoActivity: boolean;
  smsCreditEmailAlert: boolean;
  invoicesByEmail: boolean;
  allowSupportAccess: boolean;
};

const SettingsPreferences: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);

  const timezoneOptions = [
    { value: "GMT+05:00 Karachi", label: "(GMT+05:00) Karachi" },
    { value: "GMT+00:00 UTC", label: "(GMT+00:00) UTC" },
    { value: "GMT+01:00 Madrid", label: "(GMT+01:00) Madrid" },
    { value: "GMT+04:00 Dubai", label: "(GMT+04:00) Dubai" },
  ];

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      // TODO: call your API here
      // await updateSettings(values);

      console.log("Saved settings:", values);
    } finally {
      setSaving(false);
    }
  };

  const onCloseAccount = () => {
    // TODO: open confirmation modal + call API
    console.log("Close account clicked");
  };

  return (
    <div className="w-full">
      {/* Date & Time */}
      <Title level={4} style={{ marginTop: 0 }}>
        {intl.formatMessage({ id: "settings.dateTime.title" })}
      </Title>

      <Form<FormValues>
        form={form}
        layout="vertical"
        initialValues={{
          timezone: "GMT+05:00 Karachi",
          timeFormat: "24",
          dateFormat: "DD-MM-YYYY",
          deactivateBrevoActivity: false,
          smsCreditEmailAlert: false,
          invoicesByEmail: false,
          allowSupportAccess: true,
        }}
      >
        <Form.Item
          label={intl.formatMessage({ id: "settings.dateTime.timezone" })}
          name="timezone"
          rules={[
            {
              required: true,
              message: intl.formatMessage({ id: "settings.errors.required" }),
            },
          ]}
        >
          <Select options={timezoneOptions} style={{ maxWidth: 320 }} />
        </Form.Item>

        <Form.Item
          label={intl.formatMessage({ id: "settings.dateTime.timeFormat" })}
          name="timeFormat"
        >
          <Radio.Group>
            <Radio value="24">
              {intl.formatMessage({ id: "settings.dateTime.twentyFourHours" })}
            </Radio>
            <Radio value="12">
              {intl.formatMessage({ id: "settings.dateTime.twelveHours" })}
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={intl.formatMessage({ id: "settings.dateTime.dateFormat" })}
          name="dateFormat"
        >
          <Radio.Group>
            <Radio value="DD-MM-YYYY">DD-MM-YYYY</Radio>
            <Radio value="MM-DD-YYYY">MM-DD-YYYY</Radio>
          </Radio.Group>
        </Form.Item>

        <Divider />

        {/* Notifications */}
        <Title level={5} style={{ marginBottom: 8 }}>
          {intl.formatMessage({ id: "settings.notifications.title" })}
        </Title>

        <Space orientation="vertical" size={10}>
          <Form.Item
            name="deactivateBrevoActivity"
            valuePropName="checked"
            noStyle
          >
            <Checkbox>
              {intl.formatMessage({
                id: "settings.notifications.deactivateBrevoActivity",
              })}
            </Checkbox>
          </Form.Item>

          {/* <Form.Item name="smsCreditEmailAlert" valuePropName="checked" noStyle>
            <Checkbox>
              {intl.formatMessage({
                id: "settings.notifications.smsCreditEmailAlert",
              })}
            </Checkbox>
          </Form.Item> */}
        </Space>

        <Divider />

        {/* Invoices */}
        <Title level={5} style={{ marginBottom: 8 }}>
          {intl.formatMessage({ id: "settings.invoices.title" })}
        </Title>

        <Form.Item name="invoicesByEmail" valuePropName="checked" noStyle>
          <Checkbox>
            {intl.formatMessage({ id: "settings.invoices.receiveByEmail" })}
          </Checkbox>
        </Form.Item>

        <Divider />

        {/* Account Access */}
        <Title level={5} style={{ marginBottom: 8 }}>
          {intl.formatMessage({ id: "settings.accountAccess.title" })}
        </Title>

        <Form.Item name="allowSupportAccess" valuePropName="checked" noStyle>
          <Checkbox>
            {intl.formatMessage({
              id: "settings.accountAccess.allowSupportAccess",
            })}
          </Checkbox>
        </Form.Item>

        <div style={{ marginTop: 18 }}>
          <Button type="primary" loading={saving} onClick={onSave}>
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
