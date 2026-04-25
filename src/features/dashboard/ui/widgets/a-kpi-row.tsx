"use client";

import React from "react";
import { Col, Row, Card, theme } from "antd";
import { useIntl } from "react-intl";
import {
  UserOutlined,
  StopOutlined,
  MessageOutlined,
  BugOutlined,
  RightOutlined,
} from "@ant-design/icons";

type Props = {
  loading?: boolean;
  totals?: {
    users?: number;
    blockedUsers?: number;
    feedbacks?: number;
    bugs?: number;
  };
  insights?: {
    newUsersInRange?: number;
    avgUsersPerDay?: number;
  };

  /** optional: make cards clickable */
  onCardClick?: (key: "users" | "blocked" | "feedbacks" | "bugs") => void;
};

type KpiCardProps = {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: React.ReactNode;
  accent: "sky" | "amber" | "teal" | "indigo";
  loading?: boolean;
  clickable?: boolean;
  onClick?: () => void;
};

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  sub,
  icon,
  accent,
  loading,
  clickable,
  onClick,
}) => {
  const { token } = theme.useToken();

  const accentPalette: Record<
    KpiCardProps["accent"],
    { start: string; end: string; fg: string }
  > = {
    sky: {
      start: token.colorInfo,
      end: token.colorInfoActive,
      fg: token.colorInfo,
    },
    amber: {
      start: token.colorWarning,
      end: token.colorWarningActive,
      fg: token.colorWarning,
    },
    teal: {
      start: token.colorSuccess,
      end: token.colorSuccessActive,
      fg: token.colorSuccess,
    },
    indigo: {
      start: token.colorPrimary,
      end: token.colorPrimaryActive,
      fg: token.colorPrimary,
    },
  };

  const a = accentPalette[accent];
  const iconBg = `linear-gradient(135deg, ${hexToRgba(a.start, 0.12)} 0%, ${hexToRgba(a.end, 0.07)} 100%)`;
  const iconBorder = hexToRgba(a.start, 0.18);

  return (
    <Card className="!max-h-[180px]">
      <button
        type="button"
        onClick={onClick}
        disabled={!clickable}
        className={[
          "w-full text-left",
          "transition-all",

          ,
          clickable
            ? "hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            : "",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: token.colorTextSecondary,
              }}
            >
              <span style={{ fontSize: 13, lineHeight: 1, color: a.fg }}>
                {icon}
              </span>
              <span>{label}</span>
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: token.colorText, // auto light/dark
              }}
            >
              {loading ? "—" : value}
            </div>

            {sub ? (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: token.colorTextSecondary,
                }}
              >
                {sub}
              </div>
            ) : (
              <div className="mt-2 text-xs text-transparent">.</div> // keeps height consistent
            )}
          </div>

          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: iconBg,
              color: a.fg,
              border: `1px solid ${iconBorder}`,
            }}
            aria-hidden
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
          </div>
        </div>
      </button>
    </Card>
  );
};

const AdminKpis: React.FC<Props> = ({
  loading,
  totals,
  insights,
  onCardClick,
}) => {
  const intl = useIntl();

  const totalUsers = totals?.users ?? 0;
  const blockedUsers = totals?.blockedUsers ?? 0;
  const feedbacks = totals?.feedbacks ?? 0;
  const bugs = totals?.bugs ?? 0;

  const newInRange = insights?.newUsersInRange ?? 0;
  const avgPerDay = insights?.avgUsersPerDay ?? 0;

  return (
    <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
      <Col xs={24} md={12} lg={6}>
        <KpiCard
          label={intl.formatMessage({
            id: "admin.kpis.total_users",
            defaultMessage: "Total users",
          })}
          value={totalUsers}
          sub={
            <>
              {intl.formatMessage(
                {
                  id: "admin.kpis.new_in_range",
                  defaultMessage: "New in range: {count}",
                },
                { count: loading ? "—" : newInRange },
              )}
              {" • "}
              {intl.formatMessage(
                {
                  id: "admin.kpis.avg_per_day",
                  defaultMessage: "Avg/day: {count}",
                },
                { count: loading ? "—" : avgPerDay },
              )}
            </>
          }
          icon={<UserOutlined />}
          accent="sky"
          loading={loading}
          clickable={Boolean(onCardClick)}
          onClick={() => onCardClick?.("users")}
        />
      </Col>

      <Col xs={24} md={12} lg={6}>
        <KpiCard
          label={intl.formatMessage({
            id: "admin.kpis.blocked_users",
            defaultMessage: "Blocked users",
          })}
          value={blockedUsers}
          icon={<StopOutlined />}
          accent="amber"
          loading={loading}
          clickable={Boolean(onCardClick)}
          onClick={() => onCardClick?.("blocked")}
        />
      </Col>

      <Col xs={24} md={12} lg={6}>
        <KpiCard
          label={intl.formatMessage({
            id: "admin.kpis.feedbacks",
            defaultMessage: "Feedbacks",
          })}
          value={feedbacks}
          icon={<MessageOutlined />}
          accent="teal"
          loading={loading}
          clickable={Boolean(onCardClick)}
          onClick={() => onCardClick?.("feedbacks")}
        />
      </Col>

      <Col xs={24} md={12} lg={6}>
        <KpiCard
          label={intl.formatMessage({
            id: "admin.kpis.bugs",
            defaultMessage: "Bugs",
          })}
          value={bugs}
          icon={<BugOutlined />}
          accent="indigo"
          loading={loading}
          clickable={Boolean(onCardClick)}
          onClick={() => onCardClick?.("bugs")}
        />
      </Col>
    </Row>
  );
};

export default AdminKpis;
