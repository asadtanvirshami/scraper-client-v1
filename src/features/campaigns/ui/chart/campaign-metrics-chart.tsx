"use client";

import React, { useMemo } from "react";
import { Line } from "@ant-design/plots";
import { Card, Space, Typography, theme } from "antd";
import { FormattedMessage, useIntl } from "react-intl";

const { Text } = Typography;

const MAX_CHART_HEIGHT = 340;

function getIsDarkMode(colorBgBase: string) {
  const value = colorBgBase.trim().toLowerCase();

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const raw = hex[1];
    const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance < 0.5;
  }

  const rgb = value.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) {
    const r = Number(rgb[1]);
    const g = Number(rgb[2]);
    const b = Number(rgb[3]);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance < 0.5;
  }

  return false;
}

interface CampaignMetricsChartProps {
  labels: string[];
  campaignCount: number[];
  emailsSent: number[];
  emailsOpened: number[];
  emailsClicked: number[];
  isLoading?: boolean;
  showFilters?: boolean;
  preset?: string;
  range?: any;
}

function prettyRangeLabel(intl: ReturnType<typeof useIntl>, preset?: string) {
  const presetMap: Record<string, number> = {
    "7d": 7,
    "14d": 14,
    "30d": 30,
    "90d": 90,
  };

  const days = presetMap[preset || "7d"] || 7;
  return intl.formatMessage(
    {
      id: "dashboard.stats.subtitles.lastDays",
      defaultMessage: "Last {days} days",
    },
    { days },
  );
}

const CampaignMetricsChart: React.FC<CampaignMetricsChartProps> = ({
  labels,
  campaignCount,
  emailsSent,
  emailsOpened,
  emailsClicked,
  isLoading = false,
  preset = "7d",
}) => {
  const { token } = theme.useToken();
  const intl = useIntl();
  const isDarkMode = getIsDarkMode(token.colorBgBase);

  const data = useMemo(() => {
    if (!labels?.length) return [];

    return [
      ...campaignCount.map((value, i) => ({
        date: labels[i],
        value: value ?? 0,
        metric: "Campaigns Created",
      })),
      ...emailsSent.map((value, i) => ({
        date: labels[i],
        value: value ?? 0,
        metric: "Emails Sent",
      })),
      ...emailsOpened.map((value, i) => ({
        date: labels[i],
        value: value ?? 0,
        metric: "Emails Opened",
      })),
      ...emailsClicked.map((value, i) => ({
        date: labels[i],
        value: value ?? 0,
        metric: "Emails Clicked",
      })),
    ];
  }, [labels, campaignCount, emailsSent, emailsOpened, emailsClicked]);

  const config: any = {
    data,
    xField: "date",
    yField: "value",
    seriesField: "metric",
    smooth: true,
    autoFit: true,
    height: MAX_CHART_HEIGHT,

    lineStyle: { lineWidth: 2 },
    point: { size: 3, shape: "circle" },

    legend: {
      position: "top",
      itemName: { style: { fill: token.colorText } },
    },

    // Soft modern palette — no neon
    color: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"],

    meta: {
      date: { type: "timeCat" },
    },

    tooltip: {
      shared: true,
      showMarkers: true,
      domStyles: {
        "g2-tooltip": {
          background: token.colorBgElevated,
          color: token.colorText,
          borderRadius: "14px",
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: token.boxShadowSecondary,
          padding: "10px 12px",
        },
        "g2-tooltip-title": {
          color: token.colorText,
          fontWeight: 700,
        },
        "g2-tooltip-list-item": {
          color: token.colorTextSecondary,
        },
      },
    },

    xAxis: {
      tickLine: null,
      line: null,
      label: { style: { fill: token.colorTextBase } },
    },
    yAxis: {
      grid: { line: { style: { lineDash: [4, 4], stroke: token.colorSplit } } },
      label: { style: { fill: token.colorTextBase } },
    },

    interactions: [{ type: "element-active" }],
    animation: {
      appear: { animation: "wave-in", duration: 700 },
    },
  };

  const rangeLabel = prettyRangeLabel(intl, preset);

  return (
    <Card
      loading={isLoading}
      style={{
        borderRadius: 16,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowSecondary,
      }}
      title={
        <Space orientation="vertical" size={2} style={{ lineHeight: 1.1 }}>
          <span
            style={{ fontWeight: 800, fontSize: 14, color: token.colorText }}
          >
            <FormattedMessage
              id="dashboard.charts.campaign_metrics"
              defaultMessage="Campaign Performance"
            />
          </span>
          <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
            {rangeLabel}
          </Text>
        </Space>
      }
    >
      <Line theme={isDarkMode ? "dark" : "light"} {...config} />
    </Card>
  );
};

export default CampaignMetricsChart;
