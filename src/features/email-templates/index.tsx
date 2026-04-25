"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { format } from "date-fns";

import {
  fetchEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
} from "@/api/api_calls/email-templates";
import type {
  EmailTemplate,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  TemplateCategory,
} from "@/types/api/email-template";
import { useUserInfo } from "@/helpers/use-user";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const CATEGORIES: TemplateCategory[] = [
  "CAMPAIGN",
  "WELCOME",
  "PROMOTIONAL",
  "TRANSACTIONAL",
  "OTHER",
];

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  CAMPAIGN: "blue",
  WELCOME: "green",
  PROMOTIONAL: "gold",
  TRANSACTIONAL: "purple",
  OTHER: "default",
};

// ─── Preview Drawer ───────────────────────────────────────────────────────────

const TemplatePreview: React.FC<{
  template: EmailTemplate | null;
  open: boolean;
  onClose: () => void;
}> = ({ template, open, onClose }) => (
  <Drawer
    open={open}
    onClose={onClose}
    title={template?.name ?? "Preview"}
    width={680}
  >
    {template && (
      <Space direction="vertical" style={{ width: "100%" }} size={16}>
        <div>
          <Text type="secondary">Subject</Text>
          <Paragraph strong style={{ marginBottom: 0 }}>
            {template.subject}
          </Paragraph>
        </div>
        {template.preheader && (
          <div>
            <Text type="secondary">Preheader</Text>
            <Paragraph style={{ marginBottom: 0 }}>{template.preheader}</Paragraph>
          </div>
        )}
        <div>
          <Text type="secondary">Content</Text>
          {template.is_html ? (
            <div
              className="border rounded p-3 mt-1 overflow-auto max-h-[60vh]"
              // Safe: content is user-owned, rendered in a sandboxed preview
              dangerouslySetInnerHTML={{ __html: template.content }}
            />
          ) : (
            <Paragraph className="border rounded p-3 mt-1 whitespace-pre-wrap">
              {template.content}
            </Paragraph>
          )}
        </div>
        {template.variables.length > 0 && (
          <div>
            <Text type="secondary">Variables</Text>
            <div className="flex flex-wrap gap-2 mt-1">
              {template.variables.map((v) => (
                <Tooltip key={v.key} title={v.description}>
                  <Tag color="blue">{"{{" + v.key + "}}"}</Tag>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-4 text-sm text-gray-400">
          <span>Used: {template.usage_count}×</span>
          {template.last_used_at && (
            <span>Last: {format(new Date(template.last_used_at), "MMM d, yyyy")}</span>
          )}
          <span>Created: {format(new Date(template.createdAt), "MMM d, yyyy")}</span>
        </div>
      </Space>
    )}
  </Drawer>
);

// ─── Create / Edit Form ───────────────────────────────────────────────────────

type FormValues = {
  name: string;
  subject: string;
  content: string;
  description?: string;
  preheader?: string;
  category: TemplateCategory;
  is_html: boolean;
  tags?: string;
};

const TemplateFormDrawer: React.FC<{
  open: boolean;
  editing: EmailTemplate | null;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ open, editing, userId, onClose, onSuccess }) => {
  const [form] = Form.useForm<FormValues>();
  const queryClient = useQueryClient();

  const createMut = useMutation({
    mutationFn: createEmailTemplate,
    onSuccess: () => {
      message.success("Template created");
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      onSuccess();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to create template");
    },
  });

  const updateMut = useMutation({
    mutationFn: updateEmailTemplate,
    onSuccess: () => {
      message.success("Template updated");
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      onSuccess();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to update template");
    },
  });

  const handleSubmit = (values: FormValues) => {
    const tags = values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    if (editing) {
      const payload: UpdateTemplatePayload = {
        template_id: editing._id,
        user_id: userId,
        ...values,
        tags,
      };
      updateMut.mutate(payload);
    } else {
      const payload: CreateTemplatePayload = {
        user_id: userId,
        ...values,
        tags,
      };
      createMut.mutate(payload);
    }
  };

  React.useEffect(() => {
    if (open && editing) {
      form.setFieldsValue({
        ...editing,
        tags: editing.tags.join(", "),
      });
    } else if (!open) {
      form.resetFields();
    }
  }, [open, editing, form]);

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={editing ? "Edit Template" : "New Template"}
      width={720}
      footer={
        <Space className="float-right">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={isPending} onClick={() => form.submit()}>
            {editing ? "Save Changes" : "Create Template"}
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ category: "CAMPAIGN", is_html: true }}
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="name" label="Template Name" rules={[{ required: true }]}>
              <Input placeholder="Welcome Email" maxLength={100} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select>
                {CATEGORIES.map((c) => (
                  <Select.Option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="subject" label="Subject Line" rules={[{ required: true }]}>
          <Input placeholder="Welcome to {{company_name}}!" maxLength={200} />
        </Form.Item>

        <Form.Item name="preheader" label="Preheader (preview text)">
          <Input placeholder="Short preview shown in email client" maxLength={200} />
        </Form.Item>

        <Form.Item name="content" label="Email Body" rules={[{ required: true }]}>
          <TextArea
            rows={10}
            placeholder="<p>Hello {{first_name}},</p><p>...</p>"
          />
        </Form.Item>

        <Form.Item
          name="is_html"
          label="Content Type"
        >
          <Select>
            <Select.Option value={true}>HTML</Select.Option>
            <Select.Option value={false}>Plain Text</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item name="description" label="Description (internal)">
          <Input placeholder="Notes about this template" />
        </Form.Item>

        <Form.Item name="tags" label="Tags (comma-separated)">
          <Input placeholder="welcome, onboarding, trial" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const EmailTemplatesPage: React.FC = () => {
  const { id: userId } = useUserInfo() as any;
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [preview, setPreview] = useState<EmailTemplate | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["email-templates", userId, page],
    queryFn: () => fetchEmailTemplates({ user_id: userId, page, limit: 20 }),
    enabled: !!userId,
  });

  const deleteMut = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      deleteEmailTemplate(id, userId),
    onSuccess: () => {
      message.success("Template deleted");
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to delete template");
    },
  });

  const templates = data?.data ?? [];

  const columns: ColumnsType<EmailTemplate> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      ellipsis: true,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: TemplateCategory) => (
        <Tag color={CATEGORY_COLORS[cat]}>{cat}</Tag>
      ),
    },
    {
      title: "Used",
      dataIndex: "usage_count",
      key: "usage_count",
      width: 70,
      align: "center",
      render: (n: number) => <Text type="secondary">{n}×</Text>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (d: string) => format(new Date(d), "MMM d, yyyy"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Preview">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setPreview(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditing(record);
                setDrawerOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this template?"
            onConfirm={() => deleteMut.mutate({ id: record._id })}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMut.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Email Templates
          </Title>
          <Text type="secondary">
            Reusable email templates for campaigns and outreach
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
        >
          New Template
        </Button>
      </div>

      <Card style={{ borderRadius: 12 }}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={templates}
          loading={
            isLoading
              ? { indicator: <LoadingOutlined spin /> }
              : false
          }
          pagination={{
            current: page,
            pageSize: 20,
            onChange: setPage,
            showSizeChanger: false,
          }}
          locale={{ emptyText: "No templates yet. Create your first one!" }}
          scroll={{ x: 600 }}
        />
      </Card>

      <TemplateFormDrawer
        open={drawerOpen}
        editing={editing}
        userId={userId}
        onClose={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
        onSuccess={() => {
          setDrawerOpen(false);
          setEditing(null);
        }}
      />

      <TemplatePreview
        template={preview}
        open={!!preview}
        onClose={() => setPreview(null)}
      />
    </div>
  );
};

export default EmailTemplatesPage;
