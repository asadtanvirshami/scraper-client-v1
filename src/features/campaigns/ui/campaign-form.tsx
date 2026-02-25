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
  Divider,
  Modal,
} from "antd";
import {
  SaveOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useIntl } from "react-intl";
import { useCampaignActions } from "../hooks";
import { useUserInfo } from "@/helpers/use-user";
import dayjs, { Dayjs } from "dayjs";
import dynamic from "next/dynamic";
import { useFetchFolders } from "@/features/folders/hooks/queries";
import { useFetchLeadsList } from "@/features/leads/hooks/queries";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const { Option } = Select;

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
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  mode,
  initialData,
  campaignId,
}) => {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const { formatMessage } = useIntl();
  const { id: userId } = useUserInfo();
  const { createCampaign, updateCampaign, isPending } = useCampaignActions();

  const t = (id: string) => formatMessage({ id });

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Schedule modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState<Dayjs | null>(null);
  const [content, setContent] = useState("");

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

  const folders = foldersData?.data || [];
  const leads = leadsData?.data || [];

  // Watch campaign type to conditionally show targeting fields
  const campaignType = Form.useWatch("campaign_type", form);

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
      target_folders: targetFolderIds,
      target_leads: targetLeadIds,
      scheduled_at: resolvedData?.scheduled_at
        ? dayjs(resolvedData.scheduled_at)
        : null,
    });

    setContent(resolvedData?.content || "");
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

  /* ===============================
     Submit Logic
  =============================== */

  const handleSubmit = async (values: FormValues) => {
    try {
      // Clean up payload based on campaign type
      const payload: any = {
        ...values,
        user_id: userId,
        scheduled_at: values.scheduled_at
          ? values.scheduled_at.toISOString()
          : undefined,
      };

      // Remove unused targeting fields
      if (values.campaign_type === "FOLDER") {
        delete payload.target_leads;
      } else if (values.campaign_type === "SPECIFIC") {
        delete payload.target_folders;
      }

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
    } catch {
      message.error(
        isEditMode
          ? t("campaigns.form.error_update")
          : t("campaigns.form.error_create"),
      );
    }
  };

  /* ===============================
     Quill Config
  =============================== */

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
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Space style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/campaigns")}
        >
          {t("commons.cancel")}
        </Button>
      </Space>

      <Card
        title={
          isViewMode
            ? t("campaigns.view")
            : isEditMode
              ? t("campaigns.edit")
              : t("campaigns.create")
        }
        style={{ borderRadius: 14 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "DRAFT",
            campaign_type: "FOLDER",
            track_opens: true,
          }}
        >
          {/* Basic Info */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("campaigns.form.name")}
                name="name"
                rules={[{ required: true }]}
              >
                <Input size="large" disabled={isViewMode} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={t("campaigns.form.subject")}
                name="subject"
                rules={[{ required: true }]}
              >
                <Input size="large" disabled={isViewMode} />
              </Form.Item>
            </Col>
          </Row>

          {/* Content Editor */}
          <Form.Item
            label={t("campaigns.form.content")}
            name="content"
            rules={[{ required: true }]}
          >
            {isViewMode ? (
              <div
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                  padding: 16,
                }}
                dangerouslySetInnerHTML={{
                  __html: content || form.getFieldValue("content") || "",
                }}
              />
            ) : (
              <ReactQuill
                theme="snow"
                modules={quillModules}
                style={{ minHeight: 300 }}
                onChange={(value) => {
                  setContent(value);
                  form.setFieldsValue({ content: value });
                }}
                value={content}
              />
            )}
          </Form.Item>

          {/* Tracking ID - Only show in create and view mode */}
          {!isEditMode && (
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

          {/* Email Configuration */}
          <Divider>{t("campaigns.form.email_config")}</Divider>
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
                  { type: "email", message: t("leads.form.email_invalid") },
                ]}
              >
                <Input
                  placeholder={t("campaigns.form.from_email_placeholder")}
                  type="email"
                  disabled={isViewMode}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={t("campaigns.form.from_name")} name="from_name">
                <Input
                  placeholder={t("campaigns.form.from_name_placeholder")}
                  disabled={isViewMode}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label={t("campaigns.form.reply_to")} name="reply_to">
                <Input
                  placeholder={t("campaigns.form.reply_to_placeholder")}
                  type="email"
                  disabled={isViewMode}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Campaign Settings */}
          <Divider>{t("campaigns.form.campaign_settings")}</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="status" label={t("campaigns.form.status")}>
                <Select disabled={isViewMode} size="large">
                  <Option value="DRAFT">{t("campaigns.status.DRAFT")}</Option>
                  <Option value="SCHEDULED">
                    {t("campaigns.status.SCHEDULED")}
                  </Option>
                  <Option value="PAUSED">{t("campaigns.status.PAUSED")}</Option>
                </Select>
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
              <Form.Item
                name="scheduled_at"
                label={t("campaigns.form.scheduled_at")}
              >
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  disabled={isViewMode}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Targeting */}
          <Divider>{t("campaigns.form.targeting")}</Divider>
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

          {/* Tracking */}
          <Form.Item
            name="track_opens"
            label={t("campaigns.form.track_opens")}
            valuePropName="checked"
          >
            <Switch disabled={isViewMode} />
          </Form.Item>

          {/* Actions */}
          {!isViewMode && (
            <div
              style={{
                marginTop: 32,
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <Button
                icon={<SaveOutlined />}
                onClick={() => {
                  form.setFieldsValue({ status: "DRAFT" });
                  form.submit();
                }}
                loading={isPending}
              >
                Save Draft
              </Button>

              <Button
                type="primary"
                icon={<ClockCircleOutlined />}
                onClick={() => setIsScheduleModalOpen(true)}
                loading={isPending}
              >
                Schedule Campaign
              </Button>
            </div>
          )}
        </Form>
      </Card>

      {/* Schedule Modal */}
      <Modal
        title={t("campaigns.form.schedule_campaign")}
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
      >
        <div style={{ padding: "20px 0" }}>
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
    </div>
  );
};

export default CampaignForm;
