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
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
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

  onUpdateFeedback?: (id: string, payload: Partial<FeedbackItem>) => Promise<void> | void;

  showFilters?: boolean;

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

const safeDate = (d?: string | Date) => (d ? new Date(d).toLocaleString() : "-");

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
  onOpenEdit,
  onOpenView,
}) => {
  const { Text } = Typography;
  const intl = useIntl();
  const filters = value;

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  React.useEffect(() => setSearchDraft(filters.search ?? ""), [filters.search]);

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchNow = (next: Partial<ServerFilters>) => onFetch({ ...filters, ...next });

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
      message.success(intl.formatMessage({ id: "commons.deleted", defaultMessage: "Deleted" }));
      fetchNow({});
    } catch {
      message.error(
        intl.formatMessage({ id: "commons.delete_failed", defaultMessage: "Delete failed" }),
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

  const columns: ColumnsType<FeedbackItem> = [
    {
      title: <FormattedMessage id="admin.feedbacks.table.feedback" defaultMessage="Feedback" />,
      dataIndex: "feedback",
      key: "feedback",
      ellipsis: true,
      render: (v?: string) => v || "-",
    },
    {
      title: <FormattedMessage id="admin.feedbacks.table.user" defaultMessage="User" />,
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
      title: <FormattedMessage id="admin.feedbacks.table.created" defaultMessage="Created" />,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d?: string | Date) => safeDate(d),
    },
    {
      title: <FormattedMessage id="admin.feedbacks.table.updated" defaultMessage="Updated" />,
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
          <Tooltip title={intl.formatMessage({ id: "commons.view", defaultMessage: "View" })}>
            <Button size="small" icon={<EyeOutlined />} onClick={() => onOpenView?.(record)} />
          </Tooltip>

          <Tooltip title={intl.formatMessage({ id: "commons.edit", defaultMessage: "Edit" })}>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                if (onOpenEdit) return onOpenEdit(record);
                if (onUpdateFeedback)
                  return onUpdateFeedback(String(record._id), { feedback: record.feedback });
              }}
            />
          </Tooltip>

          <Popconfirm
            title={intl.formatMessage({
              id: "admin.feedbacks.confirm.delete_one",
              defaultMessage: "Delete this feedback?",
            })}
            okText={intl.formatMessage({ id: "commons.delete", defaultMessage: "Delete" })}
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
    ? { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys) }
    : undefined;

  const isDirtySearch = (searchDraft || "").trim() !== (filters.search || "");

  return (
    <Card
      title={<FormattedMessage id="admin.feedbacks.title" defaultMessage="Feedbacks" />}
      extra={
        <Space>
          <Text className="!text-lg !font-semibold">
            <FormattedMessage
              id="admin.feedbacks.total"
              defaultMessage="Total {total}"
              values={{ total }}
            />
          </Text>
        </Space>
      }
    >
      {showFilters && (
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                {
                  id: "admin.feedbacks.confirm.delete_selected",
                  defaultMessage: "Delete {count} selected item(s)?",
                },
                { count: selectedRowKeys.length },
              )}
              okText={intl.formatMessage({ id: "commons.delete", defaultMessage: "Delete" })}
              okButtonProps={{ danger: true }}
              onConfirm={doDeleteSelected}
              disabled={selectedRowKeys.length === 0}
            >
              <Button danger icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0}>
                <FormattedMessage id="commons.delete_selected" defaultMessage="Delete selected" />
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
              }
            : false
        }
        size="large"
        scroll={{ x: 980 }}
        locale={{
          emptyText: <FormattedMessage id="admin.feedbacks.empty" defaultMessage="No feedbacks" />,
        }}
      />
    </Card>
  );
};

export default FeedbacksTableServer;
