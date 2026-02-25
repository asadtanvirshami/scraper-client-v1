"use client";

import React, { useMemo, useState } from "react";
import { Col, Row } from "antd";
import Spinner from "@/components/ui (generic)/spinner";
import dayjs, { Dayjs } from "dayjs";
import { useIntl } from "react-intl";

import { useFetchDashboard } from "@/features/dashboard/hooks/queries";
import FilterHeader from "@/features/dashboard/ui/widgets/filter-header";
import UsersCreatedBarChart from "@/features/user/ui/bar-chart";
import UsersTableServer from "@/features/user/ui/table";
import AdminKpis from "../widgets/a-kpi-row";

import BugsTableServer, { BugItem } from "@/features/bugs/ui/table";
import FeedbacksTableServer, { FeedbackItem } from "@/features/feedbacks/ui/table";

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
  padding: 16,
  minHeight: "100vh",
};

const AdminLayout = ({ id }: { id: string }) => {
  const intl = useIntl();

  // ✅ filters (same as UserLayout)
  const [preset, setPreset] = useState<PresetKey>("7d");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);

  const todayStr = dayjs().format("YYYY-MM-DD");

  // ✅ params driven by range OR preset (same as UserLayout)
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
  }, [range, preset, id]);

  const isTodayOnly = useMemo(() => {
    const [from, to] = range;
    if (!from || !to) return true;
    return (
      from.format("YYYY-MM-DD") === todayStr &&
      to.format("YYYY-MM-DD") === todayStr
    );
  }, [range, todayStr]);

  // ✅ query (NOW affects everything)
  const { data, isLoading, isFetching } = useFetchDashboard(params);

  // ✅ full page spinner only on first load
  if (isLoading && isTodayOnly) return <Spinner size="large" />;

  const totals = data?.data?.totals;
  const insights = data?.data?.insights;
  const charts = data?.data?.charts;
  const recent = data?.data?.recent;

  // ✅ loading on refetch (same as UserLayout)
  const loading = isTodayOnly ? isLoading : isFetching;

  // ✅ central handlers (same as UserLayout)
  const handlePreset = (p: PresetKey) => {
    setPreset(p);
    setRange([null, null]); // preset becomes source of truth
  };

  const handleRange = (r: [Dayjs | null, Dayjs | null]) => {
    setRange(r ?? [null, null]);
  };

  // ✅ normalize recent arrays
  const recentUsers = useMemo(() => recent?.users ?? [], [recent?.users]);
  const recentBugs: BugItem[] = useMemo(() => recent?.bugs ?? [], [recent?.bugs]);
  const recentFeedbacks: FeedbackItem[] = useMemo(
    () => recent?.feedbacks ?? [],
    [recent?.feedbacks],
  );

  return (
    <div style={pageStyle}>
      <FilterHeader
        title={intl.formatMessage({
          id: "admin.panel_title",
          defaultMessage: "Administration Panel",
        })}
        subtitle={intl.formatMessage({
          id: "admin.panel_subtitle",
          defaultMessage: "Monitor users, access, and system activity.",
        })}
        ctaHref="/users"
        PRESETS={PRESETS}
        preset={preset}
        setPreset={handlePreset}
        range={range}
        setRange={handleRange}
      />

      {/* ✅ KPIs update with filters */}
      <AdminKpis loading={loading} totals={totals} insights={insights} />

      {/* ✅ Chart updates with filters */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={24}>
          <UsersCreatedBarChart
            isLoading={loading}
            labels={charts?.usersCreated?.labels ?? []}
            counts={charts?.usersCreated?.counts ?? []}
          />
        </Col>
      </Row>

      {/* ✅ Recent users */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={24}>
          <UsersTableServer
            data={recentUsers}
            total={recentUsers.length}
            loading={isFetching}
            showFilters={false}
            onFetch={() => {}}
            value={{
              page: 1,
              limit: 10,
              search: "",
              role: "",
              is_verified: undefined,
              is_blocked: undefined,
              auth_provider: "",
            }}
          />
        </Col>
      </Row>

      {/* ✅ Recent bugs + feedbacks */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={12}>
          <BugsTableServer
            bugs={recentBugs}
            total={recentBugs.length}
            loading={isFetching}
            showFilters={false}
            onFetch={() => {}}
            value={{
              page: 1,
              limit: 10,
              search: "",
              user_id: id ?? "",
            }}
          />
        </Col>

        <Col xs={24} lg={12}>
          <FeedbacksTableServer
            feedbacks={recentFeedbacks}
            total={recentFeedbacks.length}
            loading={isFetching}
            showFilters={false}
            onFetch={() => {}}
            value={{
              page: 1,
              limit: 10,
              search: "",
              user_id: id ?? "",
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AdminLayout;
