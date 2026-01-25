"use client";

import {
  InstagramScraperCard,
  LinkedInScraperCard,
} from "@/components/ui/scraper-cards";
import { Col, Row } from "antd";
import { useFetchLeadsList, useFetchLeadsSummary } from "./hooks/queries";
import { useUserInfo } from "@/helpers/use-user";
import InsightsCard from "./components/insights";
import WeeklyLeadsAreaChart from "./components/chart";
import Spinner from "@/components/ui/spinner";
import LeadsTableServer from "./components/lead-table";
import { useMemo, useState } from "react";
import {
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useBulkDeleteLeads,
} from "./hooks/mutations";

const LeadsLayout = () => {
  const { id } = useUserInfo();

  const [query, setQuery] = useState({
    page: 1,
    limit: 5, // ✅ start with 5 since your API returns limit 5
    search: "",
    type: "",
    is_converted: undefined as boolean | undefined,
  });

  const { data: summary, isLoading: summaryLoading } = useFetchLeadsSummary({
    limit: 10,
    offset: 0,
    user_id: id,
  });
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const bulkDelete = useBulkDeleteLeads();

  // ✅ IMPORTANT: use query here
  const {
    data: leads,
    isLoading: leadsLoading,
    error: leadsErr,
  } = useFetchLeadsList({
    user_id: id ?? "",
    limit: query.limit,
    page: query.page,
    search: query.search,
    scrape_status: true,
    type: query.type,
    is_converted: query.is_converted,
  });
  if (leadsLoading || summaryLoading) return <Spinner size="large" />;

  const stats = summary?.data?.stats;
  const dailyTotal = summary?.data?.charts?.dailyTotal;

  return (
    <Row gutter={[16, 16]} className="p-5">
      <Row className="w-full">
        <Col className="!w-full">
          <InsightsCard
            stats={stats}
            dailyTotal={dailyTotal}
            loading={summaryLoading || leadsLoading}
          />
          <div style={{ marginTop: 16 }} />
        </Col>
      </Row>

      <Row gutter={[25, 25]}>
        <Col xs={24} sm={12}>
          <LinkedInScraperCard />
        </Col>
        <Col xs={24} sm={12}>
          <InstagramScraperCard />
        </Col>
      </Row>

      <Row className="w-full flex justify-center gap-3 mt-5 ">
        <Col xs={24} lg={11}>
          <WeeklyLeadsAreaChart
            isLoading={summaryLoading || leadsLoading}
            labels={summary?.data?.charts?.dailyByType?.labels}
            countsByType={{
              INSTAGRAM:
                summary?.data?.charts?.dailyByType?.countsByType?.INSTAGRAM,
              LINKEDIN:
                summary?.data?.charts?.dailyByType?.countsByType?.LINKEDIN,
              MANUAL: summary?.data?.charts?.dailyByType?.countsByType?.MANUAL,
            }}
          />
        </Col>
        <Col xs={24} lg={11}>
          <WeeklyLeadsAreaChart
            isLoading={summaryLoading || leadsLoading}
            labels={summary?.data?.charts?.dailyByType?.labels}
            counts={summary?.data?.charts?.dailyTotal?.counts}
          />
        </Col>
      </Row>

      <Row className="w-full">
        <Col className="w-full">
          <LeadsTableServer
            user_id={id ?? ""}
            leads={leads?.data ?? []}
            total={leads?.pagination?.total ?? 0}
            loading={leadsLoading}
            value={query}
            onFetch={(next) => setQuery(next)}
            onCreateLead={(payload) => createLead.mutateAsync(payload)}
            onUpdateLead={(id, payload) =>
              updateLead.mutateAsync({ lead_id: id, ...payload })
            }
            onDeleteOne={(lead) => deleteLead.mutateAsync(lead._id)}
            onDeleteMany={(ids) => bulkDelete.mutateAsync(ids)}
          />
        </Col>
      </Row>
    </Row>
  );
};

export default LeadsLayout;
