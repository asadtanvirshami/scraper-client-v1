"use client";

import { Col, Row, Card, Typography, Button, theme } from "antd";
import { UsergroupAddOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";

import { useUserInfo } from "@/helpers/use-user";
import Spinner from "@/components/ui (generic)/spinner";

import InsightsCard from "./ui/insights";
import LeadsTableServer from "./ui/lead-table";
import BulkUploadModal from "./form/bulk-upload-modal";

import { useFetchLeadsList, useFetchLeadsSummary } from "./hooks/queries";
import {
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useBulkDeleteLeads,
  useBulkUploadLeads,
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
  const { token } = theme.useToken();

  // ====== TABLE FILTERS (server list) ======
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    type: "",
    is_converted: undefined as boolean | undefined,
  });

  // ====== CHART FILTERS (preset + optional range) ======
  const [preset, setPreset] = useState<PresetKey>("7d");
  const [range, setRange] = useState<MaybeRange>([null, null]);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const safeRange: RangeValue = range ?? [null, null];
  const [from, to] = safeRange;
  const isCustomRange = Boolean(from && to);

  // ====== SUMMARY PARAMS ======
  const summaryParams = useMemo(() => {
    if (!id) return { user_id: "" };
    if (isCustomRange && from && to) {
      return { user_id: id, dateFrom: from.format("YYYY-MM-DD"), dateTo: to.format("YYYY-MM-DD") };
    }
    return { user_id: id, days: PRESET_DAYS[preset] ?? 7 };
  }, [id, isCustomRange, from, to, preset]);

  const isDefaultView = !isCustomRange && preset === "7d";

  // ====== QUERIES ======
  const {
    data: summary,
    isLoading: summaryLoading,
    isFetching: summaryFetching,
  } = useFetchLeadsSummary(summaryParams);

  const { data: leads, isFetching: leadsFetching } = useFetchLeadsList({
    user_id: id ?? "",
    limit: query.limit,
    page: query.page,
    search: query.search,
    type: query.type,
    is_converted: query.is_converted,
  });

  // ====== MUTATIONS ======
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const bulkDelete = useBulkDeleteLeads();
  const bulkUpload = useBulkUploadLeads();

  if (summaryLoading && isDefaultView) {
    return <Spinner size="large" />;
  }

  const chartsLoading = isDefaultView ? summaryLoading : summaryFetching;
  void chartsLoading;

  const stats = summary?.data?.stats;
  const dailyTotal = summary?.data?.charts?.dailyTotal;

  return (
    <div
      style={{
        padding: "20px 20px 40px",
        maxWidth: 1440,
        margin: "0 auto",
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 700, letterSpacing: "-0.02em" }}>
            <UsergroupAddOutlined style={{ marginRight: 10, color: token.colorPrimary }} />
            <FormattedMessage id="leads.page.title" defaultMessage="Leads" />
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            <FormattedMessage
              id="leads.page.subtitle"
              defaultMessage="Manage, track and bulk-import your leads."
            />
          </Text>
        </div>

        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setBulkUploadOpen(true)}
        >
          <FormattedMessage id="leads.actions.bulk_import" defaultMessage="Bulk Import" />
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* Insights */}
        <Col xs={24}>
          <Card>
            <div className="flex flex-col gap-1 mb-4">
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
            <InsightsCard stats={stats} dailyTotal={dailyTotal} />
          </Card>
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
            showFileUpload={false}
            onCreateLead={async (payload: any) => {
              await createLead.mutateAsync(payload as any);
            }}
            onUpdateLead={async (leadId: string, payload: any) => {
              await updateLead.mutateAsync({
                lead_id: leadId,
                user_id: id ?? "",
                ...payload,
              });
            }}
            onDeleteOne={async (lead: any) => {
              await deleteLead.mutateAsync({
                lead_id: (lead as any)._id,
                user_id: id ?? "",
              });
            }}
            onDeleteMany={async (ids: string[]) => {
              await bulkDelete.mutateAsync({ lead_ids: ids, user_id: id ?? "" });
            }}
            onBulkUpload={async (payload: any) => {
              await bulkUpload.mutateAsync(payload);
            }}
          />
        </Col>
      </Row>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        user_id={id ?? ""}
        onBulkUpload={async (payload: any) => {
          await bulkUpload.mutateAsync(payload);
          setBulkUploadOpen(false);
        }}
      />
    </div>
  );
};

export default LeadsLayout;

