// FeedbacksTableServer.tsx
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
  Tag,
  Select,
  Spin,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";

type AppUserLite = {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
};

export type FeedbackItem = {
  _id: string;
  feedback?: string;
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
  feedbacks?: FeedbackItem[];
  total?: number;
  loading?: boolean;

  value: ServerFilters;
  onFetch: (filters: ServerFilters) => void;

  onDeleteOne?: (row: FeedbackItem) => Promise<void> | void;
  onDeleteMany?: (ids: string[]) => Promise<void> | void;

  onUpdateFeedback?: (
    id: string,
    payload: Partial<FeedbackItem>,
  ) => Promise<void> | void;

  showFilters?: boolean;

  /** ✅ if true => disable status dropdown */
  disableStatusChange?: boolean;

  /** ✅ if false => show status as Tag instead of Select */
  showSelect?: boolean;

  onOpenEdit?: (row: FeedbackItem) => void;
  onOpenView?: (row: FeedbackItem) => void;
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

const safeDate = (d?: string | Date) =>
  d ? new Date(d).toLocaleString() : "-";

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

const getStatusLabel = (status?: string) => {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    default:
      return "Open";
  }
};

const FeedbacksTableServer: React.FC<Props> = ({
  feedbacks = [],
  total = 0,
  loading = false,
  value,
  onFetch,
  onDeleteOne,
  onDeleteMany,
  onUpdateFeedback,
  showFilters = true,
  disableStatusChange = false,
  showSelect = true,
  onOpenEdit,
  onOpenView,
}) => {
  const { Text } = Typography;
  const intl = useIntl();
  const filters = value;

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

  const doDeleteOne = async (row: FeedbackItem) => {
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
    if (!onUpdateFeedback) return;

    setUpdatingStatusId(id);
    try {
      await onUpdateFeedback(id, { status: newStatus as any });
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

  const columns: ColumnsType<FeedbackItem> = [
    {
      title: (
        <FormattedMessage
          id="admin.feedbacks.table.feedback"
          defaultMessage="Feedback"
        />
      ),
      dataIndex: "feedback",
      key: "feedback",
      ellipsis: true,
      render: (v?: string) => v || "-",
    },
    {
      title: (
        <FormattedMessage
          id="admin.feedbacks.table.status"
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
                { label: "Open", value: "open" },
                { label: "In Progress", value: "in_progress" },
                { label: "Resolved", value: "resolved" },
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
        <FormattedMessage
          id="admin.feedbacks.table.user"
          defaultMessage="User"
        />
      ),
      key: "user",
      ellipsis: true,
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{formatUser(r.user_id as any)}</Text>
          <Text type="secondary">{formatEmail(r.user_id as any)}</Text>
        </Space>
      ),
    },
    {
      title: (
        <FormattedMessage
          id="admin.feedbacks.table.created"
          defaultMessage="Created"
        />
      ),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d?: string | Date) => safeDate(d),
    },
    {
      title: (
        <FormattedMessage
          id="admin.feedbacks.table.updated"
          defaultMessage="Updated"
        />
      ),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (d?: string | Date) => safeDate(d),
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
                if (onOpenEdit) return onOpenEdit(record);
                if (onUpdateFeedback)
                  return onUpdateFeedback(String(record._id), {
                    feedback: record.feedback,
                  });
              }}
            />
          </Tooltip>

          <Popconfirm
            title={intl.formatMessage({
              id: "admin.feedbacks.confirm.delete_one",
              defaultMessage: "Delete this feedback?",
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
        <Space>
          <MessageOutlined style={{ fontSize: 18, color: "#52c41a" }} />
          <span>
            <FormattedMessage
              id="admin.feedbacks.title"
              defaultMessage="Feedbacks"
            />
          </span>
        </Space>
      }
      extra={
        <Tag color="green" style={{ fontSize: 14, padding: "4px 12px" }}>
          <FormattedMessage
            id="admin.feedbacks.total"
            defaultMessage="Total {total}"
            values={{ total }}
          />
        </Tag>
      }
      style={{
        borderRadius: 8,
        boxShadow:
          "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)",
      }}
    >
      {showFilters && (
        <div
          className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{
            padding: "16px",
            background: "#fafafa",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Input
            allowClear
            prefix={<SearchOutlined />}
            value={searchDraft}
            placeholder={intl.formatMessage({
              id: "admin.feedbacks.search.placeholder",
              defaultMessage: "Search feedback text...",
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
                  id: "admin.feedbacks.confirm.delete_selected",
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

      <Table<FeedbackItem>
        loading={loading}
        rowKey={(r) => String(r._id)}
        rowSelection={rowSelection}
        columns={columns}
        dataSource={feedbacks}
        onChange={handleChange}
        pagination={
          showFilters
            ? {
                current: filters.page,
                pageSize: filters.limit,
                total,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }
            : false
        }
        size="middle"
        scroll={{ x: 980 }}
        locale={{
          emptyText: (
            <FormattedMessage
              id="admin.feedbacks.empty"
              defaultMessage="No feedbacks"
            />
          ),
        }}
      />
    </Card>
  );
};

export default FeedbacksTableServer;
