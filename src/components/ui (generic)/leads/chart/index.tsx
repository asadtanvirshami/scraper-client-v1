"use client";

import React from "react";
import { Area } from "@ant-design/plots";
import { Card, theme } from "antd";
import { FormattedMessage } from "react-intl";

type WeeklyLeadsAreaChartProps = {
  labels: string[];
  counts?: number[];
  countsByType?: {
    INSTAGRAM?: number[];
    LINKEDIN?: number[];
    MANUAL?: number[];
  };
  isLoading?: boolean;
};

const MAX_CHART_HEIGHT = 360;

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

const WeeklyLeadsAreaChart: React.FC<WeeklyLeadsAreaChartProps> = ({
  labels,
  counts,
  countsByType,
  isLoading = false,
}) => {
  const { token } = theme.useToken();
  const isDarkMode = getIsDarkMode(token.colorBgBase);

  const hasTypeData =
    (countsByType?.INSTAGRAM?.length ?? 0) > 0 ||
    (countsByType?.LINKEDIN?.length ?? 0) > 0 ||
    (countsByType?.MANUAL?.length ?? 0) > 0 

  // ✅ Keep type keys consistent with backend: INSTAGRAM / LINKEDIN
  const data = hasTypeData
    ? [
        ...(countsByType?.INSTAGRAM || []).map((value, i) => ({
          date: labels[i],
          leads: value ?? 0,
          type: "INSTAGRAM",
        })),
        ...(countsByType?.LINKEDIN || []).map((value, i) => ({
          date: labels[i],
          leads: value ?? 0,
          type: "LINKEDIN",
        })),
        ...(countsByType?.MANUAL || []).map((value, i) => ({
          date: labels[i],
          leads: value ?? 0,
          type: "MANUAL",
        })),
      ]
    : labels.map((date, index) => ({
        date,
        leads: counts?.[index] ?? 0,
        type: "TOTAL",
      }));

const config: any = {
  data,
  xField: "date",
  yField: "leads",
  seriesField: "type",
  smooth: true,
  autoFit: true,
  height: MAX_CHART_HEIGHT,

  // ✅ Keep area style simple (supported everywhere)
  areaStyle: { fillOpacity: 0.25 },

  // ✅ line + points can also be color-driven automatically by series color
  line: { size: 2 },

  legend: { position: "top" },

  tooltip: { shared: true, showMarkers: true },
};


  return (
    <Card
      title={
        <FormattedMessage
          id="dashboard.charts.weekly_leads"
          defaultMessage="Leads added (last 7 days)"
        />
      }
      loading={isLoading}
    >
      <Area theme={isDarkMode ? "dark" : "light"} colorField="type" {...config} />
    </Card>
  );
};

export default WeeklyLeadsAreaChart;
