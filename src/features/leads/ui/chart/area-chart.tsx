"use client";

import React, { useMemo } from "react";
import { Area } from "@ant-design/plots";
import { Card, Segmented, Space, Typography, DatePicker } from "antd";
import { FormattedMessage } from "react-intl";
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

  const config: any = {
    data,
    xField: "date",
    yField: "leads",
    seriesField: "type",
    smooth: true,
    autoFit: true,
    height: MAX_CHART_HEIGHT,

    // modern, soft
    areaStyle: { fillOpacity: 0.18 },
    line: { size: 2 },
    point: { size: 3, shape: "circle" },

    legend: { position: "top" },
    tooltip: { shared: true, showMarkers: true },

    // cleaner axes
    xAxis: {
      tickLine: null,
      line: null,
      label: { style: { opacity: 0.65 } },
    },
    yAxis: {
      grid: { line: { style: { lineDash: [4, 4], opacity: 0.25 } } },
      label: { style: { opacity: 0.65 } },
    },
  };

  return (
    <Card
      loading={isLoading}
      style={{
        borderRadius: 12,
        border: "1px solid rgba(15, 23, 42, 0.10)",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
      }}
      bodyStyle={{
        padding: 16,
        paddingTop: 12,
        paddingBottom: 10,
      }}
      title={
        <Space direction="vertical" size={2} style={{ lineHeight: 1.1 }}>
          <span
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "rgba(15, 23, 42, 0.85)",
            }}
          >
            <FormattedMessage
              id="dashboard.charts.weekly_leads"
              defaultMessage="Leads added"
            />
          </span>

          <Text style={{ fontSize: 12, color: "rgba(15, 23, 42, 0.55)" }}>
            {formatRangeLabel(range, preset)}
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
                  onRangeChange?.(
                    ((v as any) ?? [null, null]) as RangeValue
                  )
                }
                style={{ width: 260 }}
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
