"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useIntl } from "react-intl";
import {
  useFetchSmtpAccounts,
  useCreateSmtpAccount,
  useDeleteSmtpAccount,
  useTestSmtpAccount,
  useUpdateSmtpAccount,
} from "@/features/settings/hooks/smtp";
import type { SmtpAccount } from "@/types/api/smtp";

const { Title, Text } = Typography;

type SmtpFormValues = {
  label?: string;
  sender_name?: string;
  email_address: string;
  username: string;
  password?: string;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  imap_enabled: boolean;
  imap_host?: string;
  imap_port?: number;
  imap_secure: boolean;
  warmup_enabled: boolean;
  messages_per_day: number;
  signature?: string;
  unsubscribe_url?: string;
  active: boolean;
};

const defaultValues: SmtpFormValues = {
  label: "",
  sender_name: "",
  email_address: "",
  username: "",
  password: "",
  smtp_host: "smtp.example.com",
  smtp_port: 465,
  smtp_secure: true,
  imap_enabled: false,
  imap_host: "imap.example.com",
  imap_port: 993,
  imap_secure: true,
  warmup_enabled: false,
  messages_per_day: 25,
  signature: "",
  unsubscribe_url: "",
  active: true,
};

const SmtpSettingsForm: React.FC = () => {
  const intl = useIntl();
  const [form] = Form.useForm<SmtpFormValues>();
  const [selectedAccount, setSelectedAccount] = useState<SmtpAccount | null>(null);

  const { data: accountsResponse, isLoading: isAccountsLoading, refetch } = useFetchSmtpAccounts();
  const accounts = useMemo(() => accountsResponse?.data ?? [], [accountsResponse]);

  const createAccountMutation = useCreateSmtpAccount();
  const updateAccountMutation = useUpdateSmtpAccount();
  const deleteAccountMutation = useDeleteSmtpAccount();
  const testAccountMutation = useTestSmtpAccount();

  useEffect(() => {
    form.setFieldsValue(defaultValues);
  }, [form]);

  const resetForm = () => {
    setSelectedAccount(null);
    form.resetFields();
    form.setFieldsValue(defaultValues);
  };

  const handleEdit = (account: SmtpAccount) => {
    setSelectedAccount(account);
    form.setFieldsValue({
      label: account.label || "",
      sender_name: account.sender_name || "",
      email_address: account.email_address,
      username: account.username,
      password: "",
      smtp_host: account.smtp.host,
      smtp_port: account.smtp.port,
      smtp_secure: account.smtp.secure,
      imap_enabled: account.imap.enabled,
      imap_host: account.imap.host || "",
      imap_port: account.imap.port ?? 993,
      imap_secure: account.imap.secure,
      warmup_enabled: account.settings.warmup_enabled,
      messages_per_day: account.settings.messages_per_day,
      signature: account.settings.signature || "",
      unsubscribe_url: account.settings.unsubscribe_url || "",
      active: account.settings.active,
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        label: values.label || undefined,
        sender_name: values.sender_name || values.label || undefined,
        email_address: values.email_address,
        username: values.username,
        password: values.password || undefined,
        smtp: {
          host: values.smtp_host,
          port: values.smtp_port,
          secure: values.smtp_secure,
        },
        imap: {
          enabled: values.imap_enabled,
          host: values.imap_host || undefined,
          port: values.imap_enabled ? values.imap_port : undefined,
          secure: values.imap_secure,
        },
        settings: {
          enable_inbox: values.imap_enabled,
          warmup_enabled: values.warmup_enabled,
          messages_per_day: values.messages_per_day,
          signature: values.signature || undefined,
          unsubscribe_url: values.unsubscribe_url || undefined,
          is_default: false,
          active: values.active,
        },
      } as const;

      if (selectedAccount) {
        const payloadToSend = { ...payload } as Record<string, any>;
        if (!payloadToSend.password) {
          delete payloadToSend.password;
        }

        await updateAccountMutation.mutateAsync({
          accountId: selectedAccount._id,
          payload: payloadToSend,
        });
        message.success(
          intl.formatMessage({
            id: "settings.smtp.updateSuccess",
            defaultMessage: "SMTP account updated successfully.",
          }),
        );
      } else {
        await createAccountMutation.mutateAsync(payload);
        message.success(
          intl.formatMessage({
            id: "settings.smtp.createSuccess",
            defaultMessage: "SMTP account created successfully.",
          }),
        );
      }

      resetForm();
      refetch();
    } catch (error: any) {
      console.error("SMTP form save error", error);
      message.error(
        intl.formatMessage({
          id: "settings.smtp.saveError",
          defaultMessage: "Unable to save SMTP account. Please check the values and try again.",
        }),
      );
    }
  };

  const handleDelete = async (accountId: string) => {
    try {
      await deleteAccountMutation.mutateAsync(accountId);
      if (selectedAccount?._id === accountId) {
        resetForm();
      }
      message.success(
        intl.formatMessage({
          id: "settings.smtp.deleteSuccess",
          defaultMessage: "SMTP account deleted successfully.",
        }),
      );
    } catch (error) {
      console.error("SMTP delete error", error);
      message.error(
        intl.formatMessage({
          id: "settings.smtp.deleteError",
          defaultMessage: "Failed to delete SMTP account.",
        }),
      );
    }
  };

  const handleTest = async (accountId: string) => {
    try {
      await testAccountMutation.mutateAsync(accountId);
      message.success(
        intl.formatMessage({
          id: "settings.smtp.testSuccess",
          defaultMessage: "SMTP connection test succeeded.",
        }),
      );
    } catch (error) {
      console.error("SMTP test error", error);
      message.error(
        intl.formatMessage({
          id: "settings.smtp.testError",
          defaultMessage: "SMTP connection test failed.",
        }),
      );
    }
  };

  const columns: ColumnsType<SmtpAccount> = [
    {
      title: intl.formatMessage({
        id: "settings.smtp.table.email",
        defaultMessage: "Email",
      }),
      dataIndex: "email_address",
      key: "email_address",
      render: (value, record) => record.label || value,
    },
    {
      title: intl.formatMessage({
        id: "settings.smtp.table.host",
        defaultMessage: "SMTP Host",
      }),
      dataIndex: ["smtp", "host"],
      key: "smtp_host",
    },
    {
      title: intl.formatMessage({
        id: "settings.smtp.table.status",
        defaultMessage: "Status",
      }),
      dataIndex: ["settings", "active"],
      key: "status",
      render: (active: boolean) => {
        const color = active ? "green" : "default";
        return (
          <Tag color={color}>
            {intl.formatMessage({
              id: active ? "settings.smtp.status.active" : "settings.smtp.status.inactive",
              defaultMessage: active ? "Active" : "Inactive",
            })}
          </Tag>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: "settings.smtp.table.verified",
        defaultMessage: "Verified",
      }),
      dataIndex: "is_tested",
      key: "is_tested",
      render: (is_tested: boolean) => (
        <Tag color={is_tested ? "blue" : "orange"}>
          {intl.formatMessage({
            id: is_tested ? "settings.smtp.table.verified" : "settings.smtp.table.needsVerification",
            defaultMessage: is_tested ? "Verified" : "Needs verification",
          })}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({
        id: "settings.smtp.table.dailyLimit",
        defaultMessage: "Daily Limit",
      }),
      dataIndex: ["settings", "messages_per_day"],
      key: "messages_per_day",
      render: (value: number, record) => (
        <Text>{`${record.messages_sent_today} / ${value}`}</Text>
      ),
    },
    {
      title: intl.formatMessage({
        id: "settings.smtp.table.actions",
        defaultMessage: "Actions",
      }),
      key: "actions",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            {intl.formatMessage({ id: "settings.smtp.table.edit", defaultMessage: "Edit" })}
          </Button>
          <Button
            type="link"
            icon={<SendOutlined />}
            onClick={() => handleTest(record._id)}
            loading={testAccountMutation.isPending}
          >
            {intl.formatMessage({ id: "settings.smtp.table.test", defaultMessage: "Test" })}
          </Button>
          <Popconfirm
            title={intl.formatMessage({
              id: "settings.smtp.table.deleteConfirm",
              defaultMessage: "Delete this SMTP account?",
            })}
            onConfirm={() => handleDelete(record._id)}
            okText={intl.formatMessage({ id: "settings.smtp.table.deleteOk", defaultMessage: "Delete" })}
            cancelText={intl.formatMessage({ id: "settings.smtp.table.deleteCancel", defaultMessage: "Cancel" })}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {intl.formatMessage({ id: "settings.smtp.table.delete", defaultMessage: "Delete" })}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Space direction="vertical" size="large" className="w-full">
        <Card bordered={false} className="w-full" bodyStyle={{ padding: 24 }}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Title level={4} style={{ marginBottom: 8 }}>
                {intl.formatMessage({ id: "settings.smtp.title", defaultMessage: "SMTP Accounts" })}
              </Title>
              <Text type="secondary">
                {intl.formatMessage({
                  id: "settings.smtp.description",
                  defaultMessage:
                    "Configure SMTP accounts for transactional and campaign email delivery. Store credentials securely and test connections before using them.",
                })}
              </Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={resetForm}
              disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
            >
              {intl.formatMessage({ id: "settings.smtp.actions.newAccount", defaultMessage: "New SMTP account" })}
            </Button>
          </div>
        </Card>

        <Card title={intl.formatMessage({ id: "settings.smtp.configurationTitle", defaultMessage: "Configuration" })} className="w-full" bodyStyle={{ padding: 24 }}>
          <Form<SmtpFormValues> form={form} layout="vertical" initialValues={defaultValues}>
            <Row gutter={24}>
              <Col xs={24} lg={12}>
                <Space direction="vertical" size={16} className="w-full">
                  <Form.Item
                    label={intl.formatMessage({ id: "settings.smtp.field.label", defaultMessage: "Label" })}
                    name="label"
                  >
                    <Input placeholder={intl.formatMessage({ id: "settings.smtp.field.labelPlaceholder", defaultMessage: "Optional name for this SMTP account" })} allowClear />
                  </Form.Item>

                  <Form.Item
                    label={intl.formatMessage({ id: "settings.smtp.field.senderName", defaultMessage: "Sender name" })}
                    name="sender_name"
                  >
                    <Input placeholder={intl.formatMessage({ id: "settings.smtp.field.senderNamePlaceholder", defaultMessage: "Example: Your Company" })} allowClear />
                  </Form.Item>

                  <Form.Item
                    label={intl.formatMessage({ id: "settings.smtp.field.email", defaultMessage: "Email address" })}
                    name="email_address"
                    rules={[
                      { required: true, message: intl.formatMessage({ id: "settings.smtp.validation.emailRequired", defaultMessage: "Email address is required." }) },
                      { type: "email", message: intl.formatMessage({ id: "settings.smtp.validation.emailInvalid", defaultMessage: "Enter a valid email address." }) },
                    ]}
                  >
                    <Input placeholder="example@yourdomain.com" />
                  </Form.Item>

                  <Form.Item
                    label={intl.formatMessage({ id: "settings.smtp.field.username", defaultMessage: "Username" })}
                    name="username"
                    rules={[
                      { required: true, message: intl.formatMessage({ id: "settings.smtp.validation.usernameRequired", defaultMessage: "SMTP username is required." }) },
                    ]}
                  >
                    <Input placeholder={intl.formatMessage({ id: "settings.smtp.field.usernamePlaceholder", defaultMessage: "Enter SMTP username" })} allowClear />
                  </Form.Item>

                  <Form.Item
                    label={intl.formatMessage({ id: "settings.smtp.field.password", defaultMessage: "Password" })}
                    name="password"
                    rules={[
                      { required: !selectedAccount, message: intl.formatMessage({ id: "settings.smtp.validation.passwordRequired", defaultMessage: "SMTP password is required." }) },
                    ]}
                    help={
                      selectedAccount
                        ? intl.formatMessage({ id: "settings.smtp.help.passwordUpdate", defaultMessage: "Leave blank to keep the current password." })
                        : undefined
                    }
                  >
                    <Input.Password placeholder={intl.formatMessage({ id: "settings.smtp.field.passwordPlaceholder", defaultMessage: "Enter SMTP password" })} />
                  </Form.Item>
                </Space>
              </Col>

              <Col xs={24} lg={12}>
                <Card type="inner" title={intl.formatMessage({ id: "settings.smtp.smtpSettingsTitle", defaultMessage: "SMTP Settings" })} bodyStyle={{ padding: 20 }}>
                  <Space direction="vertical" size={16} className="w-full">
                    <Form.Item
                      label={intl.formatMessage({ id: "settings.smtp.field.smtpHost", defaultMessage: "Host" })}
                      name="smtp_host"
                      rules={[
                        { required: true, message: intl.formatMessage({ id: "settings.smtp.validation.smtpHostRequired", defaultMessage: "SMTP host is required." }) },
                      ]}
                    >
                      <Input placeholder="smtp.example.com" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label={intl.formatMessage({ id: "settings.smtp.field.smtpPort", defaultMessage: "Port" })}
                          name="smtp_port"
                          rules={[
                            { required: true, message: intl.formatMessage({ id: "settings.smtp.validation.smtpPortRequired", defaultMessage: "SMTP port is required." }) },
                          ]}
                        >
                          <InputNumber className="w-full" min={1} max={65535} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="smtp_secure" valuePropName="checked" style={{ marginBottom: 0 }}>
                          <Checkbox>
                            {intl.formatMessage({ id: "settings.smtp.field.smtpSecure", defaultMessage: "Use SSL/TLS" })}
                          </Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Space>
                </Card>

                <Card type="inner" title={intl.formatMessage({ id: "settings.smtp.sectionImapTitle", defaultMessage: "IMAP Settings" })} bodyStyle={{ padding: 20 }} style={{ marginTop: 24 }}>
                  <Space direction="vertical" size={16} className="w-full">
                    <Form.Item name="imap_enabled" valuePropName="checked" style={{ marginBottom: 0 }}>
                      <Checkbox>
                        {intl.formatMessage({ id: "settings.smtp.field.enableInbox", defaultMessage: "Enable Inbox" })}
                      </Checkbox>
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.imap_enabled !== currentValues.imap_enabled}>
                      {({ getFieldValue }) => {
                        const enabled = getFieldValue("imap_enabled");
                        return (
                          <>
                            <Form.Item
                              label={intl.formatMessage({ id: "settings.smtp.field.imapHost", defaultMessage: "IMAP Host" })}
                              name="imap_host"
                            >
                              <Input disabled={!enabled} placeholder="imap.example.com" />
                            </Form.Item>

                            <Row gutter={16}>
                              <Col span={12}>
                                <Form.Item label={intl.formatMessage({ id: "settings.smtp.field.imapPort", defaultMessage: "IMAP Port" })} name="imap_port">
                                  <InputNumber disabled={!enabled} className="w-full" min={1} max={65535} />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Form.Item name="imap_secure" valuePropName="checked" style={{ marginBottom: 0 }}>
                                  <Checkbox disabled={!enabled}>
                                    {intl.formatMessage({ id: "settings.smtp.field.imapSecure", defaultMessage: "Use SSL/TLS" })}
                                  </Checkbox>
                                </Form.Item>
                              </Col>
                            </Row>
                          </>
                        );
                      }}
                    </Form.Item>
                  </Space>
                </Card>

                <Card type="inner" title={intl.formatMessage({ id: "settings.smtp.sectionSettingsTitle", defaultMessage: "Settings" })} bodyStyle={{ padding: 20 }} style={{ marginTop: 24 }}>
                  <Space direction="vertical" size={16} className="w-full">
                    <Form.Item name="warmup_enabled" valuePropName="checked" style={{ marginBottom: 0 }}>
                      <Checkbox>
                        {intl.formatMessage({ id: "settings.smtp.field.warmupEnabled", defaultMessage: "Warmup" })}
                      </Checkbox>
                    </Form.Item>

                    <Form.Item
                      label={intl.formatMessage({ id: "settings.smtp.field.messagesPerDay", defaultMessage: "Messages per day" })}
                      name="messages_per_day"
                    >
                      <InputNumber className="w-full" min={1} max={1000} />
                    </Form.Item>

                    <Form.Item
                      label={intl.formatMessage({ id: "settings.smtp.field.signature", defaultMessage: "Signature" })}
                      name="signature"
                    >
                      <Input.TextArea rows={3} placeholder={intl.formatMessage({ id: "settings.smtp.field.signaturePlaceholder", defaultMessage: "Add email signature" })} />
                    </Form.Item>

                    <Form.Item
                      label={intl.formatMessage({ id: "settings.smtp.field.unsubscribeUrl", defaultMessage: "Unsubscribe URL" })}
                      name="unsubscribe_url"
                    >
                      <Input placeholder="https://example.com/unsubscribe" />
                    </Form.Item>

                    <Form.Item name="active" valuePropName="checked" style={{ marginBottom: 0 }}>
                      <Checkbox>
                        {intl.formatMessage({ id: "settings.smtp.field.active", defaultMessage: "Active" })}
                      </Checkbox>
                    </Form.Item>
                  </Space>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Space wrap>
              <Button
                type="primary"
                onClick={handleSave}
                loading={createAccountMutation.isPending || updateAccountMutation.isPending}
              >
                {selectedAccount
                  ? intl.formatMessage({ id: "settings.smtp.actions.update", defaultMessage: "Update SMTP Account" })
                  : intl.formatMessage({ id: "settings.smtp.actions.create", defaultMessage: "Save SMTP Account" })}
              </Button>
              <Button onClick={resetForm} disabled={createAccountMutation.isPending || updateAccountMutation.isPending} icon={<RollbackOutlined />}>
                {intl.formatMessage({ id: "settings.smtp.actions.reset", defaultMessage: "Reset Form" })}
              </Button>
            </Space>
          </Form>
        </Card>

        <Card title={intl.formatMessage({ id: "settings.smtp.tableTitle", defaultMessage: "Configured SMTP Accounts" })} className="w-full" bodyStyle={{ padding: 24 }}>
          <Table<SmtpAccount>
            rowKey="_id"
            loading={isAccountsLoading}
            columns={columns}
            dataSource={accounts}
            pagination={false}
            locale={{
              emptyText: intl.formatMessage({ id: "settings.smtp.table.empty", defaultMessage: "No SMTP accounts configured yet." }),
            }}
            scroll={{ x: 900 }}
            onRow={(record) => ({
              onClick: () => handleEdit(record),
              style: record._id === selectedAccount?._id ? { backgroundColor: "#f6ffed", cursor: "pointer" } : { cursor: "pointer" },
            })}
          />
        </Card>
      </Space>
    </div>
  );
};

export default SmtpSettingsForm;
