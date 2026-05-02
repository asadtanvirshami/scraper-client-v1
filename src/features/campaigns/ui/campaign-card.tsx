import React from "react";
import {
  Badge,
  Button,
  Card,
  Popconfirm,
  Progress,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MailOutlined,
  SendOutlined,
  TeamOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCampaignActions } from "../hooks";
import { useUserInfo } from "@/helpers/use-user";
import { useIntl } from "react-intl";

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  DRAFT: { color: "#8c8c8c", bg: "#f5f5f5", label: "Draft", icon: <EditOutlined /> },
  SCHEDULED: { color: "#1677ff", bg: "#e6f4ff", label: "Scheduled", icon: <ClockCircleOutlined /> },
  SENDING: { color: "#fa8c16", bg: "#fff7e6", label: "Sending", icon: <SendOutlined /> },
  SENT: { color: "#52c41a", bg: "#f6ffed", label: "Sent", icon: <CheckCircleOutlined /> },
  PAUSED: { color: "#722ed1", bg: "#f9f0ff", label: "Paused", icon: <ClockCircleOutlined /> },
  CANCELLED: { color: "#ff4d4f", bg: "#fff2f0", label: "Cancelled", icon: <ClockCircleOutlined /> },
};

const StatPill = ({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) => (
  <Tooltip title={label}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 999,
        background: `${color}15`,
        fontSize: 12,
        fontWeight: 600,
        color,
      }}
    >
      {icon}
      <span>{value.toLocaleString()}</span>
    </div>
  </Tooltip>
);

interface CampaignCardProps {
  data: any;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ data }) => {
  const router = useRouter();
  const { id: userId } = useUserInfo();
  const { deleteCampaign, isPending } = useCampaignActions();
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();

  const t = (id: string) => formatMessage({ id });

  const normalizedStatus = String(data.status || "").toUpperCase();
  const statusCfg = STATUS_CONFIG[normalizedStatus] ?? STATUS_CONFIG.DRAFT;

  const totalRecipients = Number(data.total_recipients || 0);
  const sentCount = Number(data.analytics?.sent || 0);
  const deliveredCount = Number(data.analytics?.delivered ?? sentCount);
  const bouncedCount = Number(data.analytics?.bounced ?? data.analytics?.failed ?? 0);
  const totalOutcomes = deliveredCount + bouncedCount;
  const openCount = Number(data.analytics?.unique_opens || 0);
  const openRate =
    totalRecipients > 0
      ? Math.round((openCount / totalRecipients) * 100)
      : deliveredCount > 0
        ? Math.round((openCount / deliveredCount) * 100)
        : 0;
  const deliveryRate =
    Number(data.delivery_rate) ||
    (totalOutcomes > 0
      ? Math.round((deliveredCount / totalOutcomes) * 100)
      : totalRecipients > 0
        ? Math.round((deliveredCount / totalRecipients) * 100)
        : 0);

  const isDraftOrScheduled =
    normalizedStatus === "DRAFT" || normalizedStatus === "SCHEDULED";

  const displayDate = data.sent_at || data.scheduled_at || data.createdAt;

  const handleDelete = async () => {
    try {
      await deleteCampaign({ campaign_id: data._id, user_id: userId! });
      message.success(t("campaigns.card.delete_success"));
    } catch {
      message.error(t("campaigns.card.delete_error"));
    }
  };

  return (
    <Card
      hoverable
      style={{
        borderRadius: 14,
        border: `1px solid ${token.colorBorderSecondary}`,
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      bodyStyle={{ padding: 0, display: "flex", flexDirection: "column", flex: 1 }}
    >
      {/* Colored top accent based on status */}
      <div
        style={{
          height: 4,
          background: statusCfg.color,
          borderRadius: "14px 14px 0 0",
        }}
      />

      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Title
              level={5}
              className="!mb-0 truncate"
              style={{ fontSize: 14, lineHeight: "1.4" }}
            >
              {data.name}
            </Title>
            {data.subject && (
              <Text type="secondary" style={{ fontSize: 12 }} className="truncate block">
                {data.subject}
              </Text>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              borderRadius: 999,
              background: statusCfg.bg,
              color: statusCfg.color,
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {statusCfg.icon}
            <span>{statusCfg.label}</span>
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <StatPill
            icon={<TeamOutlined style={{ fontSize: 11 }} />}
            value={totalRecipients}
            label="Recipients"
            color="#1677ff"
          />
          <StatPill
            icon={<SendOutlined style={{ fontSize: 11 }} />}
            value={sentCount}
            label="Sent"
            color="#52c41a"
          />
          <StatPill
            icon={<EyeOutlined style={{ fontSize: 11 }} />}
            value={openCount}
            label="Unique opens"
            color="#8b5cf6"
          />
        </div>

        {/* Progress bars */}
        {!isDraftOrScheduled && (
          <div className="space-y-2 mb-4">
            <div>
              <div className="flex justify-between mb-1">
                <Text style={{ fontSize: 11 }} type="secondary">
                  Delivery
                </Text>
                <Text style={{ fontSize: 11, fontWeight: 600 }}>{deliveryRate}%</Text>
              </div>
              <Progress
                percent={deliveryRate}
                showInfo={false}
                strokeWidth={5}
                strokeColor="#52c41a"
                trailColor={token.colorFillTertiary}
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <Text style={{ fontSize: 11 }} type="secondary">
                  Open rate
                </Text>
                <Text style={{ fontSize: 11, fontWeight: 600 }}>{openRate}%</Text>
              </div>
              <Progress
                percent={openRate}
                showInfo={false}
                strokeWidth={5}
                strokeColor="#8b5cf6"
                trailColor={token.colorFillTertiary}
              />
            </div>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-1 mt-auto mb-3">
          <CalendarOutlined style={{ fontSize: 11, color: token.colorTextTertiary }} />
          <Text style={{ fontSize: 11 }} type="secondary">
            {data.scheduled_at && normalizedStatus === "SCHEDULED"
              ? `Scheduled ${dayjs(data.scheduled_at).format("MMM D, YYYY HH:mm")}`
              : data.sent_at
              ? `Sent ${dayjs(data.sent_at).fromNow()}`
              : `Created ${dayjs(data.createdAt).format("MMM D, YYYY")}`}
          </Text>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: token.colorBorderSecondary }}>
          <Button
            type="primary"
            size="small"
            icon={<ArrowRightOutlined />}
            onClick={() => router.push(`/campaigns/${data._id}?form_type=view`)}
            style={{ borderRadius: 8, height: 32, fontSize: 12 }}
          >
            View Details
          </Button>

          <Space size={4}>
            {(normalizedStatus !== "SENT" && normalizedStatus !== "CANCELLED") && (
              <Tooltip title="Edit">
                <Button
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => router.push(`/campaigns/edit/${data._id}`)}
                  disabled={isPending}
                  style={{ borderRadius: 8, height: 32, width: 32 }}
                />
              </Tooltip>
            )}
            <Tooltip title="Delete">
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
                  style={{ borderRadius: 8, height: 32, width: 32 }}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default CampaignCard;
