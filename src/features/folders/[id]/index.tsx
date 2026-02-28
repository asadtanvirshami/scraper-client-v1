"use client";

import {
  Col,
  Row,
  Card,
  Typography,
  Button,
  Modal,
  Table,
  message,
} from "antd";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import Spinner from "@/components/ui (generic)/spinner";
import { useFetchFolders } from "@/features/folders/hooks/queries";

// reuse your existing table component if it's generic enough
import LeadsTableServer from "@/features/leads/ui/lead-table";
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
  const bulkUpload = useBulkUploadLeads();

  // preview / import states
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });

  // optional initial loader
  if (!folderId) return <Spinner size="large" />;

  // fetch folders and find the current folder name (best-effort)
  const { data: foldersResp } = useFetchFolders({ limit: 1000 });
  console.log(foldersResp);

  const foldersList = ((foldersResp as any)?.folders ??
    foldersResp?.data ??
    []) as any[];
  const folder = foldersList.find((f) => (f as any)?._id === folderId) as
    | any
    | undefined;

  const extract = (rows: any[]) => {
    const mapped = rows.map((r: any) => {
      const name =
        r.name ||
        r.Name ||
        r.full_name ||
        r.FullName ||
        `${r.first_name || ""} ${r.last_name || ""}`.trim();

      const email =
        r.email || r.Email || (Array.isArray(r.emails) ? r.emails[0] : "");

      const phone =
        r.phone ||
        r.Phone ||
        (Array.isArray(r.phone_numbers) ? r.phone_numbers[0] : "");

      const company =
        r.company || r.Company || r.organization || r.Organization || "";

      const title =
        r.title || r.position || r.Title || r.Position || r.job_title || "";

      return {
        name: String(name || "").trim(),
        email: String(email || "").trim(),
        phone: String(phone || "").trim(),
        company: String(company || "").trim(),
        title: String(title || "").trim(),
      };
    });

    if (!mapped.length) {
      message.warning("No valid rows found in file");
      return;
    }

    setPreviewRows(mapped);
    setPreviewVisible(true);
  };

  const handleFileSelect = (file?: File) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();

    if (ext === "csv") {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split(/\r?\n/).filter(Boolean);
        const headers = rows[0].split(",").map((h) => h.trim());
        const data = rows.slice(1).map((r) => {
          const values = r.split(",");
          const obj: any = {};
          headers.forEach((h, i) => (obj[h] = values[i]?.trim() ?? ""));
          return obj;
        });
        console.log("Parsed CSV rows:", data);
        extract(data);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      // dynamic import of SheetJS (xlsx)
      import("xlsx")
        .then((XLSX) => {
          reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = (XLSX as any).read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = (XLSX as any).utils.sheet_to_json(sheet, {
              defval: "",
            }) as any[];
            console.log("Parsed XLSX rows:", json);
            extract(json);
          };
          reader.readAsArrayBuffer(file);
        })
        .catch((err) => {
          console.error("Failed to load xlsx parser:", err);
        });
    } else {
      alert("Unsupported file type. Please upload .csv or .xlsx");
    }
  };

  const importRows = async () => {
    if (!previewRows.length) return;

    setImporting(true);
    console.log(previewRows);

    try {
      const transformed = previewRows
        .map((r: any) => {
          // Support Excel schema directly
          const first_name = r.first_name || "";
          const last_name = r.last_name || "";

          const emails = r.emails
            ? String(r.emails)
                .split(",")
                .map((e: string) => e.trim())
            : [];

          const phone_numbers = r.phone_numbers
            ? String(r.phone_numbers)
                .split(",")
                .map((p: string) => p.trim())
            : [];

          return {
            first_name,
            last_name,
            emails,
            phone_numbers,
            company: r.company || "",
            job_title: r.job_title || "",
            message: r.message || "",
            type: r.type || "MANUAL",
            is_converted: r.is_converted === true || r.is_converted === "TRUE",
            scrape_status:
              r.scrape_status === true || r.scrape_status === "TRUE",
            folder_id: folderId,
            user_id: id ?? "",
          };
        })
        // remove completely empty rows
        .filter(
          (row) =>
            row.first_name ||
            row.last_name ||
            row.emails.length ||
            row.phone_numbers.length,
        );

      if (!transformed.length) {
        message.warning("No valid rows found");
        setImporting(false);
        return;
      }

      await bulkUpload.mutateAsync({
        folder_id: folderId,
        user_id: id ?? "",
        leads: transformed,
      });

      message.success(`Imported ${transformed.length} rows`);
    } catch (err) {
      console.error(err);
      message.error("Bulk upload failed");
    } finally {
      setImporting(false);
      setPreviewVisible(false);
    }
  };

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
        <Title level={5} className="!mb-1">
          {folderName ?? folder?.name ?? `Folder ${folderId}`}
        </Title>
      </div>

      <Row gutter={[16, 16]}>
        {/* <Col xs={24}>
          <Card size="small" className="mb-4">
            <Text type="secondary">
              Upload a CSV or XLSX to import leads (console logs extracted
              fields).
            </Text>
            <div className="mt-3">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
            </div>
          </Card>
        </Col> */}
        <Col xs={24}>
          <LeadsTableServer
            leads={leads?.data ?? []}
            total={leads?.pagination?.total ?? 0}
            loading={isFetching}
            value={query}
            showFileUpload
            onFetch={(next) => setQuery(next as any)}
            onCreateLead={async (payload: any) => {
              await createLead.mutateAsync({
                ...payload,
                folder_id: folderId,
              } as any);
            }}
            onUpdateLead={async (leadId, payload) => {
              await updateLead.mutateAsync({
                lead_id: leadId,
                ...payload,
              } as any);
            }}
            onDeleteOne={async (lead) => {
              await deleteLead.mutateAsync((lead as any)._id);
            }}
            onDeleteMany={async (ids) => {
              await bulkDelete.mutateAsync(ids);
            }}
          />
        </Col>
      </Row>
      <Modal
        title={`Import Preview (${previewRows.length})`}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setPreviewVisible(false)}
            disabled={importing}
          >
            Cancel
          </Button>,
          <Button
            key="import"
            type="primary"
            loading={importing}
            onClick={importRows}
          >
            {importing
              ? `Importing (${importProgress.done}/${importProgress.total})`
              : "Import"}
          </Button>,
        ]}
      >
        <Table
          dataSource={previewRows.map((r, i) => ({ key: i, ...r }))}
          pagination={{ pageSize: 5 }}
          rowKey={(r) => r.key}
          columns={[
            { title: "Name", dataIndex: "name", key: "name" },
            { title: "Email", dataIndex: "email", key: "email" },
            { title: "Phone", dataIndex: "phone", key: "phone" },
            { title: "Company", dataIndex: "company", key: "company" },
            { title: "Title", dataIndex: "title", key: "title" },
          ]}
        />
      </Modal>
    </div>
  );
}
