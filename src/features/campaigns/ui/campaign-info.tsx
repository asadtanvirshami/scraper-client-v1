"use client";

import React from "react";
import { Card, Typography, Tag, Row, Col, Divider } from "antd";
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
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}
      bodyStyle={{ padding: 28 }}
    >
      {/* Header */}
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3} style={{ marginBottom: 4 }}>
            {campaign.name}
          </Title>
          <Text type="secondary">
            {t("campaigns.info.campaign_id")}: {campaign.id}
          </Text>
        </Col>

        <Col>
          {campaign.status && (
            <Tag
              color={getStatusColor()}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {t(`campaigns.status.${campaign.status}`)}
            </Tag>
          )}
        </Col>
      </Row>

      <Divider />

      {/* Metadata Grid */}
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12}>
          <Text type="secondary">{t("campaigns.info.created")}</Text>
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            {formatDate(campaign.createdAt)}
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <Text type="secondary">{t("campaigns.info.sent")}</Text>
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            {formatDate(campaign.sent_at)}
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default CampaignInfo;
