"use client";

import React, { useMemo, useState } from "react";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Popconfirm,
  message,
  Modal,
  Form,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { Email } from "../hooks/queries";

type Props = {
  data?: Email[];
  loading?: boolean;
  showFilters?: boolean;
  pageSize?: number;
  selectedRowKeys?: React.Key[];
  onSelectedRowKeysChange?: (keys: React.Key[]) => void;
  value?: {
    page: number;
    limit: number;
    search: string;
    total: number;
  };
  onCreateEmail?: (params: { email: string }) => Promise<void> | void;
  onEditEmail?: (params: { email_id: string; subject: string; content: string; to: string[] }) => Promise<void> | void;
  onVerifyEmail?: (params: { otp: string; email: string }) => Promise<void> | void;
  onDeleteAll?: (ids: string[]) => Promise<void> | void;
  onFetch?: (filters: any) => void;
};

const EmailTable: React.FC<Props> = ({
  data = [],
  loading = false,
  showFilters = true,
  pageSize = 10,
  selectedRowKeys = [],
  onSelectedRowKeysChange,
  value = { page: 1, limit: 10, search: "", total: 0 },
  onCreateEmail,
  onEditEmail,
  onVerifyEmail,
  onDeleteAll,
  onFetch,
}) => {
  const { Text } = Typography;
  const intl = useIntl();

  const [searchDraft, setSearchDraft] = useState(value.search ?? "");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmail, setEditingEmail] = useState<Email | null>(null);
  const [showOTPField, setShowOTPField] = useState(false);
  const [createdEmail, setCreatedEmail] = useState<string>("");
  const [form] = Form.useForm();

  React.useEffect(() => setSearchDraft(value.search ?? ""), [value.search]);

  const antdFilteredValue = useMemo(() => {
    return {};
  }, []);

  const fetchNow = (next: any) => {
    onFetch?.(next);
  };

  const applySearch = () => {
    const term = (searchDraft || "").trim();
    if ((value.search || "") === term) return;
    fetchNow({ page: 1, search: term });
  };

  const resetAll = () => {
    setSearchDraft("");
    fetchNow({
      page: 1,
      limit: value.limit,
      search: "",
    });
  };

  const openAddModal = () => {
    setEditingEmail(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (showOTPField) {
        // Handle OTP verification
        await onVerifyEmail?.({
          otp: values.otp,
          email: createdEmail,
        });
        // Close modal after successful verification
        setIsModalVisible(false);
        setShowOTPField(false);
        setCreatedEmail("");
        setEditingEmail(null);
        form.resetFields();
      } else {
        // Handle email creation
        await onCreateEmail?.({
          email: values.email,
        });
        // Don't close modal, show OTP field instead
        setCreatedEmail(values.email);
        setShowOTPField(true);
        form.resetFields();
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setShowOTPField(false);
    setCreatedEmail("");
    setEditingEmail(null);
    form.resetFields();
  };

  const columns: ColumnsType<Email> = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (email?: string) => (
        <div title={email} className="font-medium">
          {email || "-"}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "verified",
      key: "verified",
      render: (verified?: boolean) => (
        <Tag color={verified ? "green" : "orange"}>
          {verified ? "VERIFIED" : "PENDING"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date?: string) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
  ];

  const handleChange = (
    pagination: TablePaginationConfig,
    tableFilters: Record<string, FilterValue | null>
  ) => {
    const page = pagination.current ?? 1;
    const limit = pagination.pageSize ?? 10;

    const statusRaw = (tableFilters.status?.[0] as string) ?? "";
    const is_sent = statusRaw === "true" ? true : statusRaw === "false" ? false : undefined;

    fetchNow({ page, limit, is_sent });
  };

  const isDirtySearch = (searchDraft || "").trim() !== (value.search || "");

  return (
    <>
      <Card
        title={<FormattedMessage id="emails.widget.title" defaultMessage="Emails" />}
        extra={
          <Space>
            <Text className="!text-lg !font-semibold">
              <FormattedMessage
                id="emails.widget.total"
                defaultMessage="Total {total}"
                values={{ total: value.total }}
              />
            </Text>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
            >
              <FormattedMessage id="commons.add" defaultMessage="Add" />
            </Button>
          </Space>
        }
      >
        {showFilters && (
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              value={searchDraft}
              placeholder={intl.formatMessage({
                id: "emails.search.placeholder",
                defaultMessage: "Search subject...",
              })}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="sm:max-w-md"
            />

            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={applySearch}
                disabled={loading || !isDirtySearch}
              >
                <FormattedMessage id="commons.search" defaultMessage="Search" />
              </Button>

              <Button onClick={resetAll} icon={<ReloadOutlined />} disabled={loading}>
                <FormattedMessage id="commons.reset" defaultMessage="Reset" />
              </Button>

              {selectedRowKeys.length > 0 && (
                <Popconfirm
                  title={intl.formatMessage(
                    { id: "emails.confirm.delete_selected" },
                    { count: selectedRowKeys.length }
                  )}
                  okText={intl.formatMessage({ id: "commons.delete" })}
                  okButtonProps={{ danger: true }}
                  onConfirm={() => {
                    if (onDeleteAll) {
                      onDeleteAll(selectedRowKeys.map(String));
                    }
                  }}
                  disabled={selectedRowKeys.length === 0}
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    disabled={selectedRowKeys.length === 0}
                  >
                    <FormattedMessage
                      id="commons.delete_selected"
                      defaultMessage="Delete selected"
                    />
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </div>
        )}

        <Table<Email>
          loading={loading}
          rowKey={(r) => r._id}
          rowSelection={{
            selectedRowKeys,
            onChange: onSelectedRowKeysChange,
          }}
          columns={columns}
          dataSource={data}
          onChange={handleChange}
          pagination={{
            current: value.page,
            pageSize: value.limit,
            total: value.total,
            showSizeChanger: true,
          }}
          size="large"
          scroll={{ x: 900 }}
          locale={{
            emptyText: (
              <FormattedMessage id="emails.empty" defaultMessage="No emails yet" />
            ),
          }}
        />
      </Card>

      <Modal
        title={
          showOTPField 
            ? `Verify Email: ${createdEmail}` 
            : "Add Email"
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        destroyOnClose
        maskClosable={false}
        okText={showOTPField ? "Verify" : "Add"}
      >
        <Form form={form} layout="vertical">
          {showOTPField ? (
            <Form.Item
              name="otp"
              label="Enter OTP"
              rules={[
                { required: true, message: 'Please enter OTP' },
                { len: 6, message: 'OTP must be 6 digits' },
                { pattern: /^\d+$/, message: 'OTP must contain only numbers' }
              ]}
            >
              <Input 
                placeholder="Enter 6-digit OTP" 
                maxLength={6}
                style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter email address' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default EmailTable;
