"use client";

import React from "react";
import { Card, Typography, Tag, Row, Col, Divider, Space } from "antd";
import {
  InfoCircleOutlined,
  CalendarOutlined,
  SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useIntl } from "react-intl";

const { Title, Text } = Typography;

interface CampaignInfoProps {
  campaign:
    | {
        id: string;
        name: string;
        createdAt?: string;
        sent_at?: string | null;
        status?: string;
      }
    | undefined;
}

const CampaignInfo: React.FC<CampaignInfoProps> = ({ campaign }) => {
  if (!campaign) return null;
  const { formatMessage } = useIntl();
  const t = (key: string) => formatMessage({ id: key });

  const formatDate = (date?: string | null) =>
    date
      ? dayjs(date).format("MMM DD, YYYY • HH:mm")
      : t("campaigns.info.not_sent");

  const getStatusColor = () => {
    switch (campaign.status) {
      case "SENT":
        return "green";
      case "DRAFT":
        return "gold";
      case "SCHEDULED":
        return "blue";
      default:
        return "default";
    }
  };

  return (
    <Card
      title={
        <Space>
          <InfoCircleOutlined style={{ color: "#1890ff" }} />
          <span>{t("campaigns.info.title")}</span>
        </Space>
      }
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      bodyStyle={{ padding: 24 }}
    >
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ marginBottom: 4, marginTop: 0 }}>
            {campaign.name}
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {t("campaigns.info.campaign_id")}: {campaign.id}
          </Text>
        </Col>

        <Col>
          {campaign.status && (
            <Tag
              color={getStatusColor()}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {t(`campaigns.status.${campaign.status}`)}
            </Tag>
          )}
        </Col>
      </Row>

      {/* Metadata Grid */}
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12}>
          <Space>
            <CalendarOutlined style={{ color: "#52c41a", fontSize: 18 }} />
            <div>
              <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                {t("campaigns.info.created")}
              </Text>
              <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
                {formatDate(campaign.createdAt)}
              </div>
            </div>
          </Space>
        </Col>

        <Col xs={24} sm={12}>
          <Space>
            <SendOutlined style={{ color: "#722ed1", fontSize: 18 }} />
            <div>
              <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                {t("campaigns.info.sent")}
              </Text>
              <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
                {formatDate(campaign.sent_at)}
              </div>
            </div>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default CampaignInfo;
