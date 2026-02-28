"use client";

import React from "react";
import { Card, Table, Tag, Space, Button, Typography, theme } from "antd";
import { EyeOutlined, EditOutlined, MailOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useIntl, FormattedMessage } from "react-intl";
import dayjs from "dayjs";

const { Text } = Typography;

interface Campaign {
  _id: string;
  name: string;
  subject: string;
  status: string;
  total_recipients?: number;
  emails_sent?: number;
  emails_opened?: number;
  open_rate?: number;
  scheduled_at?: string | null;
  created_at?: string;
}

interface CampaignsTableProps {
  data?: Campaign[];
  loading?: boolean;
  showFilters?: boolean;
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

const CampaignsTable: React.FC<CampaignsTableProps> = ({
  data = [],
  loading = false,
  showFilters = true,
}) => {
  const router = useRouter();
  const intl = useIntl();
  const { token } = theme.useToken();

  const columns = [
    {
      title: intl.formatMessage({
        id: "campaigns.table.campaign",
        defaultMessage: "Campaign",
      }),
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <Text strong style={{ fontSize: 13 }}>
          {name}
        </Text>
      ),
    },
    {
      title: intl.formatMessage({
        id: "campaigns.table.status",
        defaultMessage: "Status",
      }),
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {intl.formatMessage({
            id: `campaigns.status.${status}`,
            defaultMessage: status,
          })}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({
        id: "campaigns.table.emailsSent",
        defaultMessage: "Emails Sent",
      }),
      dataIndex: "emails_sent",
      key: "emails_sent",
      width: 110,
      align: "center" as const,
      render: (sent: number = 0, record: Campaign) => (
        <Text strong style={{ fontSize: 13 }}>
          {sent} {record.total_recipients ? `/ ${record.total_recipients}` : ""}
        </Text>
      ),
    },
    {
      title: intl.formatMessage({
        id: "campaigns.table.openRate",
        defaultMessage: "Open Rate",
      }),
      dataIndex: "open_rate",
      key: "open_rate",
      width: 110,
      align: "center" as const,
      render: (rate: number = 0) => (
        <Text
          strong
          style={{
            color: rate > 20 ? token.colorSuccess : token.colorTextSecondary,
          }}
        >
          {rate.toFixed(1)}%
        </Text>
      ),
    },
    {
      title: intl.formatMessage({
        id: "campaigns.table.actions",
        defaultMessage: "Actions",
      }),
      key: "actions",
      width: 100,
      align: "center" as const,
      render: (_: any, record: Campaign) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/campaigns/${record._id}`)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card
      loading={loading}
      style={{
        borderRadius: 16,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowSecondary,
      }}
      title={
        <Space style={{ alignItems: "center" }}>
          <MailOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
          <span style={{ fontWeight: 800, fontSize: 14 }}>
            <FormattedMessage
              id="dashboard.tables.recent_campaigns"
              defaultMessage="Recent Campaigns"
            />
          </span>
        </Space>
      }
      extra={
        !showFilters && (
          <Button
            type="link"
            size="small"
            onClick={() => router.push("/campaigns")}
          >
            <FormattedMessage id="commons.view_all" defaultMessage="View All" />
          </Button>
        )
      }
    >
      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        pagination={false}
        size="small"
        locale={{
          emptyText: intl.formatMessage({
            id: "campaigns.dashboard.empty",
            defaultMessage: "No campaigns yet",
          }),
        }}
      />
    </Card>
  );
};

export default CampaignsTable;
