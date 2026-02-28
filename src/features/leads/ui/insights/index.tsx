"use client";

import React, { useMemo, useState } from "react";
import {
  ChartBarIcon,
  CheckBadgeIcon,
  TrashIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { Card, Col, Row, theme, Typography } from "antd";
import { FormattedMessage, useIntl } from "react-intl";

import LeadsScraperCard from "@/features/scraper/ui/scrapper-card";
import UnscrappedLeadsTable from "../unscraped-table";

import { useUserInfo } from "@/helpers/use-user";
import {
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useBulkDeleteLeads,
  useBulkUpdateScrappedLeads,
} from "../../hooks/mutations";
import { useFetchLeadsList } from "../../hooks/queries";

const { Text } = Typography;

type InsightsStats = {
  total?: number;
  converted?: number;
  deleted?: number;
  byType?: Record<string, number>;
};

type Props = {
  stats?: InsightsStats;
  dailyTotal?: { labels?: string[]; counts?: number[] };
  loading?: boolean;
};

function formatInt(n: number) {
  return new Intl.NumberFormat().format(n);
}

function safeNumber(n: any, fallback = 0) {
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function hexToRgba(hex: string, alpha: number) {
  const h = (hex || "").replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  if (full.length !== 6) return `rgba(0,0,0,${alpha})`;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function SkeletonCard() {
  return (
    <div className="h-[112px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5" />
  );
}

type Accent = "blue" | "green" | "red" | "purple";

function IconPill({ icon, accent }: { icon: React.ReactNode; accent: Accent }) {
  const { token } = theme.useToken();

  const base =
    accent === "blue"
      ? token.colorPrimary
      : accent === "green"
        ? token.colorSuccess
        : accent === "red"
          ? token.colorError
          : token.colorInfo;

  const bg = `linear-gradient(135deg, ${hexToRgba(base, 0.18)} 0%, ${hexToRgba(
    base,
    0.08,
  )} 100%)`;

  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-lg"
      style={{
        background: bg,
        color: base,
        boxShadow: `0 0 0 6px ${hexToRgba(base, 0.12)}, 0 12px 26px ${hexToRgba(base, 0.1)}`,
        border: `1px solid ${hexToRgba(base, 0.14)}`,
      }}
      aria-hidden
    >
      <span style={{ fontSize: 18, lineHeight: 1, opacity: 0.92 }}>{icon}</span>
    </div>
  );
}

function DeltaPill({ value }: { value: number }) {
  const { token } = theme.useToken();
  const isUp = value >= 0;

  const base = isUp ? token.colorSuccess : token.colorError;

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium"
      style={{
        background: hexToRgba(base, 0.14),
        color: base,
        border: `1px solid ${hexToRgba(base, 0.18)}`,
      }}
    >
      {isUp ? "+" : ""}
      {formatInt(value)}
    </span>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  rightSlot,
  clickable,
  onClick,
  accent,
}: {
  title: React.ReactNode;
  value: string | number;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
  accent: Accent;
}) {
  const { token } = theme.useToken();

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl"
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
        className={cn(
          "w-full text-left transition-all",
          clickable ? "hover:-translate-y-[1px]" : "",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        )}
        style={{
          padding: 16,
          cursor: clickable ? "pointer" : "default",
          borderRadius: 16,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconPill accent={accent} icon={icon} />
            <div
              style={{ fontSize: 13, fontWeight: 650, color: token.colorText }}
            >
              {title}
            </div>
          </div>

          {rightSlot ? <div className="mt-1">{rightSlot}</div> : null}
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: token.colorText,
              lineHeight: 1.05,
            }}
          >
            {value}
          </div>
        </div>

        {subtitle ? (
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: token.colorTextSecondary,
            }}
          >
            {subtitle}
          </div>
        ) : (
          <div style={{ marginTop: 10, fontSize: 12, color: "transparent" }}>
            .
          </div>
        )}
      </button>
    </Card>
  );
}

type LeadsQueryState = {
  page: number;
  limit: number;
  search: string;
  type: string;
  is_converted?: boolean;
};

const DEFAULT_QUERY: LeadsQueryState = {
  page: 1,
  limit: 10,
  search: "",
  type: "",
  is_converted: undefined,
};

const InsightsCard: React.FC<Props> = ({ stats, dailyTotal, loading }) => {
  const intl = useIntl();
  const { token } = theme.useToken();
  const { id: userId } = useUserInfo();

  // --- stats ---
  const total = safeNumber(stats?.total);
  const converted = safeNumber(stats?.converted);
  const deleted = safeNumber(stats?.deleted);
  const byType = stats?.byType ?? {};

  const { deltaToday, todayLabel, hasDelta } = useMemo(() => {
    const counts = dailyTotal?.counts ?? [];
    const labels = dailyTotal?.labels ?? [];
    const len = counts.length;

    if (len < 2) {
      return {
        deltaToday: 0,
        todayLabel: intl.formatMessage({
          id: "insights.labels.today",
          defaultMessage: "today",
        }),
        hasDelta: false,
      };
    }

    const today = safeNumber(counts[len - 1]);
    const yesterday = safeNumber(counts[len - 2]);

    const label =
      labels.length === counts.length && labels.length
        ? labels[labels.length - 1]
        : intl.formatMessage({
            id: "insights.labels.today",
            defaultMessage: "today",
          });

    return { deltaToday: today - yesterday, todayLabel: label, hasDelta: true };
  }, [dailyTotal, intl]);

  const typeEntries = useMemo(() => {
    return Object.entries(byType)
      .map(([k, v]) => ({ k, v: safeNumber(v) }))
      .sort((a, b) => b.v - a.v);
  }, [byType]);

  const convertedPercent =
    total > 0 ? Math.round((converted / total) * 100) : null;
  const deletedPercent = total > 0 ? Math.round((deleted / total) * 100) : null;

  // --- table filters ---
  const [query, setQuery] = useState<LeadsQueryState>(DEFAULT_QUERY);

  const { data: leads, isFetching: leadsFetching } = useFetchLeadsList({
    user_id: userId ?? "",
    limit: query.limit,
    page: query.page,
    search: query.search,
    scrape_status: false,
    type: query.type,
    is_converted: query.is_converted,
  });

  // --- mutations ---
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const bulkDelete = useBulkDeleteLeads();
  const bulkUpdateScraped = useBulkUpdateScrappedLeads();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          accent="blue"
          title={
            <FormattedMessage
              id="insights.cards.total_leads.title"
              defaultMessage="Total leads"
            />
          }
          value={formatInt(total)}
          icon={<ChartBarIcon className="h-5 w-5" />}
          rightSlot={hasDelta ? <DeltaPill value={deltaToday} /> : undefined}
          subtitle={
            hasDelta ? (
              <FormattedMessage
                id="insights.cards.total_leads.subtitle.delta"
                defaultMessage="Compared to yesterday • {todayLabel}"
                values={{ todayLabel }}
              />
            ) : (
              <FormattedMessage
                id="insights.cards.total_leads.subtitle.all_sources"
                defaultMessage="All sources combined"
              />
            )
          }
        />

        <StatCard
          accent="green"
          title={
            <FormattedMessage
              id="insights.cards.converted.title"
              defaultMessage="Converted"
            />
          }
          value={formatInt(converted)}
          icon={<CheckBadgeIcon className="h-5 w-5" />}
          subtitle={
            convertedPercent !== null ? (
              <FormattedMessage
                id="insights.cards.converted.subtitle.percent_of_total"
                defaultMessage="{percent}% of total"
                values={{ percent: convertedPercent }}
              />
            ) : (
              <FormattedMessage
                id="insights.cards.converted.subtitle.dash"
                defaultMessage="—"
              />
            )
          }
        />

        <StatCard
          accent="red"
          title={
            <FormattedMessage
              id="insights.cards.deleted.title"
              defaultMessage="Deleted"
            />
          }
          value={formatInt(deleted)}
          icon={<TrashIcon className="h-5 w-5" />}
          subtitle={
            deletedPercent !== null ? (
              <FormattedMessage
                id="insights.cards.deleted.subtitle.percent_of_total"
                defaultMessage="{percent}% of total"
                values={{ percent: deletedPercent }}
              />
            ) : (
              <FormattedMessage
                id="insights.cards.deleted.subtitle.dash"
                defaultMessage="—"
              />
            )
          }
        />

        <StatCard
          accent="purple"
          title={
            <FormattedMessage
              id="insights.cards.by_type.title"
              defaultMessage="By type"
            />
          }
          value={formatInt(typeEntries.length)}
          icon={<Squares2X2Icon className="h-5 w-5" />}
          subtitle={
            typeEntries.length ? (
              <span className="flex flex-wrap gap-2">
                {typeEntries.map(({ k, v }) => {
                  const keyLower = String(k).toLowerCase();
                  const isInsta = keyLower === "instagram";
                  const isLinkedIn = keyLower === "linkedin";

                  const chipBase = isInsta
                    ? token.colorError
                    : isLinkedIn
                      ? token.colorPrimary
                      : token.colorInfo;

                  return (
                    <span
                      key={k}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
                      )}
                      style={{
                        background: hexToRgba(chipBase, 0.12),
                        color: chipBase,
                        border: `1px solid ${hexToRgba(chipBase, 0.18)}`,
                      }}
                    >
                      <span className="capitalize">{keyLower}</span>
                      <span style={{ color: token.colorTextTertiary }}>•</span>
                      <span style={{ fontWeight: 700, color: token.colorText }}>
                        {formatInt(v)}
                      </span>
                    </span>
                  );
                })}
              </span>
            ) : (
              <FormattedMessage
                id="insights.cards.by_type.subtitle.no_breakdown"
                defaultMessage="No type breakdown"
              />
            )
          }
        />
      </div>

      {/* Bottom area: scraper + table */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <LeadsScraperCard />
        </Col>

        <Col xs={24} lg={16}>
          <UnscrappedLeadsTable
            user_id={userId ?? ""}
            leads={leads?.data ?? []}
            total={leads?.pagination?.total ?? 0}
            loading={leadsFetching}
            value={query}
            onFetch={(next) => setQuery(next as any)}
            onCreateLead={async (payload: any) => {
              await createLead.mutateAsync(payload);
            }}
            onUpdateLead={async (leadId, payload) => {
              await updateLead.mutateAsync({ lead_id: leadId, ...payload });
            }}
            onDeleteOne={async (lead: any) => {
              await deleteLead.mutateAsync(lead._id);
            }}
            onDeleteMany={async (ids: string[]) => {
              await bulkDelete.mutateAsync(ids);
            }}
            onApproveAll={async () => {
              const allLeads = (leads?.data ?? []).map((lead: any) => ({
                _id: lead._id,
                scrape_status: true,
              }));
              if (allLeads.length > 0) {
                await bulkUpdateScraped.mutateAsync({ leads: allLeads });
              }
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default InsightsCard;
