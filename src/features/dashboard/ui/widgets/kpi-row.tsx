"use client";

import React from "react";
import { Row, Col, Card, Skeleton, theme } from "antd";
import type { StatisticProps } from "antd";
import {
  TeamOutlined,
  CheckCircleOutlined,
  PercentageOutlined,
  LineChartOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useIntl } from "react-intl";

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

  /** optional: make cards clickable like your AdminKpis */
  onCardClick?: (key: "leads" | "converted" | "rate" | "avg") => void;
};

type Accent = "blue" | "green" | "purple" | "orange";

type KpiCardProps = {
  label: string;
  value: StatisticProps["value"];
  sub?: React.ReactNode;
  icon: React.ReactNode;
  accent: Accent;
  loading?: boolean;
  clickable?: boolean;
  onClick?: () => void;
};

function hexToRgba(hex: string, alpha: number) {
  // supports: #RGB, #RRGGBB
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const DashboardKpiRow: React.FC<DashboardKpiRowProps> = ({
  loading = false,
  presetDays,
  isCustomRange,
  totals,
  insights,
  onCardClick,
}) => {
  const intl = useIntl();
  const { token } = theme.useToken();

  const leads = totals?.leads ?? 0;
  const converted = totals?.converted ?? 0;
  const conversionRate = totals?.conversionRate ?? 0;
  const avg = insights?.avgLeadsPerDay ?? 0;

  const totalLeadsSubtitle = isCustomRange
    ? intl.formatMessage({ id: "dashboard.stats.subtitles.customRange" })
    : intl.formatMessage(
        { id: "dashboard.stats.subtitles.lastDays" },
        { days: presetDays },
      );

  // Accent base colors (fixed hex values)
  const ACCENT: Record<Accent, { base: string }> = {
    blue: { base: "#1677ff" },
    green: { base: "#52c41a" },
    purple: { base: "#722ed1" },
    orange: { base: "#fa8c16" },
  };

  const getAccentStyle = (accent: Accent) => {
    const base = ACCENT[accent].base;

    // soft “modern” glow like your AdminKpis (but theme-aware)
    const bg = `linear-gradient(135deg, ${hexToRgba(base, 0.14)} 0%, ${hexToRgba(
      base,
      0.08,
    )} 100%)`;
    const ring = hexToRgba(base, 0.14);
    const glow = hexToRgba(base, 0.10);
    const fg = base;

    return { bg, ring, glow, fg };
  };

  const KpiCard: React.FC<KpiCardProps> = ({
    label,
    value,
    sub,
    icon,
    accent,
    loading: cardLoading,
    clickable,
    onClick,
  }) => {
    const a = getAccentStyle(accent);

    return (
      <Card
        className="!max-h-[180px]"
        style={{
          borderRadius: 16,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          boxShadow: token.boxShadowSecondary,
        }}
      >
        <button
          type="button"
          onClick={onClick}
          disabled={!clickable}
          className={[
            "w-full text-left",
            "rounded-2xl",
            "transition-all",
            clickable ? "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0" : "",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          ].join(" ")}
          style={{
            // keep it subtle + theme-aware
            color: token.colorText,
            cursor: clickable ? "pointer" : "default",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: token.colorTextSecondary }}>
                {label}
              </div>

              <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 8 }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: token.colorText,
                    lineHeight: 1.05,
                  }}
                >
                  {cardLoading ? "—" : value}
                </div>

                {clickable ? (
                  <span style={{ color: token.colorTextTertiary }}>
                    <RightOutlined style={{ fontSize: 12 }} />
                  </span>
                ) : null}
              </div>

              {cardLoading ? (
                <div style={{ marginTop: 10 }}>
                  <Skeleton active paragraph={{ rows: 1 }} title={false} />
                </div>
              ) : sub ? (
                <div style={{ marginTop: 10, fontSize: 12, color: token.colorTextSecondary }}>
                  {sub}
                </div>
              ) : (
                <div style={{ marginTop: 10, fontSize: 12, color: "transparent" }}>.</div>
              )}
            </div>

            {/* Modern icon pill (inspired by your AdminKpis) */}
            <div
              aria-hidden
              style={{
                width: 44,
                height: 44,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: a.bg,
                color: a.fg,
                boxShadow: `0 0 0 6px ${a.ring}, 0 12px 28px ${a.glow}`,
                border: `1px solid ${hexToRgba(a.fg, token.colorBgContainer === "#141414" ? 0.22 : 0.12)}`,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1, opacity: 0.92 }}>{icon}</span>
            </div>
          </div>
        </button>
      </Card>
    );
  };

  return (
    <Row gutter={[12, 12]}>
      <Col xs={24} sm={12} lg={6}>
        <KpiCard
          label={intl.formatMessage({ id: "dashboard.stats.totalLeads" })}
          value={leads}
          sub={totalLeadsSubtitle}
          icon={<TeamOutlined />}
          accent="blue"
          loading={loading}
          clickable={Boolean(onCardClick)}
          onClick={() => onCardClick?.("leads")}
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <KpiCard
          label={intl.formatMessage({ id: "dashboard.stats.converted" })}
          value={converted}
          sub={intl.formatMessage({ id: "dashboard.stats.subtitles.markedConverted" })}
          icon={<CheckCircleOutlined />}
          accent="green"
          loading={loading}
          clickable={Boolean(onCardClick)}
          onClick={() => onCardClick?.("converted")}
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <KpiCard
          label={intl.formatMessage({ id: "dashboard.stats.conversionRate" })}
          value={`${conversionRate}%`}
          sub={intl.formatMessage({ id: "dashboard.stats.subtitles.convertedOverTotal" })}
          icon={<PercentageOutlined />}
          accent="purple"
          loading={loading}
          clickable={Boolean(onCardClick)}
          onClick={() => onCardClick?.("rate")}
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <KpiCard
          label={intl.formatMessage({ id: "dashboard.stats.avgPerDay" })}
          value={avg}
          sub={intl.formatMessage({ id: "dashboard.stats.subtitles.averagePerDay" })}
          icon={<LineChartOutlined />}
          accent="orange"
          loading={loading}
          clickable={Boolean(onCardClick)}
          onClick={() => onCardClick?.("avg")}
        />
      </Col>
    </Row>
  );
};

export default DashboardKpiRow;
