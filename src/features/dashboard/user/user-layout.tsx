"use client";

import { Col, Row, DatePicker, Card, Statistic } from "antd";
import LeadsWidget from "./components/leads";
import WeeklyLeadsAreaChart from "./components/leads/chart";
import Spinner from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import {
  InstagramScraperCard,
  LinkedInScraperCard,
} from "@/components/ui/scraper-cards";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { useFetchDashboard } from "../hooks/queries";

const { RangePicker } = DatePicker;

const UserLayout = () => {
  const router = useRouter();

  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const todayStr = dayjs().format("YYYY-MM-DD");

  const params = useMemo(() => {
    const [from, to] = range;
    if (!from || !to) return { days: 7 }; // default
    return {
      dateFrom: from.format("YYYY-MM-DD"),
      dateTo: to.format("YYYY-MM-DD"),
    };
  }, [range]);

  const isTodayOnly = useMemo(() => {
    const [from, to] = range;
    if (!from || !to) return true; // treat "no range" like default full load
    return from.format("YYYY-MM-DD") === todayStr && to.format("YYYY-MM-DD") === todayStr;
  }, [range, todayStr]);

  const { data, isLoading, isFetching } = useFetchDashboard(params);

  // ✅ Full page spinner ONLY for initial load / today-only / no-range
  if (isLoading && isTodayOnly) return <Spinner size="large" />;

  const totals = data?.data?.totals;
  const insights = data?.data?.insights;

  // ✅ component-level loading when custom range
  const componentLoading = isTodayOnly ? isLoading : isFetching;

  return (
    <Row gutter={[16, 16]}>
      {/* ✅ Header row: Date Range + "big work" stats */}
      <Row className="w-full" gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <RangePicker
            className="w-full"
            allowClear
            onChange={(v) => setRange(v as any)}
          />
        </Col>

        <Col xs={24} lg={14}>
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Card>
                <Statistic title="Total Leads" value={totals?.leads ?? 0} />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic title="Converted" value={totals?.converted ?? 0} />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic title="Conv. Rate" value={`${totals?.conversionRate ?? 0}%`} />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card>
                <Statistic title="Avg / day" value={insights?.avgLeadsPerDay ?? 0} />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* ✅ main content */}
      <Row gutter={[16, 16]} className="w-full">
        <Col xs={24} lg={12}>
          <div style={{ marginTop: 16 }}>
            <LeadsWidget
              onViewAll={() => router.push("/leads")}
              isLoading={componentLoading}
              total={totals?.leads}
              leads={data?.data?.recent?.leads}
            />
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <WeeklyLeadsAreaChart
            isLoading={componentLoading}
            labels={data?.data?.charts?.leadsAddedByType?.labels}
            countsByType={{
              INSTAGRAM: data?.data?.charts?.leadsAddedByType?.countsByType?.INSTAGRAM,
              LINKEDIN: data?.data?.charts?.leadsAddedByType?.countsByType?.LINKEDIN,
              MANUAL: data?.data?.charts?.leadsAddedByType?.countsByType?.MANUAL,
            }}
          />
        </Col>
      </Row>

      <Row gutter={[25, 25]} className="w-full">
        <Col xs={24} sm={12}>
          <LinkedInScraperCard />
        </Col>
        <Col xs={24} sm={12}>
          <InstagramScraperCard />
        </Col>
      </Row>
    </Row>
  );
};

export default UserLayout;
