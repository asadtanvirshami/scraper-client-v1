import React, { useMemo } from "react";
import {
  ChartBarIcon,
  CheckBadgeIcon,
  TrashIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { Card } from "antd";

type InsightsStats = {
  total?: number;
  converted?: number;
  deleted?: number;
  byType?: Record<string, number>;
};

type Props = {
  stats?: InsightsStats;
  // optional: pass daily counts ONLY if you want delta vs yesterday
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
    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
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
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-slate-200 p-4 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconPill>{icon}</IconPill>
          <div className="text-sm font-medium text-slate-700">{title}</div>
        </div>

        {rightSlot ? <div className="mt-1">{rightSlot}</div> : null}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div className="text-3xl font-semibold tracking-tight text-slate-900">
          {value}
        </div>
      </div>

      {subtitle ? (
        <div className="mt-2 text-xs leading-relaxed text-slate-500">
          {subtitle}
        </div>
      ) : null}
    </Card>
  );
}

const InsightsCard: React.FC<Props> = ({ stats, dailyTotal, loading }) => {
  const total = safeNumber(stats?.total);
  const converted = safeNumber(stats?.converted);
  const deleted = safeNumber(stats?.deleted);
  const byType = stats?.byType ?? {};

  const { deltaToday, todayLabel, hasDelta } = useMemo(() => {
    const counts = dailyTotal?.counts ?? [];
    const labels = dailyTotal?.labels ?? [];
    const len = counts.length;

    if (len < 2) return { deltaToday: 0, todayLabel: "today", hasDelta: false };

    const today = safeNumber(counts[len - 1]);
    const yesterday = safeNumber(counts[len - 2]);
    const label =
      labels.length === counts.length && labels.length
        ? labels[labels.length - 1]
        : "today";

    return { deltaToday: today - yesterday, todayLabel: label, hasDelta: true };
  }, [dailyTotal]);

  const typeEntries = useMemo(() => {
    const entries = Object.entries(byType)
      .map(([k, v]) => ({ k, v: safeNumber(v) }))
      .sort((a, b) => b.v - a.v);
    return entries;
  }, [byType]);

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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total leads"
        value={formatInt(total)}
        icon={<ChartBarIcon className="h-5 w-5 text-slate-700" />}
        rightSlot={hasDelta ? <DeltaPill value={deltaToday} /> : undefined}
        subtitle={
          hasDelta
            ? `Compared to yesterday • ${todayLabel}`
            : "All sources combined"
        }
      />

      <StatCard
        title="Converted"
        value={formatInt(converted)}
        icon={<CheckBadgeIcon className="h-5 w-5 text-slate-700" />}
        subtitle={
          total > 0 ? `${Math.round((converted / total) * 100)}% of total` : "—"
        }
      />

      <StatCard
        title="Deleted"
        value={formatInt(deleted)}
        icon={<TrashIcon className="h-5 w-5 text-slate-700" />}
        subtitle={
          total > 0 ? `${Math.round((deleted / total) * 100)}% of total` : "—"
        }
      />

      <StatCard
        title="By type"
        value={formatInt(typeEntries.length)}
        icon={<Squares2X2Icon className="h-5 w-5 text-slate-700" />}
        subtitle={
          typeEntries.length ? (
            <span className="flex flex-wrap gap-2">
              {typeEntries.map(({ k, v }) => (
                <span
                  key={k}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700",
                    k.toLowerCase() === "Instagram" &&
                      "!bg-rose-50 text-rose-700",
                    k.toLowerCase() === "Linkedin" &&
                      "!bg-indigo-50 text-indigo-700",
                  )}
                >
                  <span className="capitalize">{k.toLowerCase()}</span>
                  <span className="text-slate-500">•</span>
                  <span className="font-semibold text-slate-900">
                    {formatInt(v)}
                  </span>
                </span>
              ))}
            </span>
          ) : (
            "No type breakdown"
          )
        }
      />
    </div>
  );
};

export default InsightsCard;
