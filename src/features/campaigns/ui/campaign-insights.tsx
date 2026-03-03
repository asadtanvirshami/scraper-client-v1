"use client";

import React from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Space,
  theme,
} from "antd";
import { LineChartOutlined } from "@ant-design/icons";
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
  const { token } = theme.useToken();

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
    <Card
      title={
        <Space>
          <LineChartOutlined style={{ color: "#13c2c2" }} />
          <span>{t("campaigns.insights.title")}</span>
        </Space>
      }
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {totalCampaigns !== null && totalCampaigns !== undefined && (
        <Text type="secondary" style={{ display: "block", marginBottom: 20 }}>
          {t("campaigns.insights.total_campaigns")}: {totalCampaigns}
        </Text>
      )}

      <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
        {t("campaigns.insights.description")}
      </Text>

      {/* Primary KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Statistic
              title={t("campaigns.insights.total_recipients")}
              value={total_recipients}
              valueStyle={{ fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Statistic
              title={t("campaigns.insights.emails_sent")}
              value={analytics?.sent || 0}
              valueStyle={{ fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Statistic
              title={t("campaigns.insights.opened")}
              value={analytics?.opened || 0}
              valueStyle={{ fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 8,
            }}
            bodyStyle={{ padding: 20 }}
          >
            <Statistic
              title={t("campaigns.insights.unique_opens")}
              value={analytics?.unique_opens || 0}
              valueStyle={{ fontSize: 28, fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <div>
            <Text
              strong
              style={{ display: "block", marginBottom: 12, fontSize: 14 }}
            >
              {t("campaigns.insights.open_rate")}
            </Text>
            <Progress
              percent={Number(open_rate || 0)}
              strokeColor="#52c41a"
              strokeWidth={10}
            />
          </div>
        </Col>

        <Col xs={24} md={6}>
          <div>
            <Text
              strong
              style={{ display: "block", marginBottom: 12, fontSize: 14 }}
            >
              {t("campaigns.insights.click_rate")}
            </Text>
            <Progress
              percent={Number(click_rate || 0)}
              strokeColor="#1890ff"
              strokeWidth={10}
            />
          </div>
        </Col>

        <Col xs={24} md={6}>
          <div>
            <Text
              strong
              style={{ display: "block", marginBottom: 12, fontSize: 14 }}
            >
              {t("campaigns.insights.delivery_rate")}
            </Text>
            <Progress
              percent={Number(delivery_rate || 0)}
              strokeColor="#722ed1"
              strokeWidth={10}
            />
          </div>
        </Col>

        <Col xs={24} md={6}>
          <div>
            <Text
              strong
              style={{ display: "block", marginBottom: 12, fontSize: 14 }}
            >
              {t("campaigns.insights.bounce_rate")}
            </Text>
            <Progress
              percent={Number(bounce_rate || 0)}
              status="exception"
              strokeWidth={10}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default CampaignInsights;
