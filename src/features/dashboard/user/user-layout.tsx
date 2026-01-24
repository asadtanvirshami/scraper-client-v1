"use client";

import { Col, Row, Space } from "antd";
import LeadsWidget from "./components/leads";
import { useFetchDashboard } from "../hooks/queries";
import WeeklyLeadsAreaChart from "./components/leads/chart";
import Spinner from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

const UserLayout = () => {
  const router = useRouter();
  const { data, isLoading, isError, error } = useFetchDashboard();

  if (isError) console.error(error);

  if (isLoading) {
    return <Spinner size="large" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {/* Left column: Campaigns + Folders */}
      {/* <Col xs={24} lg={8}>
        <Space orientation="vertical" size={16} className="w-full">
          <CampaignCard />
          <FoldersCard />
        </Space>
      </Col> */}

      {/* Right column: Leads (wider) */}
      <Col xs={24} lg={12}>
        <LeadsWidget
          onViewAll={() => router.push("/leads")}
          isLoading={isLoading}
          total={data?.data.totals.leads}
          leads={data?.data.recent.leads}
        />
      </Col>
      <Col xs={24} lg={12}>
        <WeeklyLeadsAreaChart
          isLoading={isLoading}
          labels={data?.data.charts.weeklyLeadsAdded.labels}
          counts={data?.data.charts.weeklyLeadsAdded.counts}
        />
      </Col>
    </Row>
  );
};

export default UserLayout;
