"use client";

import React, { useMemo, useState } from "react";
import {
  ChartBarIcon,
  CheckBadgeIcon,
  TrashIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { Card, Col, Row } from "antd";
import { FormattedMessage, useIntl } from "react-intl";

import LeadsScraperCard from "@/features/scraper/ui/scrapper-card";
import UnscrappedLeadsTable from "../unscraped-table";

import { useUserInfo } from "@/helpers/use-user";
import {
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useBulkDeleteLeads,
} from "../../hooks/mutations";
import { useFetchLeadsList } from "../../hooks/queries";

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

function SkeletonCard() {
  return (
    <div className="h-[108px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-4" />
  );
}

function IconPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl border  shadow-sm">
      {children}
    </div>
  );
}

function DeltaPill({ value }: { value: number }) {
  const isUp = value >= 0;
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium",
        isUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
      ].join(" ")}
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
}: {
  title: React.ReactNode;
  value: string | number;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-slate-200 p-4 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconPill>{icon}</IconPill>
          <div className="text-sm font-medium ">{title}</div>
        </div>
        {rightSlot ? <div className="mt-1">{rightSlot}</div> : null}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div className="text-3xl font-semibold tracking-tight 0">
          {value}
        </div>
      </div>

      {subtitle ? (
        <div className="mt-2 text-xs leading-relaxed">
          {subtitle}
        </div>
      ) : null}
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

  const convertedPercent = total > 0 ? Math.round((converted / total) * 100) : null;
  const deletedPercent = total > 0 ? Math.round((deleted / total) * 100) : null;

  // --- table filters ---
  const [query, setQuery] = useState<LeadsQueryState>(DEFAULT_QUERY);

  const {
    data: leads,
    isFetching: leadsFetching,
  } = useFetchLeadsList({
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
          title={
            <FormattedMessage
              id="insights.cards.total_leads.title"
              defaultMessage="Total leads"
            />
          }
          value={formatInt(total)}
          icon={<ChartBarIcon className="h-5 w-5 " />}
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
          title={
            <FormattedMessage
              id="insights.cards.converted.title"
              defaultMessage="Converted"
            />
          }
          value={formatInt(converted)}
          icon={<CheckBadgeIcon className="h-5 w-5 " />}
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
          title={
            <FormattedMessage
              id="insights.cards.deleted.title"
              defaultMessage="Deleted"
            />
          }
          value={formatInt(deleted)}
          icon={<TrashIcon className="h-5 w-5 " />}
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
          title={
            <FormattedMessage
              id="insights.cards.by_type.title"
              defaultMessage="By type"
            />
          }
          value={formatInt(typeEntries.length)}
          icon={<Squares2X2Icon className="h-5 w-5 " />}
          subtitle={
            typeEntries.length ? (
              <span className="flex flex-wrap gap-2">
                {typeEntries.map(({ k, v }) => {
                  const keyLower = String(k).toLowerCase();
                  return (
                    <span
                      key={k}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium ",
                        keyLower === "instagram" && "!bg-rose-50 text-rose-700",
                        keyLower === "linkedin" && "!bg-indigo-50 text-indigo-700"
                      )}
                    >
                      <span className="capitalize">{keyLower}</span>
                      <span className="text-slate-500">•</span>
                      <span className="font-semibold text-slate-900">
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
            onFetch={(next) => setQuery(next)}
            onCreateLead={(payload) => createLead.mutateAsync(payload)}
            onUpdateLead={(leadId, payload) =>
              updateLead.mutateAsync({ lead_id: leadId, ...payload })
            }
            onDeleteOne={(lead) => deleteLead.mutateAsync(lead._id)}
            onDeleteMany={(ids) => bulkDelete.mutateAsync(ids)}
          />
        </Col>
      </Row>
    </div>
  );
};

export default InsightsCard;
