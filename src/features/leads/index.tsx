"use client";

import { Col, Row, Card, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";

import { useUserInfo } from "@/helpers/use-user";
import Spinner from "@/components/ui (generic)/spinner";

import InsightsCard from "./ui/insights";
import WeeklyLeadsAreaChart from "./ui/chart/area-chart";
import LeadsTableServer from "./ui/lead-table";

import { useFetchLeadsList, useFetchLeadsSummary } from "./hooks/queries";
import {
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useBulkDeleteLeads,
} from "./hooks/mutations";

const { Title, Text } = Typography;

type PresetKey = "7d" | "14d" | "30d" | "90d";
type RangeValue = [Dayjs | null, Dayjs | null];
type MaybeRange = RangeValue | null;

const PRESET_DAYS: Record<PresetKey, number> = {
  "7d": 7,
  "14d": 14,
  "30d": 30,
  "90d": 90,
};

const LeadsLayout = () => {
  const { id } = useUserInfo();

  // ====== TABLE FILTERS (server list) ======
  const [query, setQuery] = useState({
    page: 1,
    limit: 5,
    search: "",
    type: "",
    is_converted: undefined as boolean | undefined,
  });

  // ====== CHART FILTERS (preset + optional range) ======
  const [preset, setPreset] = useState<PresetKey>("7d");
  const [range, setRange] = useState<MaybeRange>([null, null]);

  const safeRange: RangeValue = range ?? [null, null];
  const [from, to] = safeRange;

  const isCustomRange = Boolean(from && to);

  // ====== SUMMARY PARAMS (wire to chart filters) ======
  const summaryParams = useMemo(() => {
    if (!id) return { user_id: "" };

    if (isCustomRange && from && to) {
      return {
        user_id: id,
        dateFrom: from.format("YYYY-MM-DD"),
        dateTo: to.format("YYYY-MM-DD"),
      };
    }

    return {
      user_id: id,
      days: PRESET_DAYS[preset] ?? 7,
    };
  }, [id, isCustomRange, from, to, preset]);

  // Full-page spinner only on initial/default load
  const isDefaultView = !isCustomRange && preset === "7d";

  // ====== QUERIES ======
  const {
    data: summary,
    isLoading: summaryLoading,
    isFetching: summaryFetching,
  } = useFetchLeadsSummary(summaryParams);

  const {
    data: leads,
    isFetching: leadsFetching,
  } = useFetchLeadsList({
    user_id: id ?? "",
    limit: query.limit,
    page: query.page,
    search: query.search,
    scrape_status: true,
    type: query.type,
    is_converted: query.is_converted,
  });

  // ====== MUTATIONS ======
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const bulkDelete = useBulkDeleteLeads();

  // Full-page spinner ONLY on first load
  if ((summaryLoading ) && isDefaultView) {
    return <Spinner size="large" />;
  }

  // Charts/insights show fetching when filters change
  const chartsLoading = isDefaultView ? summaryLoading : summaryFetching;

  const stats = summary?.data?.stats;
  const dailyTotal = summary?.data?.charts?.dailyTotal;

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4">
        <Title level={4} className="!mb-1">
          <FormattedMessage id="leads.page.title" defaultMessage="Leads" />
        </Title>
        <Text type="secondary">
          <FormattedMessage
            id="leads.page.subtitle"
            defaultMessage="Manage and track your leads."
          />
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {/* Insights (wired to same chart filters) */}
        <Col xs={24}>
          <Card>
            <div className="flex flex-col gap-1">
              <Title level={5} className="!mb-0">
                <FormattedMessage id="leads.insights.title" defaultMessage="Insights" />
              </Title>
              <Text type="secondary">
                <FormattedMessage
                  id="leads.insights.subtitle"
                  defaultMessage="Pick a date range to update charts & insights."
                />
              </Text>
            </div>

            <div className="mt-4">
              <InsightsCard stats={stats} dailyTotal={dailyTotal} />
            </div>
          </Card>
        </Col>

        {/* Charts */}
        <Col xs={24} lg={12}>
          {/* NOTE: WeeklyLeadsAreaChart already renders its own Card + filters */}
          <WeeklyLeadsAreaChart
            isLoading={chartsLoading}
            labels={summary?.data?.charts?.dailyByType?.labels}
            countsByType={{
              INSTAGRAM: summary?.data?.charts?.dailyByType?.countsByType?.INSTAGRAM,
              LINKEDIN: summary?.data?.charts?.dailyByType?.countsByType?.LINKEDIN,
              MANUAL: summary?.data?.charts?.dailyByType?.countsByType?.MANUAL,
            }}
            // ✅ wire filters
            showFilters
            preset={preset}
            onPresetChange={(p) => {
              setPreset(p);
              setRange([null, null]); // preset becomes source of truth
            }}
            range={safeRange}
            onRangeChange={(r) => {
              setRange(r);
              // if user sets a custom range, keep preset as-is but range wins in summaryParams
            }}
            showRangePicker
          />
        </Col>

        <Col xs={24} lg={12}>
          {/* Second chart shares same filter state but hides duplicate controls */}
          <WeeklyLeadsAreaChart
            isLoading={chartsLoading}
            labels={summary?.data?.charts?.dailyTotal?.labels}
            counts={summary?.data?.charts?.dailyTotal?.counts}
            // ✅ share same state, but no duplicate controls
            showFilters={false}
            preset={preset}
            range={safeRange}
          />
        </Col>

        {/* Table */}
        <Col xs={24}>
          <LeadsTableServer
            user_id={id ?? ""}
            leads={leads?.data ?? []}
            total={leads?.pagination?.total ?? 0}
            loading={leadsFetching}
            value={query}
            onFetch={(next) => setQuery(next as any)}
            onCreateLead={(payload) => createLead.mutateAsync(payload as any)}
            onUpdateLead={(leadId, payload) =>
              updateLead.mutateAsync({ lead_id: leadId, ...payload })
            }
            onDeleteOne={(lead) => deleteLead.mutateAsync((lead as any)._id)}
            onDeleteMany={(ids) => bulkDelete.mutateAsync(ids)}
          />
        </Col>
      </Row>
    </div>
  );
};

export default LeadsLayout;
