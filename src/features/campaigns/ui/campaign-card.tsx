import React from "react";
import {
  Card,
  Typography,
  Button,
  Tag,
  Progress,
  Popconfirm,
  Space,
  message,
} from "antd";
import {
  ArrowRightOutlined,
  MailOutlined,
  SendOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useCampaignActions } from "../hooks";
import { useUserInfo } from "@/helpers/use-user";
import { useIntl } from "react-intl";

const { Text } = Typography;

interface CampaignCardProps {
  data: any;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "default";
    case "SCHEDULED":
      return "processing";
    case "SENDING":
      return "warning";
    case "SENT":
      return "success";
    case "PAUSED":
      return "purple";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

const StatItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        fontSize: 18,
        marginBottom: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
      }}
    >
      {icon}
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
    <Text type="secondary" style={{ fontSize: 12 }}>
      {label}
    </Text>
  </div>
);

const CampaignCard: React.FC<CampaignCardProps> = ({ data }) => {
  const router = useRouter();
  const { id: userId } = useUserInfo();
  const { deleteCampaign, isPending } = useCampaignActions();
  const { formatMessage } = useIntl();

  const t = (id: string) => formatMessage({ id });

  const openRate =
    data.analytics.sent > 0
      ? ((data.analytics.unique_opens / data.analytics.sent) * 100).toFixed(1)
      : 0;

  const displayDate = data.sent_at || data.scheduled_at || data.createdAt;

  const handleDelete = async () => {
    try {
      await deleteCampaign({ campaign_id: data._id, user_id: userId! });
      message.success(t("campaigns.card.delete_success"));
    } catch (error) {
      message.error(t("campaigns.card.delete_error"));
    }
  };

  return (
    <Card
      hoverable
      style={{
        marginTop: 16,
        borderRadius: 16,
        border: "1px solid #f0f0f0",
      }}
      bodyStyle={{ padding: 24 }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <Text
            strong
            style={{ fontSize: 18, display: "block", marginBottom: 6 }}
          >
            {data.name}
          </Text>

          <Text type="secondary" style={{ fontSize: 13 }}>
            <CalendarOutlined style={{ marginRight: 6 }} />
            {dayjs(displayDate).format("MMM D, YYYY")}
          </Text>
        </div>

        <Tag
          color={getStatusColor(data.status)}
          style={{
            borderRadius: 20,
            padding: "4px 12px",
            fontWeight: 500,
          }}
        >
          {data.status}
        </Tag>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <StatItem
          icon={<MailOutlined />}
          label={t("campaigns.card.recipients")}
          value={data.total_recipients}
        />
        <StatItem
          icon={<SendOutlined />}
          label={t("campaigns.card.sent")}
          value={data.analytics.sent}
        />
        <StatItem
          icon={<EyeOutlined />}
          label={t("campaigns.card.opens")}
          value={data.analytics.unique_opens}
        />
        <StatItem
          icon={<CloseCircleOutlined />}
          label={t("campaigns.card.failed")}
          value={data.analytics.failed}
        />
      </div>

      {/* Open Rate */}
      <div style={{ marginBottom: 20 }}>
        <Text type="secondary">{t("campaigns.card.open_rate")}</Text>
        <Progress
          percent={Number(openRate)}
          size="small"
          strokeColor="#1677ff"
        />
      </div>

      {/* CTA */}
      <Space style={{ width: "100%" }} direction="vertical" size="middle">
        <Button
          type="primary"
          className="w-fit"
          icon={<ArrowRightOutlined />}
          onClick={() => router.push(`/campaigns/${data._id}?form_type=view`)}
          style={{
            borderRadius: 10,
            height: 42,
            fontWeight: 500,
          }}
        >
          {t("campaigns.card.view_details")}
        </Button>
        <Space style={{ width: "100%" }} size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/campaigns/edit/${data._id}`)}
            disabled={isPending}
            style={{
              borderRadius: 10,
              height: 42,
              fontWeight: 500,
              flex: 1,
            }}
          >
            {t("campaigns.card.edit")}
          </Button>
          <Popconfirm
            title={t("campaigns.card.delete_title")}
            description={t("campaigns.card.delete_desc")}
            onConfirm={handleDelete}
            okText={t("commons.yes")}
            cancelText={t("commons.no")}
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={isPending}
              loading={isPending}
              style={{
                borderRadius: 10,
                height: 42,
                fontWeight: 500,
                flex: 1,
              }}
            >
              {t("campaigns.card.delete")}
            </Button>
          </Popconfirm>
        </Space>
      </Space>
    </Card>
  );
};

export default CampaignCard;
