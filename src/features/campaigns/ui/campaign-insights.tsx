"use client";

import React from "react";
import { Card, Row, Col, Statistic, Progress, Typography, Space } from "antd";
import { useIntl } from "react-intl";

const { Title, Text } = Typography;

interface Analytics {
  sent: number;
  opened: number;
  unique_opens: number;
  failed: number;
}

interface CampaignData {
  analytics: Analytics;
  total_recipients: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  delivery_rate: number;
}

interface Props {
  campaign: CampaignData | undefined;
  stats?: any;
}

const CampaignInsights: React.FC<Props> = ({ campaign, stats }) => {
  const { formatMessage } = useIntl();

  const t = (key: string) => formatMessage({ id: key });

  if (!campaign) return null;

  const totalCampaigns =
    stats?.total_campaigns ?? stats?.total ?? stats?.count ?? null;

  const {
    analytics,
    total_recipients,
    open_rate,
    click_rate,
    bounce_rate,
    delivery_rate,
  } = campaign;

  return (
    <Card>
      <Title level={4}>{t("campaigns.insights.title")}</Title>

      {totalCampaigns !== null && totalCampaigns !== undefined && (
        <Text type="secondary">
          {t("campaigns.insights.total_campaigns")}: {totalCampaigns}
        </Text>
      )}

      {/* Primary KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title={t("campaigns.insights.total_recipients")}
            value={total_recipients}
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Statistic
            title={t("campaigns.insights.emails_sent")}
            value={analytics?.sent || 0}
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Statistic
            title={t("campaigns.insights.opened")}
            value={analytics?.opened || 0}
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Statistic
            title={t("campaigns.insights.unique_opens")}
            value={analytics?.unique_opens || 0}
          />
        </Col>
      </Row>
      <Space style={{ marginTop: 24 }} orientation="vertical" />
      {/* Secondary KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card size="small">
            <Text strong>{t("campaigns.insights.open_rate")}</Text>
            <Progress percent={Number(open_rate || 0)} />
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card size="small">
            <Text strong>{t("campaigns.insights.click_rate")}</Text>
            <Progress percent={Number(click_rate || 0)} />
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card size="small">
            <Text strong>{t("campaigns.insights.delivery_rate")}</Text>
            <Progress percent={Number(delivery_rate || 0)} />
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card size="small">
            <Text strong>{t("campaigns.insights.bounce_rate")}</Text>
            <Progress percent={Number(bounce_rate || 0)} status="exception" />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default CampaignInsights;
