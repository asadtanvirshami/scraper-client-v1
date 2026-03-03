"use client";

import React, { useMemo } from "react";
import { Bar } from "@ant-design/plots";
import { Card, Segmented, Space, Typography, DatePicker, theme } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import dayjs from "dayjs";

import type { PresetKey, RangeValue, WeeklyLeadsAreaChartProps } from "@/types/leads";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const MAX_CHART_HEIGHT = 340;

type Props = WeeklyLeadsAreaChartProps & {
  showFilters?: boolean;

  preset?: PresetKey;
  onPresetChange?: (preset: PresetKey) => void;

  range?: RangeValue;
  onRangeChange?: (range: RangeValue) => void;

  showRangePicker?: boolean;

  titleId?: string;
  titleDefault?: string;

  stacked?: boolean;
};

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
      { id: "dashboard.stats.subtitles.lastDays", defaultMessage: "Last {days} days" },
      { days: presetDays },
    );
  }

  if (!range?.[0] || !range?.[1]) {
    return intl.formatMessage(
      { id: "dashboard.stats.subtitles.lastDays", defaultMessage: "Last {days} days" },
      { days: 7 },
    );
  }

  return `${range[0].format("MMM D")} → ${range[1].format("MMM D")}`;
}

const WeeklyLeadsBarChart: React.FC<Props> = ({
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

  titleId = "dashboard.charts.leads_by_type_bar",
  titleDefault = "Leads added (by type)",

  stacked = true,
}) => {
  const intl = useIntl();
  const { token } = theme.useToken();
  const isDarkMode = token.colorBgBase === "#000" || token.colorBgContainer === "#141414";
  const axisLabelColor = isDarkMode ? "rgba(255, 255, 255, 0.72)" : "rgba(15, 23, 42, 0.72)";
  const legendLabelColor = isDarkMode ? "rgba(255, 255, 255, 0.85)" : "rgba(15, 23, 42, 0.85)";

  const GREEN_BY_TYPE: Record<string, string> = {
    INSTAGRAM: "#39ff14",
    LINKEDIN: "#22c55e",
    MANUAL: "#86efac",
    TOTAL: "#39ff14",
  };

  const hasTypeData =
    (countsByType?.INSTAGRAM?.length ?? 0) > 0 ||
    (countsByType?.LINKEDIN?.length ?? 0) > 0 ||
    (countsByType?.MANUAL?.length ?? 0) > 0;

  const data = useMemo(() => {
    if (!labels?.length) return [];

    if (hasTypeData) {
      const mk = (type: "INSTAGRAM" | "LINKEDIN" | "MANUAL", arr: number[] = []) =>
        arr.map((value, i) => ({
          date: labels[i],
          leads: value ?? 0,
          type,
        }));

      return [
        ...mk("INSTAGRAM", countsByType?.INSTAGRAM || []),
        ...mk("LINKEDIN", countsByType?.LINKEDIN || []),
        ...mk("MANUAL", countsByType?.MANUAL || []),
      ];
    }

    return labels.map((date, index) => ({
      date,
      leads: counts?.[index] ?? 0,
      type: "TOTAL",
    }));
  }, [labels, counts, countsByType, hasTypeData]);

  const config: any = {
    data,
    xField: "date",
    yField: "leads",
    seriesField: "type",
    color: ({ type }: { type: string }) => GREEN_BY_TYPE[type] ?? "#39ff14",
    autoFit: true,
    height: MAX_CHART_HEIGHT,

    isStack: stacked && hasTypeData,
    isGroup: !stacked && hasTypeData,

    columnWidthRatio: 0.56,
    columnStyle: {
      radius: [12, 12, 0, 0],
      shadowColor: "#39ff14",
      shadowBlur: isDarkMode ? 12 : 8,
      shadowOffsetY: 2,
    },
    point: { size: 3, shape: "circle" },
    legend: {
      position: "top",
      itemName: { style: { fill: legendLabelColor, fontWeight: 700, fontSize: 12 } },
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
      label: {
        autoHide: true,
        autoRotate: true,
        formatter: (value: string) => dayjs(value).isValid() ? dayjs(value).format("MMM D") : value,
        style: { fill: axisLabelColor, fontSize: 12, fontWeight: 500 },
      },
    },
    yAxis: {
      grid: { line: { style: { lineDash: [4, 4], stroke: token.colorSplit } } },
      label: { style: { fill: axisLabelColor, fontSize: 12, fontWeight: 500 } },
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
        <Space orientation="vertical" size={2} style={{ lineHeight: 1.15 }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: token.colorText }}>
            <FormattedMessage id={titleId} defaultMessage={titleDefault} />
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
                onChange={(v) => onRangeChange?.(((v as any) ?? [null, null]) as RangeValue)}
                style={{ width: 280, maxWidth: "100%" }}
                presets={[
                  {
                    label: intl.formatMessage({ id: "commons.range_presets.last7" }),
                    value: [dayjs().subtract(6, "day"), dayjs()],
                  },
                  {
                    label: intl.formatMessage({ id: "commons.range_presets.last30" }),
                    value: [dayjs().subtract(29, "day"), dayjs()],
                  },
                  {
                    label: intl.formatMessage({ id: "commons.range_presets.thisMonth" }),
                    value: [dayjs().startOf("month"), dayjs().endOf("month")],
                  },
                ]}
                placeholder={[
                  intl.formatMessage({ id: "commons.range_placeholder.start" }),
                  intl.formatMessage({ id: "commons.range_placeholder.end" }),
                ]}
              />
            ) : null}
          </Space>
        ) : null
      }
    >
      <div style={{ height: MAX_CHART_HEIGHT }}>
        <Bar colorField="type" {...config} />
      </div>
    </Card>
  );
};

export default WeeklyLeadsBarChart;
