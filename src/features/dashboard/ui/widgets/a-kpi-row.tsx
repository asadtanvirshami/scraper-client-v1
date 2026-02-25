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
  accent: "blue" | "red" | "green" | "purple";
  loading?: boolean;
  clickable?: boolean;
  onClick?: () => void;
};

const ACCENT = {
  blue: {
    ring: "rgba(59,130,246,0.15)",
    bg: "rgba(59,130,246,0.10)",
    fg: "rgba(59,130,246,0.95)",
    glow: "rgba(59,130,246,0.10)",
  },
  red: {
    ring: "rgba(239,68,68,0.15)",
    bg: "rgba(239,68,68,0.10)",
    fg: "rgba(239,68,68,0.90)",
    glow: "rgba(239,68,68,0.10)",
  },
  green: {
    ring: "rgba(16,185,129,0.15)",
    bg: "rgba(16,185,129,0.10)",
    fg: "rgba(16,185,129,0.95)",
    glow: "rgba(16,185,129,0.10)",
  },
  purple: {
    ring: "rgba(168,85,247,0.15)",
    bg: "rgba(168,85,247,0.10)",
    fg: "rgba(168,85,247,0.95)",
    glow: "rgba(168,85,247,0.10)",
  },
} as const;

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
  const a = ACCENT[accent];
  const { token } = theme.useToken();
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
            <div className="text-xs font-medium text-slate-500">{label}</div>

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
              <div className="mt-2 text-xs text-slate-500">{sub}</div>
            ) : (
              <div className="mt-2 text-xs text-transparent">.</div> // keeps height consistent
            )}
          </div>

          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{
              background: a.bg,
              color: a.fg,
              boxShadow: `0 0 0 6px ${a.ring}, 0 10px 25px ${a.glow}`,
            }}
            aria-hidden
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
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
          accent="blue"
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
          accent="red"
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
          accent="green"
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
          accent="purple"
          loading={loading}
          clickable={Boolean(onCardClick)}
          onClick={() => onCardClick?.("bugs")}
        />
      </Col>
    </Row>
  );
};

export default AdminKpis;
