"use client";

import React, { useMemo, useState } from "react";
import { Col, Row } from "antd";
import Spinner from "@/components/ui (generic)/spinner";
import dayjs, { Dayjs } from "dayjs";
import { useIntl } from "react-intl";
import { useFetchDashboard } from "../../hooks/queries";

import WeeklyLeadsAreaChart from "@/features/leads/ui/chart/area-chart";
import DashboardKpiRow from "../widgets/kpi-row";
import FilterHeader from "../widgets/filter-header";
import WeeklyLeadsBarChart from "@/features/leads/ui/chart/bar-chart";
import FolderTable from "@/features/folders/ui/folder-table";
import LeadsTableServer from "@/features/leads/ui/lead-table";
import CampaignMetricsChart from "@/features/campaigns/ui/chart/campaign-metrics-chart";
import CampaignsTable from "@/features/campaigns/ui/campaigns-table";

type PresetKey = "7d" | "14d" | "30d" | "90d";

const PRESET_TO_DAYS: Record<PresetKey, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "90d": 90,
};

const PRESETS: { label: string; value: PresetKey }[] = [
  { label: "7D", value: "7d" },
  { label: "14D", value: "14d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
];

const pageStyle: React.CSSProperties = {
  padding: "20px 24px",
  minHeight: "100vh",
};

const UserLayout = ({ id }: { id: string }) => {
  const intl = useIntl();

  // ✅ filters
  const [preset, setPreset] = useState<PresetKey>("7d");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const todayStr = dayjs().format("YYYY-MM-DD");

  // ✅ params driven by range OR preset
  const params = useMemo(() => {
    const [from, to] = range;

    if (from && to) {
      return {
        dateFrom: from.format("YYYY-MM-DD"),
        dateTo: to.format("YYYY-MM-DD"),
        user_id: id ?? "",
      };
    }

    return { days: PRESET_TO_DAYS[preset], user_id: id ?? "" };
  }, [range, preset]);

  const isTodayOnly = useMemo(() => {
    const [from, to] = range;
    if (!from || !to) return true;
    return (
      from.format("YYYY-MM-DD") === todayStr &&
      to.format("YYYY-MM-DD") === todayStr
    );
  }, [range, todayStr]);

  // query (NOW affects everything)
  const { data, isLoading, isFetching } = useFetchDashboard(params);
  console.log(data);

  // full page spinner only on first load
  if (isLoading && isTodayOnly) return <Spinner size="large" />;

  // use filtered data directly
  const totals = data?.data?.totals;
  const insights = data?.data?.insights;
  const charts = data?.data?.charts;

  // loading on refetch
  const loading = isTodayOnly ? isLoading : isFetching;

  const isCustomRange = Boolean(range?.[0] && range?.[1]);
  const presetDays = PRESET_TO_DAYS[preset];

  // ✅ central handlers so header + charts behave same
  const handlePreset = (p: PresetKey) => {
    setPreset(p);
    setRange([null, null]); // preset becomes source of truth
  };

  const handleRange = (r: [Dayjs | null, Dayjs | null]) => {
    setRange(r ?? [null, null]);
  };

  return (
    <div style={pageStyle}>
      <FilterHeader
        title={intl.formatMessage({
          id: "dashboard.title",
          defaultMessage: "Dashboard",
        })}
        subtitle={intl.formatMessage({
          id: "dashboard.subtitle",
          defaultMessage: "Track performance and leads activity.",
        })}
        ctaHref="/leads"
        PRESETS={PRESETS}
        preset={preset}
        setPreset={handlePreset}
        range={range}
        setRange={handleRange}
      />

      {/* ✅ KPIs NOW update with filters */}
      <DashboardKpiRow
        loading={loading}
        totals={totals}
        insights={insights}
        presetDays={presetDays}
        isCustomRange={isCustomRange}
      />

      {/* Lead Analytics Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <WeeklyLeadsAreaChart
            isLoading={loading}
            showFilters={false}
            preset={preset}
            onPresetChange={handlePreset}
            range={range as any}
            onRangeChange={(r) => handleRange((r as any) ?? [null, null])}
            labels={charts?.leadsAddedByType?.labels ?? []}
            countsByType={{
              INSTAGRAM:
                charts?.leadsAddedByType?.countsByType?.INSTAGRAM ?? [],
              LINKEDIN: charts?.leadsAddedByType?.countsByType?.LINKEDIN ?? [],
              MANUAL: charts?.leadsAddedByType?.countsByType?.MANUAL ?? [],
            }}
          />
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <WeeklyLeadsBarChart
            isLoading={loading}
            showFilters={false}
            preset={preset}
            onPresetChange={handlePreset}
            range={range as any}
            onRangeChange={(r) => handleRange((r as any) ?? [null, null])}
            labels={charts?.leadsAddedByType?.labels ?? []}
            countsByType={{
              INSTAGRAM:
                charts?.leadsAddedByType?.countsByType?.INSTAGRAM ?? [],
              LINKEDIN: charts?.leadsAddedByType?.countsByType?.LINKEDIN ?? [],
              MANUAL: charts?.leadsAddedByType?.countsByType?.MANUAL ?? [],
            }}
          />
        </Col>
      </Row>

      {/* Campaign Metrics Chart - Full Width */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <CampaignMetricsChart
            isLoading={loading}
            labels={charts?.campaignsSent?.labels ?? []}
            campaignCount={charts?.campaignsSent?.campaignCount ?? []}
            emailsSent={charts?.campaignsSent?.emailsSent ?? []}
            emailsOpened={charts?.campaignsSent?.emailsOpened ?? []}
            emailsClicked={charts?.campaignsSent?.emailsClicked ?? []}
            preset={preset}
          />
        </Col>
      </Row>

      {/* Leads & Campaigns Tables */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <LeadsTableServer
            onFetch={() => {}}
            user_id=""
            showFilters={false}
            total={data?.data?.recent?.leads?.length ?? 0}
            loading={isFetching}
            value={{
              search: "",
              type: "",
              is_converted: undefined,
              folder_id: "",
              page: 1,
              limit: 10,
            }}
            leads={data?.data?.recent?.leads}
          />
        </Col>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <CampaignsTable
            loading={isFetching}
            data={data?.data?.recent?.campaigns}
            showFilters={false}
          />
        </Col>
      </Row>

      {/* Folders Table - Full Width */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <FolderTable
            loading={isFetching}
            data={data?.data?.recent?.folders}
            showFilters={false}
          />
        </Col>
      </Row>
    </div>
  );
};

export default UserLayout;
