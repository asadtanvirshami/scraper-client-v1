"use client";

import React, { useMemo, useState } from "react";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import { usePathname, useRouter } from "next/navigation";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Input,
  Popconfirm,
  message,
  Alert,
  Avatar,
  Dropdown,
  Modal,
  Select,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  UploadOutlined,
  UsergroupAddOutlined,
  EyeOutlined,
  UserOutlined,
  MoreOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";

import type { Lead } from "@/types/leads";
import { getLeadAvatarSrc } from "@/features/leads/utils/avatar";
import { useAppDrawer } from "@/components/layout/app-drawer/user-app-drawer";
import TableHeaderTitle from "@/components/ui (generic)/table-header-title";
import LeadForm from "../../form";
import { useDownloadAllLeads, useBulkUploadLeads, useUpdateLead, useBulkUpdateScrappedLeads, useDeleteLead, useBulkDeleteLeads } from "../../hooks/mutations";
import { useFetchFolders } from "@/features/folders/hooks/queries";

type ServerFilters = {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  is_converted?: boolean | undefined;
  folder_id?: string;
};

type Props = {
  user_id?: string;
  leads?: Lead[];
  total?: number;
  loading?: boolean;
  folder_id?: string;
  value: ServerFilters;
  onFetch: (filters: ServerFilters) => void;

  onDeleteOne?: (lead: Lead) => Promise<void> | void;
  onDeleteMany?: (ids: string[]) => Promise<void> | void;

  onCreateLead?: (payload: Partial<any>) => Promise<void> | void;
  onUpdateLead?: (id: string, payload: Partial<any>) => Promise<void> | void;
  onBulkUpload?: (payload: any) => Promise<void> | void;

  /** ✅ NEW: if false => hide toolbar + table filters + pagination + selection */
  showFilters?: boolean;
  /** ✅ Show file upload input */
  showFileUpload?: boolean;
  showModernFileUpload?: boolean;
  showProfileAvatar?: boolean;
  /** ✅ Custom card styling for flexible height */
  cardStyle?: React.CSSProperties;
};

const LeadsTableServer: React.FC<Props> = ({
  folder_id,
  user_id,
  leads = [],
  total = 0,
  loading = false,
  value,
  onFetch,
  onDeleteOne,
  onDeleteMany,
  onCreateLead,
  onUpdateLead,
  onBulkUpload,
  showFilters = true,
  showFileUpload = false,
  showModernFileUpload = false,
  showProfileAvatar = false,
  cardStyle,
}) => {
  const { Text } = Typography;
  const intl = useIntl();
  const router = useRouter();
  const pathname = usePathname();
  const isFolderRoute = pathname?.startsWith("/folders");

  const { openDrawer, closeDrawer } = useAppDrawer();
  const download = useDownloadAllLeads();
  const bulkUpload = useBulkUploadLeads();
  const updateLead = useUpdateLead();
  const bulkUpdateScrappedLeads = useBulkUpdateScrappedLeads();
  const deleteLead = useDeleteLead();
  const bulkDeleteLeads = useBulkDeleteLeads();

  const { data: foldersResp } = useFetchFolders({ user_id, page: 1, limit: 1000 } as any);
  const folderOptions = useMemo(() => {
    const folders = ((foldersResp as any)?.folders ?? (foldersResp as any)?.data ?? []) as Array<{ _id?: string; id?: string; name?: string }>;
    return folders.map((f) => ({ value: String(f._id ?? f.id ?? ""), label: f.name ?? "Untitled folder" })).filter((o) => o.value);
  }, [foldersResp]);

  const [sendToFolderLead, setSendToFolderLead] = useState<Lead | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [sendingToFolder, setSendingToFolder] = useState(false);
  const [bulkMoveModalOpen, setBulkMoveModalOpen] = useState(false);

  const filters = value;
  const activeFolderId = filters.folder_id || folder_id;
  const canDownloadLeads = !loading && total > 0;

  // Folder options filtered to exclude the folder the lead is already in
  const filteredFolderOptions = useMemo(() => {
    if (!sendToFolderLead) return folderOptions;
    const currentFolderId = String(
      (sendToFolderLead as any).folder_id?._id ??
      (sendToFolderLead as any).folder_id ??
      ""
    );
    if (!currentFolderId) return folderOptions;
    return folderOptions.filter((o) => o.value !== currentFolderId);
  }, [folderOptions, sendToFolderLead]);

  const bulkMoveFolderOptions = useMemo(() => {
    if (!activeFolderId) return folderOptions;
    return folderOptions.filter((o) => o.value !== activeFolderId);
  }, [activeFolderId, folderOptions]);

  // File upload states
  const [uploading, setUploading] = useState(false);

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  React.useEffect(() => setSearchDraft(filters.search ?? ""), [filters.search]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const antdFilteredValue = useMemo(() => {
    if (!showFilters) {
      return { type: null, is_converted: null };
    }

    return {
      type: filters.type ? [filters.type] : null,
      is_converted:
        typeof filters.is_converted === "boolean"
          ? [String(filters.is_converted)]
          : null,
    };
  }, [filters.type, filters.is_converted, showFilters]);

  const fetchNow = (next: Partial<ServerFilters>) => {
    onFetch({ ...filters, ...next });
  };

  const applySearch = () => {
    const term = (searchDraft || "").trim();
    if ((filters.search || "") === term) return;
    fetchNow({ page: 1, search: term });
  };

  const resetAll = () => {
    setSelectedRowKeys([]);
    setSearchDraft("");

    onFetch({
      page: 1,
      limit: filters.limit ?? 10,
      search: "",
      type: "",
      is_converted: undefined,
      folder_id: activeFolderId,
    });
  };

  // ✅ download all (CSV)
  const downloadAll = () => {
    if (!canDownloadLeads) return;

    download.mutate({
      user_id,
      search: filters.search,
      type: (filters.type as any) || "",
      is_converted: filters.is_converted,
      folder_id: activeFolderId,
    } as any);
  };

  const openAddDrawer = () => {
    openDrawer({
      title: intl.formatMessage({ id: "leads.drawer.add_title" }),
      width: 520,
      content: (
        <LeadForm
          mode="create"
          onClose={closeDrawer}
          // ✅ force the folder in folder route (and still allow prefill otherwise if provided)
          initialValues={{
            folder_id: folder_id || undefined,
          }}
          // ✅ NEW props (you’ll add these in LeadForm)
          enableFolderFetch={!isFolderRoute}
          hideFolderSelect={isFolderRoute}
          fixedFolderId={isFolderRoute ? folder_id : undefined}
          onSubmit={async (payload) => {
            try {
              const finalPayload =
                isFolderRoute && folder_id
                  ? { ...payload, folder_id } // ✅ guarantee it
                  : payload;

              if (onCreateLead) await onCreateLead(finalPayload);
              message.success(intl.formatMessage({ id: "commons.saved" }));
              closeDrawer();
              fetchNow({});
            } catch {
              message.error(intl.formatMessage({ id: "commons.save_failed" }));
            }
          }}
        />
      ),
    });
  };

  const openEditDrawer = (lead: Lead) => {
    openDrawer({
      title: intl.formatMessage({ id: "leads.drawer.edit_title" }),
      width: 520,
      content: (
        <LeadForm
          mode="edit"
          // ✅ default folder_id in edit too
          initialValues={{
            ...lead,
            folder_id: isFolderRoute ? folder_id : (lead as any).folder_id,
          }}
          onClose={closeDrawer}
          // ✅ NEW props
          enableFolderFetch={!isFolderRoute}
          hideFolderSelect={isFolderRoute}
          fixedFolderId={isFolderRoute ? folder_id : undefined}
          onSubmit={async (payload) => {
            try {
              const id = String((lead as any)._id);

              const finalPayload =
                isFolderRoute && folder_id
                  ? { ...payload, folder_id } // ✅ guarantee it
                  : payload;

              if (onUpdateLead)
                await onUpdateLead(id, { _id: id, ...finalPayload });
              message.success(intl.formatMessage({ id: "commons.saved" }));
              closeDrawer();
              fetchNow({});
            } catch (e) {
              message.error(intl.formatMessage({ id: "commons.save_failed" }));
            }
          }}
        />
      ),
    });
  };

  const doDeleteOne = async (lead: Lead) => {
    const leadId = String((lead as any)._id ?? "");
    if (!leadId) return;
    try {
      if (onDeleteOne) {
        await onDeleteOne(lead);
      } else {
        await deleteLead.mutateAsync({ lead_id: leadId, user_id });
      }
      message.success(intl.formatMessage({ id: "commons.deleted" }));
      fetchNow({});
    } catch {
      message.error(intl.formatMessage({ id: "commons.delete_failed" }));
    }
  };

  const doDeleteSelected = async () => {
    const ids = selectedRowKeys.map(String);
    if (!ids.length) return;

    try {
      if (onDeleteMany) {
        await onDeleteMany(ids);
      } else {
        await bulkDeleteLeads.mutateAsync({ lead_ids: ids, user_id });
      }
      message.success(
        `${intl.formatMessage({ id: "commons.deleted" })} ${ids.length}`,
      );
      setSelectedRowKeys([]);
      fetchNow({ page: 1 });
    } catch {
      message.error(intl.formatMessage({ id: "commons.bulk_delete_failed" }));
    }
  };

  const openViewPage = (lead: Lead) => {
    const leadId = String((lead as any)?._id || "");
    if (!leadId) return;

    const typeRaw = String((lead as any)?.type || "").toUpperCase();
    const type =
      typeRaw === "INSTAGRAM"
        ? "Instagram"
        : typeRaw === "LINKEDIN"
          ? "LinkedIn"
          : "Manual";

    router.push(`/leads/${leadId}?type=${encodeURIComponent(type)}`);
  };

  const doSendToFolder = async () => {
    if (!sendToFolderLead || !selectedFolderId) return;
    setSendingToFolder(true);
    try {
      const leadId = String((sendToFolderLead as any)._id);
      await updateLead.mutateAsync({
        lead_id: leadId,
        user_id,
        folder_id: selectedFolderId,
      } as any);
      message.success(intl.formatMessage({ id: "leads.send_to_folder.success", defaultMessage: "Lead moved to folder" }));
      setSendToFolderLead(null);
      setSelectedFolderId(undefined);
      fetchNow({});
    } catch {
      message.error(intl.formatMessage({ id: "leads.send_to_folder.failed", defaultMessage: "Failed to move lead" }));
    } finally {
      setSendingToFolder(false);
    }
  };

  const doBulkMoveToFolder = async () => {
    if (!selectedFolderId || selectedRowKeys.length === 0) return;
    setSendingToFolder(true);
    try {
      const leads = selectedRowKeys.map((id) => ({
        _id: String(id),
        user_id,
        folder_id: selectedFolderId,
      }));
      await bulkUpdateScrappedLeads.mutateAsync({ leads });
      message.success(intl.formatMessage({ id: "leads.send_to_folder.success", defaultMessage: "Lead(s) moved to folder" }));
      setBulkMoveModalOpen(false);
      setSelectedFolderId(undefined);
      setSelectedRowKeys([]);
      fetchNow({});
    } catch {
      message.error(intl.formatMessage({ id: "leads.send_to_folder.failed", defaultMessage: "Failed to move lead(s)" }));
    } finally {
      setSendingToFolder(false);
    }
  };

  const baseColumns: ColumnsType<Lead> = [
    {
      title: <FormattedMessage id="leads.table.name" defaultMessage="Name" />,
      key: "name",
      render: (_, record) => {
        const fullName =
          `${record.first_name || ""} ${record.last_name || ""}`.trim() || "-";

        if (!showProfileAvatar) return fullName;

        const avatarSrc = getLeadAvatarSrc(record);
        const subtitle = record.username ? `@${record.username}` : record.emails?.[0] || "";

        return (
          <Space size={12} align="center">
            <Avatar
              size={36}
              src={avatarSrc}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#f5f5f5", flexShrink: 0 }}
            />
            <div className="min-w-0">
              <div className="font-medium leading-5">{fullName}</div>
              {subtitle ? (
                <Text type="secondary" className="!text-xs">
                  {subtitle}
                </Text>
              ) : null}
            </div>
          </Space>
        );
      },
    },
    {
      title: <FormattedMessage id="leads.table.email" defaultMessage="Email" />,
      key: "emails",
      ellipsis: true,
      render: (_, record) => record.emails?.[0] || "-",
    },
    {
      title: (
        <FormattedMessage id="leads.table.phones" defaultMessage="Phones" />
      ),
      key: "phone_numbers",
      ellipsis: true,
      render: (_, record) =>
        Array.isArray(record.phone_numbers)
          ? record.phone_numbers[0] || "-"
          : record.phone_numbers || "-",
    },
    {
      title: (
        <FormattedMessage id="leads.table.company" defaultMessage="Company" />
      ),
      dataIndex: "company",
      key: "company",
      ellipsis: true,
      render: (v) => v || "-",
    },
    {
      title: (
        <FormattedMessage
          id="leads.table.jobTitle"
          defaultMessage="Job Title"
        />
      ),
      dataIndex: "job_title",
      key: "job_title",
      ellipsis: true,
      render: (v) => v || "-",
    },
    {
      title: (
        <FormattedMessage id="leads.table.status" defaultMessage="Status" />
      ),
      dataIndex: "is_converted",
      key: "is_converted",
      ...(showFilters
        ? {
            filters: [
              {
                text: <FormattedMessage id="leads.status.converted" />,
                value: "true",
              },
              {
                text: <FormattedMessage id="leads.status.new" />,
                value: "false",
              },
            ],
            filteredValue: antdFilteredValue.is_converted as any,
          }
        : {}),
      render: (value?: boolean) =>
        value ? (
          <Tag color="green">
            <FormattedMessage id="leads.status.converted" />
          </Tag>
        ) : (
          <Tag color="blue">
            <FormattedMessage id="leads.status.new" />
          </Tag>
        ),
    },
    {
      title: <FormattedMessage id="leads.table.type" defaultMessage="Type" />,
      dataIndex: "type",
      key: "type",
      ...(showFilters
        ? {
            filters: [
              { text: "LinkedIn", value: "LINKEDIN" },
              { text: "Instagram", value: "INSTAGRAM" },
              { text: "Manual", value: "MANUAL" },
            ],
            filteredValue: antdFilteredValue.type as any,
          }
        : {}),
      render: (value?: string) =>
        value === "LINKEDIN" ? (
          <Tag color="blue">{value}</Tag>
        ) : value === "INSTAGRAM" ? (
          <Tag color="red">{value}</Tag>
        ) : (
          <Tag color="green">{value || "-"}</Tag>
        ),
    },
    {
      title: (
        <FormattedMessage id="leads.table.createdAt" defaultMessage="Created" />
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date?: string | Date) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: <FormattedMessage id="commons.actions" defaultMessage="Actions" />,
      key: "actions",
      fixed: "right",
      width: 160,
      hidden: !showFilters,
      render: (_, record) => (
        <Space size={4}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openViewPage(record)}
          >
            <FormattedMessage id="commons.view" defaultMessage="View" />
          </Button>
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "edit",
                  icon: <EditOutlined />,
                  label: <FormattedMessage id="commons.edit" defaultMessage="Edit" />,
                  onClick: () => openEditDrawer(record),
                },
                {
                  key: "send-to-folder",
                  icon: <FolderOpenOutlined />,
                  label: <FormattedMessage id="leads.actions.send_to_folder" defaultMessage="Send to folder" />,
                  onClick: () => {
                    setSelectedFolderId(undefined);
                    setSendToFolderLead(record);
                  },
                },
                { type: "divider" },
                {
                  key: "delete",
                  icon: <DeleteOutlined />,
                  danger: true,
                  label: (
                    <Popconfirm
                      title={intl.formatMessage({ id: "leads.confirm.delete_one", defaultMessage: "Delete this lead?" })}
                      okText={intl.formatMessage({ id: "commons.delete", defaultMessage: "Delete" })}
                      okButtonProps={{ danger: true }}
                      cancelText={intl.formatMessage({ id: "commons.cancel", defaultMessage: "Cancel" })}
                      onConfirm={(e) => { e?.stopPropagation(); doDeleteOne(record); }}
                      onCancel={(e) => e?.stopPropagation()}
                    >
                      <span style={{ display: "block", width: "100%" }} onClick={(e) => e?.stopPropagation()}>
                        <FormattedMessage id="commons.delete" defaultMessage="Delete" />
                      </span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const handleChange = (
    pagination: TablePaginationConfig,
    tableFilters: Record<string, FilterValue | null>,
  ) => {
    if (!showFilters) return;

    const page = pagination.current ?? 1;
    const limit = pagination.pageSize ?? 10;

    const type = (tableFilters.type?.[0] as string) || "";
    const convRaw = (tableFilters.is_converted?.[0] as string) ?? "";
    const is_converted =
      convRaw === "true" ? true : convRaw === "false" ? false : undefined;

    fetchNow({ page, limit, type, is_converted });
  };

  const rowSelection = showFilters
    ? {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
      }
    : undefined;

  const isDirtySearch = (searchDraft || "").trim() !== (filters.search || "");

  // File upload handler
  const handleFileSelect = async (file?: File) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();

    const extract = async (rows: any[]) => {
      try {
        setUploading(true);

        const transformed = rows
          .map((r: any) => {
            const first_name =
              r.first_name || r.First_Name || r.FirstName || "";
            const last_name = r.last_name || r.Last_Name || r.LastName || "";

            const emails = r.emails
              ? String(r.emails)
                  .split(",")
                  .map((e: string) => e.trim())
              : r.email
                ? [String(r.email).trim()]
                : [];

            const phone_numbers = r.phone_numbers
              ? String(r.phone_numbers)
                  .split(",")
                  .map((p: string) => p.trim())
              : r.phone || r.Phone
                ? [String(r.phone || r.Phone).trim()]
                : [];

            return {
              first_name,
              last_name,
              emails,
              phone_numbers,
              company: r.company || r.Company || "",
              job_title:
                r.job_title || r.Job_Title || r.JobTitle || r.title || "",
              message: r.message || "",
              type: r.type || "MANUAL",
              is_converted:
                r.is_converted === true || r.is_converted === "TRUE",
              scrape_status:
                r.scrape_status === true || r.scrape_status === "TRUE",
              user_id: user_id ?? "",
            };
          })
          .filter(
            (row) =>
              row.first_name ||
              row.last_name ||
              row.emails.length ||
              row.phone_numbers.length,
          );

        if (!transformed.length) {
          message.warning(
            intl.formatMessage({ id: "leads.upload.no_valid_rows" }),
          );
          setUploading(false);
          return;
        }

        if (onBulkUpload) {
          await onBulkUpload({
            user_id: user_id ?? "",
            leads: transformed,
          });
          message.success(
            intl.formatMessage(
              { id: "leads.upload.success" },
              { count: transformed.length },
            ),
          );
          fetchNow({ page: 1 });
        } else {
          await bulkUpload.mutateAsync({
            user_id: user_id ?? "",
            leads: transformed,
          });
          message.success(
            intl.formatMessage(
              { id: "leads.upload.success" },
              { count: transformed.length },
            ),
          );
          fetchNow({ page: 1 });
        }
      } catch (err) {
        console.error(err);
        message.error(intl.formatMessage({ id: "leads.upload.failed" }));
      } finally {
        setUploading(false);
      }
    };

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
        extract(data);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
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
            extract(json);
          };
          reader.readAsArrayBuffer(file);
        })
        .catch((err) => {
          console.error("Failed to load xlsx parser:", err);
          message.error(intl.formatMessage({ id: "leads.upload.failed" }));
        });
    } else {
      message.error(
        intl.formatMessage({ id: "leads.upload.unsupported_format" }),
      );
    }
  };

  return (
    <Card
      style={cardStyle}
      title={
        <TableHeaderTitle
          icon={<UsergroupAddOutlined />}
          title={
            <FormattedMessage
              id="leads.widget.recent_title"
              defaultMessage="Leads"
            />
          }
        />
      }
      extra={
        <Space>
          <Text className="!text-lg !font-semibold">
            <FormattedMessage
              id="leads.widget.total"
              defaultMessage="Total {total}"
              values={{ total }}
            />
          </Text>

          {/* ✅ Hide "download" + "add" when showFilters=false */}
          {showFilters && (
            <>
              {canDownloadLeads && (
                <Button
                  icon={<DownloadOutlined />}
                  onClick={downloadAll}
                  loading={download.isPending}
                >
                  <FormattedMessage
                    id="leads.actions.download"
                    defaultMessage="Download"
                  />
                </Button>
              )}

              {showFileUpload && (
                <Button
                  icon={<UploadOutlined />}
                  loading={uploading}
                  type="default"
                  onClick={() =>
                    document.getElementById("lead-file-upload")?.click()
                  }
                >
                  <FormattedMessage
                    id="leads.actions.upload"
                    defaultMessage="Upload File"
                  />
                </Button>
              )}

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAddDrawer}
              >
                <FormattedMessage id="commons.add" defaultMessage="Add" />
              </Button>
            </>
          )}
        </Space>
      }
    >
      {/* Upload Section with Instructions */}
      {showModernFileUpload && (
        <div className="mb-4">
          <Alert
            description={
              <div className="flex items-center justify-between">
                <div>
                  <strong>
                    <FormattedMessage
                      id="leads.upload.title"
                      defaultMessage="Bulk Import Leads"
                    />
                  </strong>
                  <div className="text-sm mt-1">
                    <FormattedMessage
                      id="leads.upload.description"
                      defaultMessage="Upload a CSV or XLSX file to import multiple leads at once."
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    <FormattedMessage
                      id="leads.upload.supported_formats"
                      defaultMessage="Supported formats: CSV, XLSX, XLS"
                    />
                  </div>
                </div>
                <Button
                  icon={<UploadOutlined />}
                  size="large"
                  type="primary"
                  loading={uploading}
                  onClick={() =>
                    document.getElementById("lead-file-upload")?.click()
                  }
                >
                  <FormattedMessage
                    id="leads.upload.button"
                    defaultMessage="Choose File"
                  />
                </Button>
              </div>
            }
            type="info"
            showIcon
          />
          <input
            id="lead-file-upload"
            type="file"
            accept=".csv, .xlsx, .xls"
            style={{ display: "none" }}
            onChange={(e) => {
              handleFileSelect(e.target.files?.[0]);
              e.target.value = ""; // Reset input
            }}
          />
        </div>
      )}

      {/* ✅ Toolbar hidden when showFilters=false */}
      {showFilters && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            value={searchDraft}
            placeholder={intl.formatMessage({
              id: "leads.search.placeholder",
              defaultMessage: "Search name, email, company...",
            })}
            onChange={(e) => setSearchDraft(e.target.value)}
            className="sm:max-w-md"
          />

          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={applySearch}
              disabled={loading || !isDirtySearch}
            >
              <FormattedMessage id="commons.search" defaultMessage="Search" />
            </Button>

            <Button
              onClick={resetAll}
              icon={<ReloadOutlined />}
              disabled={loading}
            >
              <FormattedMessage id="commons.reset" defaultMessage="Reset" />
            </Button>

            <Button
              icon={<FolderOpenOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={() => { setSelectedFolderId(undefined); setBulkMoveModalOpen(true); }}
            >
              <FormattedMessage
                id="leads.send_to_folder.bulk_button"
                defaultMessage="Move to Folder"
              />
            </Button>

            <Popconfirm
              title={intl.formatMessage(
                { id: "leads.confirm.delete_selected" },
                { count: selectedRowKeys.length },
              )}
              okText={intl.formatMessage({ id: "commons.delete" })}
              okButtonProps={{ danger: true }}
              onConfirm={doDeleteSelected}
              disabled={selectedRowKeys.length === 0}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
              >
                <FormattedMessage
                  id="commons.delete_selected"
                  defaultMessage="Delete selected"
                />
              </Button>
            </Popconfirm>
          </Space>
        </div>
      )}

      <Table<Lead>
        loading={loading}
        rowKey={(r) => (r as any)._id}
        rowSelection={rowSelection}
        columns={baseColumns}
        dataSource={leads}
        onChange={handleChange}
        pagination={
          showFilters
            ? {
                current: filters.page,
                pageSize: filters.limit,
                total,
                showSizeChanger: true,
              }
            : false
        }
        size="large"
        scroll={{ x: 900 }}
        locale={{
          emptyText: (
            <FormattedMessage id="leads.empty" defaultMessage="No leads yet" />
          ),
        }}
      />

      {/* Send to Folder Modal */}
      <Modal
        open={!!sendToFolderLead}
        title={
          <Space>
            <FolderOpenOutlined />
            <FormattedMessage id="leads.send_to_folder.title" defaultMessage="Send to Folder" />
          </Space>
        }
        onCancel={() => { setSendToFolderLead(null); setSelectedFolderId(undefined); }}
        onOk={doSendToFolder}
        okText={<FormattedMessage id="leads.send_to_folder.confirm" defaultMessage="Move to Folder" />}
        cancelText={<FormattedMessage id="commons.cancel" defaultMessage="Cancel" />}
        confirmLoading={sendingToFolder}
        okButtonProps={{ disabled: !selectedFolderId }}
      >
        <p style={{ marginBottom: 12 }}>
          <FormattedMessage
            id="leads.send_to_folder.description"
            defaultMessage="Select a folder to move this lead into."
          />
        </p>
        <Select
          style={{ width: "100%" }}
          placeholder={intl.formatMessage({ id: "leads.send_to_folder.placeholder", defaultMessage: "Choose a folder" })}
          options={filteredFolderOptions}
          value={selectedFolderId}
          onChange={setSelectedFolderId}
          showSearch
          optionFilterProp="label"
        />
      </Modal>

      {/* Bulk Move to Folder Modal */}
      <Modal
        open={bulkMoveModalOpen}
        title={
          <Space>
            <FolderOpenOutlined />
            <FormattedMessage id="leads.send_to_folder.bulk_title" defaultMessage="Move Selected Leads to Folder" />
          </Space>
        }
        onCancel={() => { setBulkMoveModalOpen(false); setSelectedFolderId(undefined); }}
        onOk={doBulkMoveToFolder}
        okText={<FormattedMessage id="leads.send_to_folder.confirm" defaultMessage="Move to Folder" />}
        cancelText={<FormattedMessage id="commons.cancel" defaultMessage="Cancel" />}
        confirmLoading={sendingToFolder}
        okButtonProps={{ disabled: !selectedFolderId }}
      >
        <p style={{ marginBottom: 12 }}>
          <FormattedMessage
            id="leads.send_to_folder.bulk_description"
            defaultMessage="Select a folder to move {count} selected lead(s) into."
            values={{ count: selectedRowKeys.length }}
          />
        </p>
        <Select
          style={{ width: "100%" }}
          placeholder={intl.formatMessage({ id: "leads.send_to_folder.placeholder", defaultMessage: "Choose a folder" })}
          options={bulkMoveFolderOptions}
          value={selectedFolderId}
          onChange={setSelectedFolderId}
          showSearch
          optionFilterProp="label"
        />
      </Modal>
    </Card>
  );
};

export default LeadsTableServer;
