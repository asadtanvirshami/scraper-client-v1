"use client";

import {
  Col,
  Row,
  Typography,
  Button,
  Modal,
  Table,
  message,
  Space,
  Breadcrumb,
} from "antd";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { FolderOpenOutlined, UploadOutlined } from "@ant-design/icons";
import Link from "next/link";

import Spinner from "@/components/ui (generic)/spinner";
import { useFetchFolders } from "@/features/folders/hooks/queries";

// reuse your existing table component if it's generic enough
import LeadsTableServer from "@/features/leads/ui/lead-table";
import BulkUploadModal from "@/features/leads/form/bulk-upload-modal";
// reuse your queries/mutations (adjust path if needed)
import { useFetchLeadsList } from "@/features/leads/hooks/queries";
import {
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useBulkDeleteLeads,
  useBulkUploadLeads,
} from "@/features/leads/hooks/mutations";
import { useUserInfo } from "@/helpers/use-user";

const { Title, Text } = Typography;

type Props = {
  folderId: string;
  folderName?: string;
};

export default function FolderParamsLayout({ folderId, folderName }: Props) {
  const { id } = useUserInfo();

  // ====== TABLE FILTERS (server list) ======
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    type: "",
    is_converted: undefined as boolean | undefined,
  });

  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  // ✅ Fetch leads filtered by folder_id
  const { data: leads, isFetching } = useFetchLeadsList({
    folder_id: folderId,
    limit: query.limit,
    page: query.page,
    search: query.search,
    user_id: id ?? "",
    type: query.type,
    is_converted: query.is_converted,
  } as any);

  // ====== MUTATIONS ======
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const bulkDelete = useBulkDeleteLeads();
  const bulkUpload = useBulkUploadLeads();

  if (!folderId) return <Spinner size="large" />;

  const { data: foldersResp } = useFetchFolders({ limit: 1000 });
  const foldersList = ((foldersResp as any)?.folders ?? foldersResp?.data ?? []) as any[];
  const folder = foldersList.find((f) => (f as any)?._id === folderId) as any | undefined;

  const displayName = folderName ?? folder?.name ?? `Folder`;

  return (
    <div className="p-4 lg:p-6">
      {/* Breadcrumb */}
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          { title: <Link href="/dashboard">Dashboard</Link> },
          { title: <Link href="/folders">Folders</Link> },
          { title: displayName },
        ]}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <Space align="center" style={{ marginBottom: 4 }}>
            <FolderOpenOutlined style={{ fontSize: 20, color: "#8b5cf6" }} />
            <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
              {displayName}
            </Title>
          </Space>
          <Text type="secondary" style={{ fontSize: 13 }}>
            <FormattedMessage
              id="folders.details.subtitle"
              defaultMessage="View and manage leads inside this folder."
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
        <Col xs={24}>
          <LeadsTableServer
            folder_id={folderId}
            user_id={id ?? ""}
            leads={leads?.data ?? []}
            total={leads?.pagination?.total ?? 0}
            loading={isFetching}
            value={query}
            showFileUpload={false}
            onFetch={(next) => setQuery(next as any)}
            onCreateLead={async (payload: any) => {
              await createLead.mutateAsync({ ...payload, folder_id: folderId } as any);
            }}
            onUpdateLead={async (leadId, payload) => {
              await updateLead.mutateAsync({
                lead_id: leadId,
                user_id: id ?? "",
                ...payload,
              } as any);
            }}
            onDeleteOne={async (lead) => {
              await deleteLead.mutateAsync({
                lead_id: (lead as any)._id,
                user_id: id ?? "",
              });
            }}
            onDeleteMany={async (ids) => {
              await bulkDelete.mutateAsync({ lead_ids: ids, user_id: id ?? "" });
            }}
          />
        </Col>
      </Row>

      {/* Bulk Import Modal */}
      <BulkUploadModal
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        user_id={id ?? ""}
        onBulkUpload={async (payload: any) => {
          await bulkUpload.mutateAsync({ ...payload, folder_id: folderId });
          setBulkUploadOpen(false);
        }}
      />
    </div>
  );
}

