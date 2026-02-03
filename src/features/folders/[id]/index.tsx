"use client";

import { Col, Row, Card, Typography } from "antd";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import Spinner from "@/components/ui (generic)/spinner";

// reuse your existing table component if it's generic enough
import LeadsTableServer from "@/features/leads/ui/lead-table";

// reuse your queries/mutations (adjust path if needed)
import { useFetchLeadsList } from "@/features/leads/hooks/queries";
import {
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useBulkDeleteLeads,
} from "@/features/leads/hooks/mutations";
import { useUserInfo } from "@/helpers/use-user";

const { Title, Text } = Typography;

type Props = {
  folderId: string;
};

export default function FolderParamsLayout({ folderId }: Props) {

  const { id } = useUserInfo();

  // ====== TABLE FILTERS (server list) ======
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    type: "",
    is_converted: undefined as boolean | undefined,
  });

  // ✅ Fetch leads filtered by folder_id
  const { data: leads, isFetching } = useFetchLeadsList({
    folder_id: folderId, // ✅ this is what you want
    limit: query.limit,
    page: query.page,
    search: query.search,
    scrape_status: true,
    user_id: id ?? "",
    type: query.type,
    is_converted: query.is_converted,
  } as any);

  // ====== MUTATIONS ======
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const bulkDelete = useBulkDeleteLeads();

  // optional initial loader
  if (!folderId) return <Spinner size="large" />;

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-4">
        <Title level={4} className="!mb-1">
          <FormattedMessage
            id="folders.details.title"
            defaultMessage="Folder"
          />
        </Title>
        <Text type="secondary">
          <FormattedMessage
            id="folders.details.subtitle"
            defaultMessage="View and manage leads inside this folder."
          />
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <LeadsTableServer
            leads={leads?.data ?? []}
            total={leads?.pagination?.total ?? 0}
            loading={isFetching}
            value={query}
            onFetch={(next) => setQuery(next as any)}
            onCreateLead={(payload) =>
              createLead.mutateAsync({ ...payload, folder_id: folderId } as any)
            }
            onUpdateLead={(leadId, payload) =>
              updateLead.mutateAsync({ lead_id: leadId, ...payload } as any)
            }
            onDeleteOne={(lead) => deleteLead.mutateAsync((lead as any)._id)}
            onDeleteMany={(ids) => bulkDelete.mutateAsync(ids)}
          />
        </Col>
      </Row>
    </div>
  );
}
