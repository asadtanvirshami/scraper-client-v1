"use client";

import React from "react";
import { Row, Col, Card, Statistic, Typography, Skeleton } from "antd";
import type { StatisticProps } from "antd";
import {
  TeamOutlined,
  CheckCircleOutlined,
  PercentageOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useIntl } from "react-intl";

const { Text } = Typography;

type DashboardKpiRowProps = {
  loading?: boolean;
  presetDays: number;
  isCustomRange: boolean;

  totals?: {
    leads?: number;
    converted?: number;
    conversionRate?: number;
  };

  insights?: {
    avgLeadsPerDay?: number;
  };
};

type KpiCardProps = {
  loading?: boolean;
  title: string;
  value: StatisticProps["value"];
  subtitle: string;
  icon: React.ReactNode;
};

const notionCard: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid rgba(15, 23, 42, 0.10)",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
};

const statTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(15, 23, 42, 0.60)",
};

const statValueStyle: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "rgba(15, 23, 42, 0.92)",
};

const iconWrap = (bg: string): React.CSSProperties => ({
  width: 36,
  height: 36,
  borderRadius: 10,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: bg,
  border: "1px solid rgba(15, 23, 42, 0.08)",
});

const iconStyle: React.CSSProperties = {
  fontSize: 18,
  color: "rgba(15, 23, 42, 0.78)",
};

function KpiCard({ loading, title, value, subtitle, icon }: KpiCardProps) {
  return (
    <Card style={notionCard} bodyStyle={{ padding: 16 }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {icon}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={statTitleStyle}>{title}</span>
            </div>

            <Statistic value={value} valueStyle={statValueStyle} />

            <Text style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.50)" }}>
              {subtitle}
            </Text>
          </div>
        </div>
      )}
    </Card>
  );
}

const DashboardKpiRow: React.FC<DashboardKpiRowProps> = ({
  loading = false,
  presetDays,
  isCustomRange,
  totals,
  insights,
}) => {
  const intl = useIntl();

  const leads = totals?.leads ?? 0;
  const converted = totals?.converted ?? 0;
  const conversionRate = totals?.conversionRate ?? 0;
  const avg = insights?.avgLeadsPerDay ?? 0;

  const totalLeadsSubtitle = isCustomRange
    ? intl.formatMessage({ id: "dashboard.stats.subtitles.customRange" })
    : intl.formatMessage(
        { id: "dashboard.stats.subtitles.lastDays" },
        { days: presetDays }
      );

  return (
    <Row gutter={[12, 12]}>
      <Col xs={24} sm={12} lg={6}>
        <KpiCard
          loading={loading}
          title={intl.formatMessage({ id: "dashboard.stats.totalLeads" })}
          value={leads}
          subtitle={totalLeadsSubtitle}
          icon={
            <span style={iconWrap("rgba(59,130,246,0.10)")}>
              <TeamOutlined style={iconStyle} />
            </span>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <KpiCard
          loading={loading}
          title={intl.formatMessage({ id: "dashboard.stats.converted" })}
          value={converted}
          subtitle={intl.formatMessage({
            id: "dashboard.stats.subtitles.markedConverted",
          })}
          icon={
            <span style={iconWrap("rgba(34,197,94,0.10)")}>
              <CheckCircleOutlined style={iconStyle} />
            </span>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <KpiCard
          loading={loading}
          title={intl.formatMessage({ id: "dashboard.stats.conversionRate" })}
          value={`${conversionRate}%`}
          subtitle={intl.formatMessage({
            id: "dashboard.stats.subtitles.convertedOverTotal",
          })}
          icon={
            <span style={iconWrap("rgba(168,85,247,0.10)")}>
              <PercentageOutlined style={iconStyle} />
            </span>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <KpiCard
          loading={loading}
          title={intl.formatMessage({ id: "dashboard.stats.avgPerDay" })}
          value={avg}
          subtitle={intl.formatMessage({
            id: "dashboard.stats.subtitles.averagePerDay",
          })}
          icon={
            <span style={iconWrap("rgba(245,158,11,0.12)")}>
              <LineChartOutlined style={iconStyle} />
            </span>
          }
        />
      </Col>
    </Row>
  );
};

export default DashboardKpiRow;
