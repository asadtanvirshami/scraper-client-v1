"use client";

import React, { useMemo, useState } from "react";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
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
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";

import type { Lead } from "@/types";
import { useAppDrawer } from "@/components/layout/app-drawer/user-app-drawer";
import LeadForm from "../../form";
import { useDownloadAllLeads } from "../../hooks/mutations";

type ServerFilters = {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  is_converted?: boolean | undefined;
  folder_id?: string;
};

type Props = {
  user_id: string; // ✅ pass from LeadsLayout
  leads?: Lead[];
  total?: number;
  loading?: boolean;

  value: ServerFilters;
  onFetch: (filters: ServerFilters) => void;

  onDeleteOne?: (lead: Lead) => Promise<void> | void;
  onDeleteMany?: (ids: string[]) => Promise<void> | void;

  onCreateLead?: (payload: Partial<Lead>) => Promise<void> | void;
  onUpdateLead?: (id: string, payload: Partial<Lead>) => Promise<void> | void;
};

const LeadsTableServer: React.FC<Props> = ({
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
}) => {
  const { Text } = Typography;
  const intl = useIntl();

  const { openDrawer, closeDrawer } = useAppDrawer();
  const download = useDownloadAllLeads();

  const filters = value;

  // ✅ draft search input (NO server call until click button)
  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  React.useEffect(() => setSearchDraft(filters.search ?? ""), [filters.search]);

  // ✅ selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const antdFilteredValue = useMemo(() => {
    return {
      type: filters.type ? [filters.type] : null,
      is_converted:
        typeof filters.is_converted === "boolean"
          ? [String(filters.is_converted)]
          : null,
    };
  }, [filters.type, filters.is_converted]);

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
      folder_id: filters.folder_id,
    });
  };

  // ✅ download all (CSV)
  const downloadAll = () => {
    download.mutate({
      user_id,
      search: filters.search,
      type: (filters.type as any) || "",
      is_converted: filters.is_converted,
      folder_id: filters.folder_id,
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
          onSubmit={async (payload) => {
            try {
              if (onCreateLead) await onCreateLead(payload);
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

  const openEditDrawer = (lead: Lead) => {
    openDrawer({
      title: intl.formatMessage({ id: "leads.drawer.edit_title" }),
      width: 520,
      content: (
        <LeadForm
          mode="edit"
          initialValues={lead}
          onClose={closeDrawer}
          onSubmit={async (payload) => {
            try {
              const id = (lead as any)._id as string;
              if (onUpdateLead) await onUpdateLead(id, payload);
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
    try {
      if (onDeleteOne) await onDeleteOne(lead);
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
      if (onDeleteMany) await onDeleteMany(ids);
      message.success(
        `${intl.formatMessage({ id: "commons.deleted" })} ${ids.length}`,
      );
      setSelectedRowKeys([]);
      fetchNow({ page: 1 });
    } catch {
      message.error(intl.formatMessage({ id: "commons.bulk_delete_failed" }));
    }
  };

  const columns: ColumnsType<Lead> = [
    {
      title: <FormattedMessage id="leads.table.name" defaultMessage="Name" />,
      key: "name",
      render: (_, record) =>
        `${record.first_name || ""} ${record.last_name || ""}`.trim() || "-",
    },
    {
      title: <FormattedMessage id="leads.table.email" defaultMessage="Email" />,
      key: "emails",
      ellipsis: true,
      render: (_, record) => record.emails?.[0] || "-",
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
        <FormattedMessage id="leads.table.jobTitle" defaultMessage="Job Title" />
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
      filters: [
        { text: <FormattedMessage id="leads.status.converted" />, value: "true" },
        { text: <FormattedMessage id="leads.status.new" />, value: "false" },
      ],
      filteredValue: antdFilteredValue.is_converted as any,
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
      filters: [
        { text: "LinkedIn", value: "LINKEDIN" },
        { text: "Instagram", value: "INSTAGRAM" },
        { text: "Manual", value: "MANUAL" },
      ],
      filteredValue: antdFilteredValue.type as any,
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
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditDrawer(record)}
          />
          <Popconfirm
            title={intl.formatMessage({ id: "leads.confirm.delete_one" })}
            okText={intl.formatMessage({ id: "commons.delete" })}
            okButtonProps={{ danger: true }}
            onConfirm={() => doDeleteOne(record)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleChange = (
    pagination: TablePaginationConfig,
    tableFilters: Record<string, FilterValue | null>,
  ) => {
    const page = pagination.current ?? 1;
    const limit = pagination.pageSize ?? 10;

    const type = (tableFilters.type?.[0] as string) || "";
    const convRaw = (tableFilters.is_converted?.[0] as string) ?? "";
    const is_converted =
      convRaw === "true" ? true : convRaw === "false" ? false : undefined;

    fetchNow({ page, limit, type, is_converted });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const isDirtySearch = (searchDraft || "").trim() !== (filters.search || "");

  return (
    <Card
      title={<FormattedMessage id="leads.widget.recent_title" defaultMessage="Leads" />}
      extra={
        <Space>
          <Text className="!text-lg !font-semibold">
            <FormattedMessage
              id="leads.widget.total"
              defaultMessage="Total {total}"
              values={{ total }}
            />
          </Text>

          <Button
            icon={<DownloadOutlined />}
            onClick={downloadAll}
            loading={download.isPending}
          >
            <FormattedMessage id="leads.actions.download" defaultMessage="Download" />
          </Button>

          <Button type="primary" icon={<PlusOutlined />} onClick={openAddDrawer}>
            <FormattedMessage id="commons.add" defaultMessage="Add" />
          </Button>
        </Space>
      }
    >
      {/* Toolbar */}
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
          // ✅ button-only search => DO NOT trigger on enter
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

          <Button onClick={resetAll} icon={<ReloadOutlined />} disabled={loading}>
            <FormattedMessage id="commons.reset" defaultMessage="Reset" />
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
              <FormattedMessage id="commons.delete_selected" defaultMessage="Delete selected" />
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Table<Lead>
        loading={loading}
        rowKey={(r) => (r as any)._id}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={leads}
        onChange={handleChange}
        pagination={{
          current: filters.page,
          pageSize: filters.limit,
          total,
          showSizeChanger: true,
        }}
        size="large"
        scroll={{ x: 900 }}
        locale={{
          emptyText: <FormattedMessage id="leads.empty" defaultMessage="No leads yet" />,
        }}
      />
    </Card>
  );
};

export default LeadsTableServer;
