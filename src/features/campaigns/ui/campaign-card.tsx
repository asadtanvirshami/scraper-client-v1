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
  theme,
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
  const { token } = theme.useToken();

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
        marginTop: 12,
        borderRadius: 12,
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
      bodyStyle={{ padding: 14 }}
    >
      {/* Top Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div>
          <Text strong style={{ fontSize: 15 }}>
            {data.name}
          </Text>
          <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {dayjs(displayDate).format("MMM D, YYYY")}
          </div>
        </div>

        <Tag
          color={getStatusColor(data.status)}
          style={{
            borderRadius: 999,
            padding: "1px 10px",
            fontSize: 11,
            fontWeight: 500,
            lineHeight: "18px",
          }}
        >
          {data.status}
        </Tag>
      </div>

      {/* Compact Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          marginBottom: 10,
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

      {/* Slim Open Rate */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            marginBottom: 4,
            color: "#8c8c8c",
          }}
        >
          <span>{t("campaigns.card.open_rate")}</span>
          <span style={{ fontWeight: 600, color: "#000" }}>{openRate}%</span>
        </div>
        <Progress percent={Number(openRate)} showInfo={false} strokeWidth={4} />
      </div>

      {/* Compact Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          type="primary"
          size="small"
          icon={<ArrowRightOutlined />}
          onClick={() => router.push(`/campaigns/${data._id}?form_type=view`)}
          style={{ borderRadius: 6, height: 30 }}
        >
          {t("campaigns.card.view_details")}
        </Button>

        <Space size={6}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => router.push(`/campaigns/edit/${data._id}`)}
            disabled={isPending}
            style={{ borderRadius: 6, height: 30 }}
          />
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
              size="small"
              icon={<DeleteOutlined />}
              disabled={isPending}
              loading={isPending}
              style={{ borderRadius: 6, height: 30 }}
            />
          </Popconfirm>
        </Space>
      </div>
    </Card>
  );
};

export default CampaignCard;
