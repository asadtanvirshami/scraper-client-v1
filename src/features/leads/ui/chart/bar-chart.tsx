// ✅ FILE: src/features/leads/ui/bar-chart.tsx
"use client";

import React, { useMemo } from "react";
import { Bar } from "@ant-design/plots";
import { Card, Segmented, Space, Typography, DatePicker } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import dayjs from "dayjs";

import type {
  PresetKey,
  RangeValue,
  WeeklyLeadsAreaChartProps,
} from "@/types/leads";

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

  /** stacked = true => INSTAGRAM/LINKEDIN/MANUAL stacked per day */
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

  // Example: "Jan 2 → Jan 31"
  return `${range[0].format("MMM D")} → ${range[1].format("MMM D")}`;
}

const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  border: "1px solid rgba(15, 23, 42, 0.08)",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
};

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

  const hasTypeData =
    (countsByType?.INSTAGRAM?.length ?? 0) > 0 ||
    (countsByType?.LINKEDIN?.length ?? 0) > 0 ||
    (countsByType?.MANUAL?.length ?? 0) > 0;

  // ✅ one row per date per type (stack/group ready)
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
    autoFit: true,
    height: MAX_CHART_HEIGHT,

    // ✅ stacked/grouped toggle
    isStack: stacked && hasTypeData,
    isGroup: !stacked && hasTypeData,

    // ✅ modern spacing + rounded columns
    columnWidthRatio: 0.56,
    columnStyle: {
      radius: [12, 12, 0, 0],
      // subtle depth without heavy borders
      shadowColor: "rgba(15, 23, 42, 0.12)",
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 6,
    },

    // ✅ cleaner legend
    legend: {
      position: "top",
      itemName: {
        style: { opacity: 0.75 },
      },
    },

    // ✅ better tooltip (shared, compact)
    tooltip: {
      shared: true,
      showMarkers: true,
      domStyles: {
        "g2-tooltip": {
          borderRadius: "12px",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.14)",
        },
      },
    },

    // ✅ minimalist axes
    xAxis: {
      tickLine: null,
      line: null,
      label: { autoHide: true, autoRotate: false, style: { opacity: 0.6 } },
    },
    yAxis: {
      grid: { line: { style: { lineDash: [4, 4], opacity: 0.22 } } },
      label: { style: { opacity: 0.6 } },
    },

    // ✅ subtle interaction
    interactions: [{ type: "element-active" }],

    // ✅ smooth animation
    animation: {
      appear: { animation: "wave-in", duration: 700 },
    },
  };

  const rangeLabel = prettyRangeLabel(intl, range, preset);

  return (
    <Card
      loading={isLoading}
      style={cardStyle}
      bodyStyle={{ padding: 16, paddingTop: 14 }}
      title={
        <Space direction="vertical" size={2} style={{ lineHeight: 1.15 }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: "rgba(15, 23, 42, 0.90)" }}>
            <FormattedMessage id={titleId} defaultMessage={titleDefault} />
          </span>
          <Text style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.55)" }}>
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
