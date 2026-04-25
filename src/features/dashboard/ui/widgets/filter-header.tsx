"use client";

import React from "react";
import { DatePicker, Typography, Button, Space, Segmented, theme } from "antd";
import type { SegmentedOptions } from "antd/es/segmented";
import dayjs, { Dayjs } from "dayjs";
import { useRouter } from "next/navigation";
import { useIntl } from "react-intl";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export type PresetKey = "7d" | "14d" | "30d" | "90d";
export type RangeValue = [Dayjs | null, Dayjs | null];

type FilterHeaderProps = {
  preset: PresetKey;
  setPreset: (p: PresetKey) => void;

  range: RangeValue;
  setRange: (r: RangeValue) => void;

  PRESETS: { label: React.ReactNode; value: PresetKey }[];

  title?: React.ReactNode;
  subtitle?: React.ReactNode;

  ctaLabel?: React.ReactNode;
  ctaHref?: string;

  headerWrapStyle?: React.CSSProperties;
};

const defaultHeaderWrap: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 20,
};

const FilterHeader: React.FC<FilterHeaderProps> = ({
  preset,
  setPreset,
  range,
  setRange,
  PRESETS,
  title,
  subtitle,
  ctaLabel,
  ctaHref = "/leads",
  headerWrapStyle,
}) => {
  const router = useRouter();
  const intl = useIntl();
  const { token } = theme.useToken();

  const resolvedTitle = title ?? intl.formatMessage({ id: "dashboard.title" });

  const resolvedSubtitle =
    subtitle ?? intl.formatMessage({ id: "dashboard.subtitle" });

  const resolvedCtaLabel =
    ctaLabel ?? intl.formatMessage({ id: "commons.view" });

  const rangePickerPresets = [
    {
      label: intl.formatMessage({ id: "commons.range_presets.last7" }),
      value: [dayjs().subtract(6, "day"), dayjs()] as [Dayjs, Dayjs],
    },
    {
      label: intl.formatMessage({ id: "commons.range_presets.last30" }),
      value: [dayjs().subtract(29, "day"), dayjs()] as [Dayjs, Dayjs],
    },
    {
      label: intl.formatMessage({ id: "commons.range_presets.thisMonth" }),
      value: [dayjs().startOf("month"), dayjs().endOf("month")] as [
        Dayjs,
        Dayjs,
      ],
    },
  ];

  return (
    <div style={{ marginBottom: 0 }}>
      <div style={{ ...defaultHeaderWrap, ...(headerWrapStyle ?? {}) }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {resolvedTitle}
          </Title>
          <Text style={{ fontSize: 13, color: token.colorTextSecondary }}>
            {resolvedSubtitle}
          </Text>
        </div>

        <Space
          size={8}
          wrap
          style={{ justifyContent: "flex-end" }}
        >
          <Segmented
            options={PRESETS as SegmentedOptions}
            value={preset}
            onChange={(v) => {
              setPreset(v as PresetKey);
              setRange([null, null]);
            }}
          />

          <RangePicker
            style={{ 
              width: 320, 
              maxWidth: "100%",
            }}
            allowClear
            value={range as any}
            presets={rangePickerPresets as any}
            placeholder={[
              intl.formatMessage({ id: "commons.range_placeholder.start" }),
              intl.formatMessage({ id: "commons.range_placeholder.end" }),
            ]}
            onChange={(v) => {
              setRange(((v as any) ?? [null, null]) as any);
            }}
          />
        </Space>
      </div>
    </div>
  );
};

export default FilterHeader;
