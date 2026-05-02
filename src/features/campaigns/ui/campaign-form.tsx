"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Space,
  message,
  Modal,
  Alert,
  Typography,
  theme,
} from "antd";
import {
  SaveOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  EditOutlined,
  MailOutlined,
  SettingOutlined,
  AimOutlined,
  LineChartOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useIntl } from "react-intl";
import { useCampaignActions } from "../hooks";
import { useUserInfo } from "@/helpers/use-user";
import dayjs, { Dayjs } from "dayjs";
import dynamic from "next/dynamic";
import { useFetchFolders } from "@/features/folders/hooks/queries";
import { useFetchLeadsList } from "@/features/leads/hooks/queries";
import { useFetchSmtpAccounts } from "@/features/settings/hooks/smtp";
import { useQuery } from "@tanstack/react-query";
import { fetchEmailTemplates } from "@/api/api_calls/email-templates";
import type { EmailTemplate } from "@/types/api/email-template";
import { FileTextOutlined } from "@ant-design/icons";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const { Option } = Select;
const { Text } = Typography;

interface CampaignFormProps {
  mode: "create" | "edit" | "view";
  initialData?: any;
  campaignId?: string;
}

interface FormValues {
  name: string;
  subject: string;
  content: string;
  tracking_id?: string;
  status: string;
  campaign_type: string;
  scheduled_at?: Dayjs | null;
  target_leads?: string[];
  target_folders?: string[];
  from_email: string;
  from_name?: string;
  reply_to?: string;
  track_opens: boolean;
  track_clicks: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  mode,
  initialData,
  campaignId,
}) => {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();
  const { id: userId } = useUserInfo();
  const { createCampaign, updateCampaign, sendCampaign, isPending } =
    useCampaignActions();

  const t = (id: string) => formatMessage({ id });

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Schedule modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState<Dayjs | null>(null);
  const [content, setContent] = useState("");

  // Template picker state
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  /* ===============================
     Fetch Folders & Leads
  =============================== */

  const { data: foldersData } = useFetchFolders({
    user_id: userId,
    page: 1,
    limit: 100,
  });

  const { data: leadsData } = useFetchLeadsList({
    user_id: userId ?? "",
    page: 1,
    limit: 100,
  });

  const { data: smtpAccountsData } = useFetchSmtpAccounts();

  const { data: templatesData } = useQuery({
    queryKey: ["email-templates", userId],
    queryFn: () => fetchEmailTemplates({ user_id: userId ?? "", page: 1, limit: 100 }),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Flexibly resolve folders – backend may return { data: [...] } or { folders: [...] }
  const folders = (
    (foldersData as any)?.data?.folders ??
    (foldersData as any)?.folders ??
    (foldersData as any)?.data ??
    []
  ) as any[];
  const leads = (
    (leadsData as any)?.data?.leads ??
    (leadsData as any)?.leads ??
    (leadsData as any)?.data ??
    []
  ) as any[];
  const smtpAccounts = (
    (smtpAccountsData as any)?.data ?? []
  ).filter((a: any) => a?.settings?.active !== false) as any[];
  const emailTemplates: EmailTemplate[] = templatesData?.data || [];

  // Watch campaign type to conditionally show targeting fields
  const campaignType = Form.useWatch("campaign_type", form);
  const selectedFromEmail = Form.useWatch("from_email", form);
  const currentStatus = Form.useWatch("status", form);

  /* ===============================
     Load Initial Data
  =============================== */

  useEffect(() => {
    if (!initialData) return;

    const resolvedData =
      initialData?.data?.data ?? initialData?.data ?? initialData;

    // Extract IDs from target_folders and target_leads if they are objects
    const targetFolderIds =
      resolvedData?.target_folders?.map((folder: any) =>
        typeof folder === "string" ? folder : folder._id || folder.id,
      ) || [];

    const targetLeadIds =
      resolvedData?.target_leads?.map((lead: any) =>
        typeof lead === "string" ? lead : lead._id || lead.id,
      ) || [];

    form.setFieldsValue({
      ...resolvedData,
      track_opens: true,
      track_clicks: true,
      target_folders: targetFolderIds,
      target_leads: targetLeadIds,
      scheduled_at: resolvedData?.scheduled_at
        ? dayjs(resolvedData.scheduled_at)
        : null,
    });

    setContent(resolvedData?.content || "");
    setSelectedTemplateId(
      typeof resolvedData?.template_id === "string"
        ? resolvedData.template_id
        : resolvedData?.template_id?._id || null,
    );
  }, [initialData, form]);

  /* ===============================
     Handle campaign type change
  =============================== */

  useEffect(() => {
    // Clear opposite field when campaign type changes
    if (campaignType === "FOLDER") {
      form.setFieldsValue({ target_leads: undefined });
    } else if (campaignType === "SPECIFIC") {
      form.setFieldsValue({ target_folders: undefined });
    }
  }, [campaignType, form]);

  useEffect(() => {
    form.setFieldValue("reply_to", selectedFromEmail || undefined);
  }, [selectedFromEmail, form]);

  /* ===============================
     Submit Logic
  =============================== */

  const buildPayload = (values: FormValues) => {
    // Resolve the smtp_account_id by matching from_email to the selected account
    const matchedSmtp = smtpAccounts.find(
      (a: any) => a.email_address === values.from_email,
    );
    const smtpAccountId =
      matchedSmtp?._id ?? matchedSmtp?.id ?? null;

    const payload: any = {
      ...values,
      reply_to: values.from_email,
      user_id: userId,
      smtp_account_id: smtpAccountId,
      template_id: selectedTemplateId,
      scheduled_at: values.scheduled_at
        ? values.scheduled_at.toISOString()
        : undefined,
    };

    if (values.campaign_type === "FOLDER") {
      delete payload.target_leads;
    } else if (values.campaign_type === "SPECIFIC") {
      delete payload.target_folders;
    }

    return payload;
  };

  const extractErrorMessage = (err: any): string => {
    return (
      err?.response?.data?.message ||
      err?.message ||
      (isEditMode ? t("campaigns.form.error_update") : t("campaigns.form.error_create"))
    );
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const payload = buildPayload(values);

      if (isEditMode && campaignId) {
        await updateCampaign({ campaign_id: campaignId, ...payload });
      } else {
        await createCampaign(payload);
      }

      message.success(
        isEditMode
          ? t("campaigns.form.success_update")
          : t("campaigns.form.success_create"),
      );

      router.push("/campaigns");
    } catch (err: any) {
      message.error(extractErrorMessage(err), 6);
    }
  };

  const handleSendNow = async () => {
    try {
      const values = await form.validateFields();
      const payload = buildPayload(values);

      if (!userId) {
        message.error(t("campaigns.form.error_create"));
        return;
      }

      if (isEditMode && campaignId) {
        await updateCampaign({
          campaign_id: campaignId,
          ...payload,
          status: "DRAFT",
          scheduled_at: undefined,
        });
        await sendCampaign({ campaign_id: campaignId, user_id: userId });
      } else {
        const createdCampaign = await createCampaign({
          ...payload,
          status: "DRAFT",
          scheduled_at: undefined,
        });

        const createdCampaignId =
          createdCampaign?.data?.data?._id ||
          createdCampaign?.data?._id ||
          createdCampaign?._id ||
          createdCampaign?.campaign_id;

        if (!createdCampaignId) {
          throw new Error("Campaign ID missing from create response");
        }

        await sendCampaign({ campaign_id: createdCampaignId, user_id: userId });
      }

      message.success(t("campaigns.form.send_now"));
      router.push("/campaigns");
    } catch (err: any) {
      message.error(extractErrorMessage(err), 6);
    }
  };

  /* ===============================
     Quill Config
  =============================== */

  /* ===============================
     Apply selected template
  =============================== */

  const applyTemplate = (template: EmailTemplate) => {
    setContent(template.content);
    form.setFieldsValue({
      content: template.content,
      subject: template.subject,
    });
    setSelectedTemplateId(template._id);
    setTemplateModalOpen(false);
    message.success(`Template "${template.name}" applied`);
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  return (
    <div
      style={{ padding: "24px 24px 48px", maxWidth: 1200, margin: "0 auto" }}
    >
      {/* Back Button */}
      <Space style={{ marginBottom: 20 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/campaigns")}
          size="large"
        >
          {t("commons.cancel")}
        </Button>
      </Space>

      {/* Info Alert */}
      {!isViewMode && (
        <Alert
          message={t("campaigns.form.info_alert_title")}
          description={t("campaigns.form.info_alert_description")}
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      {/* SMTP warning */}
      {!isViewMode && smtpAccounts.length === 0 && (
        <Alert
          type="warning"
          showIcon
          message="No active SMTP accounts"
          description={
            <span>
              You need at least one active SMTP account to send campaigns.{" "}
              <a href="/settings?tab=smtp" style={{ fontWeight: 600 }}>
                Set up SMTP →
              </a>
            </span>
          }
          style={{ marginBottom: 16, borderRadius: 8 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "DRAFT",
          campaign_type: "FOLDER",
          track_opens: true,
          track_clicks: true,
        }}
      >
        {/* Basic Information Card */}
        <Card
          title={
            <Space>
              <EditOutlined style={{ color: "#1890ff" }} />
              <span>{t("campaigns.form.basic_info")}</span>
            </Space>
          }
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
            {t("campaigns.form.basic_info_description")}
          </Text>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("campaigns.form.name")}
                name="name"
                rules={[
                  {
                    required: true,
                    message: t("campaigns.form.name_required"),
                  },
                ]}
              >
                <Input
                  size="large"
                  disabled={isViewMode}
                  placeholder={t("campaigns.form.name_placeholder")}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={t("campaigns.form.subject")}
                name="subject"
                rules={[
                  {
                    required: true,
                    message: t("campaigns.form.subject_required"),
                  },
                ]}
              >
                <Input
                  size="large"
                  disabled={isViewMode}
                  placeholder={t("campaigns.form.subject_placeholder")}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Tracking ID - Only show in create mode */}
          {isCreateMode && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label={t("campaigns.form.tracking_id")}
                  name="tracking_id"
                >
                  <Input
                    placeholder={t("campaigns.form.tracking_id_placeholder")}
                    disabled={isViewMode}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Card>

        {/* Content Card */}
        <Card
          title={
            <Space>
              <MailOutlined style={{ color: "#52c41a" }} />
              <span>{t("campaigns.form.content")}</span>
            </Space>
          }
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
            <Text type="secondary">
              {t("campaigns.form.content_description")}
            </Text>
            {!isViewMode && (
              <Button
                icon={<FileTextOutlined />}
                onClick={() => setTemplateModalOpen(true)}
                size="small"
              >
                {selectedTemplateId
                  ? `Template: ${emailTemplates.find((t) => t._id === selectedTemplateId)?.name ?? "Selected"}`
                  : "Select Template"}
              </Button>
            )}
          </div>
          <Form.Item
            name="content"
            rules={[
              { required: true, message: t("campaigns.form.content_required") },
            ]}
          >
            {isViewMode ? (
              <div
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 8,
                  padding: 16,
                  minHeight: 200,
                  backgroundColor: token.colorFillAlter,
                }}
                dangerouslySetInnerHTML={{
                  __html: content || form.getFieldValue("content") || "",
                }}
              />
            ) : (
              <ReactQuill
                theme="snow"
                modules={quillModules}
                style={{ height: 300, backgroundColor: token.colorBgContainer }}
                onChange={(value) => {
                  setContent(value);
                  form.setFieldsValue({ content: value });
                }}
                value={content}
              />
            )}
          </Form.Item>
        </Card>

        {/* Email Configuration Card */}
        <Card
          title={
            <Space>
              <MailOutlined style={{ color: "#722ed1" }} />
              <span>{t("campaigns.form.email_config")}</span>
            </Space>
          }
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
            {t("campaigns.form.email_config_description")}
          </Text>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label={t("campaigns.form.from_email")}
                name="from_email"
                rules={[
                  {
                    required: true,
                    message: t("campaigns.form.from_email_required"),
                  },
                ]}
              >
                <Select
                  placeholder={t("campaigns.form.from_email_placeholder")}
                  disabled={isViewMode}
                  size="large"
                  onChange={(value) => form.setFieldValue("reply_to", value)}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label?.toString() ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  notFoundContent={
                    smtpAccounts.length === 0 ? (
                      <div style={{ padding: "8px", textAlign: "center" }}>
                        <Text type="secondary">
                          No active SMTP accounts. Add one in Settings.
                        </Text>
                      </div>
                    ) : null
                  }
                  options={smtpAccounts.map((account) => ({
                    value: account.email_address,
                    label: account.label
                      ? `${account.label} <${account.email_address}>`
                      : account.email_address,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={t("campaigns.form.from_name")} name="from_name">
                <Input
                  placeholder={t("campaigns.form.from_name_placeholder")}
                  disabled={isViewMode}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={t("campaigns.form.reply_to")} name="reply_to">
                <Input
                  placeholder={t("campaigns.form.reply_to_placeholder")}
                  type="email"
                  disabled
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Campaign Settings Card */}
        <Card
          title={
            <Space>
              <SettingOutlined style={{ color: "#fa8c16" }} />
              <span>{t("campaigns.form.campaign_settings")}</span>
            </Space>
          }
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
            {t("campaigns.form.campaign_settings_description")}
          </Text>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label={t("campaigns.form.status")}>
                <Input
                  size="large"
                  disabled
                  value={
                    currentStatus ? t(`campaigns.status.${currentStatus}`) : "-"
                  }
                />
              </Form.Item>
              <Form.Item name="status" hidden>
                <Input />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="campaign_type"
                label={t("campaigns.form.campaign_type")}
              >
                <Select disabled={isViewMode} size="large">
                  <Option value="SPECIFIC">
                    {t("campaigns.form.campaign_type_specific")}
                  </Option>
                  <Option value="FOLDER">
                    {t("campaigns.form.campaign_type_folder")}
                  </Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              {!isViewMode && isCreateMode && (
                <Form.Item label={t("campaigns.form.scheduled_at")}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ClockCircleOutlined />}
                    onClick={() => setIsScheduleModalOpen(true)}
                    loading={isPending}
                    style={{ width: "100%" }}
                  >
                    Schedule when
                  </Button>
                </Form.Item>
              )}
              <Form.Item name="scheduled_at" hidden>
                <DatePicker />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Targeting Card */}
        <Card
          title={
            <Space>
              <AimOutlined style={{ color: "#eb2f96" }} />
              <span>{t("campaigns.form.targeting")}</span>
            </Space>
          }
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
            {t("campaigns.form.targeting_description")}
          </Text>
          <Row gutter={16}>
            {campaignType === "SPECIFIC" && (
              <Col xs={24}>
                <Form.Item
                  label={t("campaigns.form.target_leads")}
                  name="target_leads"
                  rules={[
                    {
                      required: campaignType === "SPECIFIC",
                      message: t("campaigns.form.target_leads_required"),
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder={t("campaigns.form.target_leads_placeholder")}
                    size="large"
                    showSearch
                    disabled={isViewMode}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label?.toString() ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={leads.map((lead: any) => ({
                      value: lead._id,
                      label: `${lead.first_name} ${lead.last_name} (${lead.emails?.[0] || "No email"})`,
                    }))}
                  />
                </Form.Item>
              </Col>
            )}
            {campaignType === "FOLDER" && (
              <Col xs={24}>
                <Form.Item
                  label={t("campaigns.form.target_folders")}
                  name="target_folders"
                  rules={[
                    {
                      required: campaignType === "FOLDER",
                      message: t("campaigns.form.target_folders_required"),
                    },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder={t("campaigns.form.target_folders_placeholder")}
                    size="large"
                    showSearch
                    disabled={isViewMode}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label?.toString() ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={folders.map((folder: any) => ({
                      value: folder._id,
                      label: folder.name,
                    }))}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
        </Card>

        {/* Tracking Options Card */}
        <Card
          title={
            <Space>
              <LineChartOutlined style={{ color: "#13c2c2" }} />
              <span>{t("campaigns.form.tracking_options")}</span>
            </Space>
          }
          style={{
            marginBottom: 24,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
            {t("campaigns.form.tracking_description")}
          </Text>
          <Form.Item
            name="track_opens"
            label={t("campaigns.form.track_opens")}
            valuePropName="checked"
          >
            <Switch disabled />
          </Form.Item>
          <Form.Item
            name="track_clicks"
            label={t("campaigns.form.track_clicks")}
            valuePropName="checked"
          >
            <Switch disabled />
          </Form.Item>
        </Card>

        {/* Action Buttons */}
        {!isViewMode && (
          <Card
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              background: token.colorBgContainer,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Button
                size="large"
                icon={<SaveOutlined />}
                onClick={() => {
                  form.setFieldsValue({ status: "DRAFT" });
                  form.submit();
                }}
                loading={isPending}
                style={{ minWidth: 140 }}
              >
                {t("campaigns.form.save_draft")}
              </Button>

              {isCreateMode && (
                <Button
                  type="primary"
                  size="large"
                  icon={<SendOutlined />}
                  onClick={handleSendNow}
                  loading={isPending}
                  style={{ minWidth: 140 }}
                >
                  {t("campaigns.form.send_now")}
                </Button>
              )}
            </div>
          </Card>
        )}
      </Form>

      {/* Schedule Modal */}
      <Modal
        title={
          <Space>
            <ClockCircleOutlined style={{ color: "#1890ff" }} />
            <span>{t("campaigns.form.schedule_campaign")}</span>
          </Space>
        }
        open={isScheduleModalOpen}
        onCancel={() => {
          setIsScheduleModalOpen(false);
          setScheduleDateTime(null);
        }}
        onOk={() => {
          if (scheduleDateTime) {
            form.setFieldsValue({
              scheduled_at: scheduleDateTime,
              status: "SCHEDULED",
            });
            form.submit();
            setIsScheduleModalOpen(false);
            setScheduleDateTime(null);
          } else {
            message.warning(t("campaigns.form.select_schedule_time"));
          }
        }}
        okText={t("campaigns.form.confirm_schedule")}
        cancelText={t("commons.cancel")}
        width={500}
      >
        <div style={{ padding: "24px 0" }}>
          <Alert
            message={t("campaigns.form.campaign_settings_description")}
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            value={scheduleDateTime}
            onChange={(date) => setScheduleDateTime(date)}
            style={{ width: "100%" }}
            size="large"
            placeholder={t("campaigns.form.select_date_time")}
            disabledDate={(current) => {
              // Disable dates before today
              return current && current < dayjs().startOf("day");
            }}
          />
        </div>
      </Modal>

      {/* ── Template Picker Modal ── */}
      <Modal
        open={templateModalOpen}
        title={
          <Space>
            <FileTextOutlined style={{ color: "#1890ff" }} />
            <span>Select Email Template</span>
          </Space>
        }
        onCancel={() => setTemplateModalOpen(false)}
        footer={null}
        width={680}
      >
        {emailTemplates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <Text type="secondary">
              No templates found.{" "}
              <a href="/email-templates" target="_blank" rel="noreferrer">
                Create a template
              </a>{" "}
              to use it here.
            </Text>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 12,
              maxHeight: 460,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            {emailTemplates.map((tmpl) => (
              <Card
                key={tmpl._id}
                hoverable
                size="small"
                style={{
                  borderRadius: 10,
                  border:
                    selectedTemplateId === tmpl._id
                      ? "2px solid #1890ff"
                      : "1px solid #e5e7eb",
                  cursor: "pointer",
                }}
                onClick={() => applyTemplate(tmpl)}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{tmpl.name}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Subject: {tmpl.subject}
                </Text>
                <div style={{ marginTop: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      background: "#f0f5ff",
                      color: "#1890ff",
                      borderRadius: 4,
                      padding: "1px 6px",
                    }}
                  >
                    {tmpl.category}
                  </span>
                  {tmpl.usage_count > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginLeft: 8,
                      }}
                    >
                      Used {tmpl.usage_count}×
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CampaignForm;
