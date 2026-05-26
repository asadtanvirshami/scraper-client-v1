// BugsTableServer.tsx
"use client";

import React, { useState } from "react";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue } from "antd/es/table/interface";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Input,
  Popconfirm,
  message,
  Tooltip,
  Select,
  Spin,
  Tag,
  theme,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  BugOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import TableHeaderTitle from "@/components/ui (generic)/table-header-title";

type AppUserLite = {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
};

export type BugItem = {
  _id: string;
  bug?: string;
  status?: "open" | "in_progress" | "resolved";
  user_id?: AppUserLite | string | null;
  is_deleted?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type ServerFilters = {
  page: number;
  limit: number;
  search?: string;
  user_id?: string;
};

type Props = {
  bugs?: BugItem[];
  total?: number;
  loading?: boolean;

  value: ServerFilters;
  onFetch: (filters: ServerFilters) => void;

  onDeleteOne?: (row: BugItem) => Promise<void> | void;
  onDeleteMany?: (ids: string[]) => Promise<void> | void;

  onUpdateBug?: (id: string, payload: Partial<BugItem>) => Promise<void> | void;

  /** ✅ if false => hide toolbar + pagination + selection */
  showFilters?: boolean;

  /** ✅ if true => disable status dropdown (for admin dashboard) */
  disableStatusChange?: boolean;

  /** ✅ if false => show status as Tag instead of Select */
  showSelect?: boolean;

  onOpenEdit?: (row: BugItem) => void;
  onOpenView?: (row: BugItem) => void;
};

const formatUser = (u?: AppUserLite | string | null) => {
  if (!u) return "-";
  if (typeof u === "string") return u;
  const name = `${u.first_name || ""} ${u.last_name || ""}`.trim();
  return name || u.email || u._id || "-";
};

const formatEmail = (u?: AppUserLite | string | null) => {
  if (!u || typeof u === "string") return "-";
  return u.email || "-";
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "open":
      return "error";
    case "in_progress":
      return "processing";
    case "resolved":
      return "success";
    default:
      return "default";
  }
};

const BugsTableServer: React.FC<Props> = ({
  bugs = [],
  total = 0,
  loading = false,
  value,
  onFetch,
  onDeleteOne,
  onDeleteMany,
  onUpdateBug,
  showFilters = true,
  disableStatusChange = false,
  showSelect = true,
  onOpenEdit,
  onOpenView,
}) => {
  const { Text } = Typography;
  const intl = useIntl();
  const { token } = theme.useToken();
  const filters = value;

  // ✅ draft search input (NO server call until click button)
  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  React.useEffect(() => setSearchDraft(filters.search ?? ""), [filters.search]);

  // ✅ selection
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // ✅ status update state
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchNow = (next: Partial<ServerFilters>) =>
    onFetch({ ...filters, ...next });

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
      user_id: "",
    });
  };

  const doDeleteOne = async (row: BugItem) => {
    try {
      if (onDeleteOne) await onDeleteOne(row);
      message.success(
        intl.formatMessage({
          id: "commons.deleted",
          defaultMessage: "Deleted",
        }),
      );
      fetchNow({});
    } catch {
      message.error(
        intl.formatMessage({
          id: "commons.delete_failed",
          defaultMessage: "Delete failed",
        }),
      );
    }
  };

  const doDeleteSelected = async () => {
    const ids = selectedRowKeys.map(String);
    if (!ids.length) return;

    try {
      if (onDeleteMany) await onDeleteMany(ids);
      message.success(
        `${intl.formatMessage({ id: "commons.deleted", defaultMessage: "Deleted" })} ${ids.length}`,
      );
      setSelectedRowKeys([]);
      fetchNow({ page: 1 });
    } catch {
      message.error(
        intl.formatMessage({
          id: "commons.bulk_delete_failed",
          defaultMessage: "Bulk delete failed",
        }),
      );
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!onUpdateBug) return;

    setUpdatingStatusId(id);
    try {
      await onUpdateBug(id, { status: newStatus as any });
      message.success(
        intl.formatMessage({
          id: "commons.updated",
          defaultMessage: "Updated",
        }),
      );
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: "commons.update_failed",
          defaultMessage: "Update failed",
        }),
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusLabel = (status?: string) =>
    intl.formatMessage({
      id: `admin.bugs.status.${status || "open"}`,
      defaultMessage:
        status === "in_progress"
          ? "In Progress"
          : status === "resolved"
            ? "Resolved"
            : "Open",
    });

  const formatDateTime = (value?: string | Date) =>
    value
      ? `${intl.formatDate(new Date(value), {
          year: "numeric",
          month: "short",
          day: "numeric",
        })} ${intl.formatTime(new Date(value), {
          hour: "numeric",
          minute: "2-digit",
        })}`
      : "-";

  const columns: ColumnsType<BugItem> = [
    {
      title: (
        <FormattedMessage id="admin.bugs.table.bug" defaultMessage="Bug" />
      ),
      dataIndex: "bug",
      key: "bug",
      ellipsis: true,
      render: (v?: string) => v || "-",
    },
    {
      title: (
        <FormattedMessage
          id="admin.bugs.table.status"
          defaultMessage="Status"
        />
      ),
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string, record) => {
        if (!showSelect) {
          return <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>;
        }
        return (
          <Spin spinning={updatingStatusId === record._id} size="small">
            <Select
              value={status || "open"}
              onChange={(val) => handleStatusChange(record._id, val)}
              options={[
                { label: getStatusLabel("open"), value: "open" },
                { label: getStatusLabel("in_progress"), value: "in_progress" },
                { label: getStatusLabel("resolved"), value: "resolved" },
              ]}
              disabled={disableStatusChange || updatingStatusId === record._id}
              size="small"
              style={{ width: "100%" }}
            />
          </Spin>
        );
      },
    },
    {
      title: (
        <FormattedMessage id="admin.bugs.table.user" defaultMessage="User" />
      ),
      key: "user",
      ellipsis: true,
      render: (_, r) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{formatUser(r.user_id as any)}</Text>
          <Text type="secondary">{formatEmail(r.user_id as any)}</Text>
        </Space>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="admin.bugs.table.created"
          defaultMessage="Created"
        />
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d?: string | Date) => formatDateTime(d),
    },
    {
      title: (
        <FormattedMessage
          id="admin.bugs.table.updated"
          defaultMessage="Updated"
        />
      ),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (d?: string | Date) => formatDateTime(d),
    },
    {
      title: <FormattedMessage id="commons.actions" defaultMessage="Actions" />,
      key: "actions",
      fixed: "right",
      width: 150,
      hidden: !showFilters,
      render: (_, record) => (
        <Space>
          <Tooltip
            title={intl.formatMessage({
              id: "commons.view",
              defaultMessage: "View",
            })}
          >
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onOpenView?.(record)}
            />
          </Tooltip>

          <Tooltip
            title={intl.formatMessage({
              id: "commons.edit",
              defaultMessage: "Edit",
            })}
          >
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                if (onOpenEdit) {
                  onOpenEdit(record);
                } else if (onUpdateBug) {
                  onUpdateBug(String(record._id), { bug: record.bug });
                }
              }}
            />
          </Tooltip>

          <Popconfirm
            title={intl.formatMessage({
              id: "admin.bugs.confirm.delete_one",
              defaultMessage: "Delete this bug?",
            })}
            okText={intl.formatMessage({
              id: "commons.delete",
              defaultMessage: "Delete",
            })}
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
    _tableFilters: Record<string, FilterValue | null>,
  ) => {
    if (!showFilters) return;
    const page = pagination.current ?? 1;
    const limit = pagination.pageSize ?? 10;
    fetchNow({ page, limit });
  };

  const rowSelection = showFilters
    ? {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
      }
    : undefined;

  const isDirtySearch = (searchDraft || "").trim() !== (filters.search || "");

  return (
    <Card
      title={
        <TableHeaderTitle
          icon={<BugOutlined />}
          title={<FormattedMessage id="admin.bugs.title" defaultMessage="Bugs" />}
        />
      }
      extra={
        <Tag color="red" style={{ fontSize: 14, padding: "4px 12px" }}>
          <FormattedMessage
            id="admin.bugs.total"
            defaultMessage="Total {total}"
            values={{ total }}
          />
        </Tag>
      }
      style={{
        borderRadius: 8,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowSecondary,
      }}
    >
      {showFilters && (
        <div
          className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{
            padding: "16px",
            background: token.colorFillAlter,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Input
            allowClear
            prefix={<SearchOutlined />}
            value={searchDraft}
            placeholder={intl.formatMessage({
              id: "admin.bugs.search.placeholder",
              defaultMessage: "Search bug text...",
            })}
            onChange={(e) => setSearchDraft(e.target.value)}
            className="sm:max-w-md"
            size="large"
          />

          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={applySearch}
              disabled={loading || !isDirtySearch}
              size="large"
            >
              <FormattedMessage id="commons.search" defaultMessage="Search" />
            </Button>

            <Button
              onClick={resetAll}
              icon={<ReloadOutlined />}
              disabled={loading}
              size="large"
            >
              <FormattedMessage id="commons.reset" defaultMessage="Reset" />
            </Button>

            <Popconfirm
              title={intl.formatMessage(
                {
                  id: "admin.bugs.confirm.delete_selected",
                  defaultMessage: "Delete {count} selected item(s)?",
                },
                { count: selectedRowKeys.length },
              )}
              okText={intl.formatMessage({
                id: "commons.delete",
                defaultMessage: "Delete",
              })}
              okButtonProps={{ danger: true }}
              onConfirm={doDeleteSelected}
              disabled={selectedRowKeys.length === 0}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                size="large"
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

      <Table<BugItem>
        loading={loading}
        rowKey={(r) => String(r._id)}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={bugs}
        onChange={handleChange}
        pagination={
          showFilters
            ? {
                current: filters.page,
                pageSize: filters.limit,
                total,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  intl.formatMessage(
                    {
                      id: "commons.pagination.range_total",
                      defaultMessage: "{start}-{end} of {total} items",
                    },
                    { start: range[0], end: range[1], total },
                  ),
              }
            : false
        }
        size="middle"
        scroll={{ x: 1200 }}
        locale={{
          emptyText: (
            <FormattedMessage id="admin.bugs.empty" defaultMessage="No bugs" />
          ),
        }}
      />
    </Card>
  );
};

export default BugsTableServer;
