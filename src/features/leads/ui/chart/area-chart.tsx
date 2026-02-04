"use client";

import React, { useMemo } from "react";
import { Area } from "@ant-design/plots";
import { Card, Segmented, Space, Typography, DatePicker, theme } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import dayjs, { Dayjs } from "dayjs";
import { WeeklyLeadsAreaChartProps } from "@/types/leads";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const MAX_CHART_HEIGHT = 340;

type PresetKey = "7d" | "14d" | "30d" | "90d";
type RangeValue = [Dayjs | null, Dayjs | null];

const PRESETS: { label: React.ReactNode; value: PresetKey; days: number }[] = [
  { label: "7D", value: "7d", days: 7 },
  { label: "14D", value: "14d", days: 14 },
  { label: "30D", value: "30d", days: 30 },
  { label: "90D", value: "90d", days: 90 },
];

function prettyRangeLabel(
  intl: ReturnType<typeof useIntl>,
  range?: RangeValue,
  preset?: PresetKey,
) {
  const presetDays = PRESETS.find((p) => p.value === preset)?.days;
  if (presetDays) {
    return intl.formatMessage(
      {
        id: "dashboard.stats.subtitles.lastDays",
        defaultMessage: "Last {days} days",
      },
      { days: presetDays },
    );
  }

  if (!range?.[0] || !range?.[1]) {
    return intl.formatMessage(
      {
        id: "dashboard.stats.subtitles.lastDays",
        defaultMessage: "Last {days} days",
      },
      { days: 7 },
    );
  }

  return `${range[0].format("MMM D")} → ${range[1].format("MMM D")}`;
}
function formatRangeLabel(range?: RangeValue, preset?: PresetKey) {
  const presetDays = PRESETS.find((p) => p.value === preset)?.days;
  if (presetDays) return `Last ${presetDays} days`;
  if (!range?.[0] || !range?.[1]) return "Last 7 days";
  return `${range[0].format("MMM D")} → ${range[1].format("MMM D")}`;
}

const WeeklyLeadsAreaChart: React.FC<WeeklyLeadsAreaChartProps> = ({
  labels,
  counts,
  countsByType,
  isLoading = false,

  showFilters = true,
  preset,
  onPresetChange,
  range,
  onRangeChange,
  showRangePicker = true,
}) => {
  const { token } = theme.useToken();
  const intl = useIntl();

  const hasTypeData =
    (countsByType?.INSTAGRAM?.length ?? 0) > 0 ||
    (countsByType?.LINKEDIN?.length ?? 0) > 0 ||
    (countsByType?.MANUAL?.length ?? 0) > 0;

  const data = useMemo(() => {
    if (!labels?.length) return [];

    return hasTypeData
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
  }, [labels, counts, countsByType, hasTypeData]);

  // ✅ token-based styling for charts
  const config: any = {
    data,
    xField: "date",
    yField: "leads",
    seriesField: "type",
    smooth: true,
    autoFit: true,
    height: MAX_CHART_HEIGHT,

    areaStyle: { fillOpacity: 0.16 },
    line: { size: 2 },
    point: { size: 3, shape: "circle" },

    legend: {
      position: "top",
      itemName: { style: { fill: token.colorText } },
    },
    meta: {
      date: { type: "timeCat" }, // ✅ important
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
  const rangeLabel = prettyRangeLabel(intl, range, preset);

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
              id="dashboard.charts.weekly_leads"
              defaultMessage="Leads added"
            />
          </span>
          <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
            {rangeLabel}
          </Text>
        </Space>
      }
      extra={
        showFilters ? (
          <Space size={10} wrap>
            <Segmented
              size="middle"
              options={PRESETS.map((p) => ({ label: p.label, value: p.value }))}
              value={preset ?? "7d"}
              onChange={(v) => onPresetChange?.(v as PresetKey)}
            />

            {showRangePicker ? (
              <RangePicker
                allowClear
                value={range as any}
                onChange={(v) =>
                  onRangeChange?.(((v as any) ?? [null, null]) as RangeValue)
                }
                style={{ width: 260, maxWidth: "100%" }}
                presets={[
                  {
                    label: "Last 7 days",
                    value: [dayjs().subtract(6, "day"), dayjs()],
                  },
                  {
                    label: "Last 30 days",
                    value: [dayjs().subtract(29, "day"), dayjs()],
                  },
                  {
                    label: "This month",
                    value: [dayjs().startOf("month"), dayjs().endOf("month")],
                  },
                ]}
              />
            ) : null}
          </Space>
        ) : null
      }
    >
      <div style={{ height: MAX_CHART_HEIGHT }}>
        <Area colorField="type" {...config} />
      </div>
    </Card>
  );
};

export default WeeklyLeadsAreaChart;
