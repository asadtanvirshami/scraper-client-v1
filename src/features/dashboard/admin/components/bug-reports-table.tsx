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
  Badge,
  message,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  BugOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";

type BugReport = {
  _id: string;
  title?: string;
  description?: string;
  user_name?: string;
  user_email?: string;
  priority?: string;
  status?: string;
  category?: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ServerFilters = {
  page: number;
  limit: number;
  search?: string;
  priority?: string;
  status?: string;
  category?: string;
};

type Props = {
  bugReports?: BugReport[];
  total?: number;
  loading?: boolean;
  value: ServerFilters;
  onFetch: (filters: ServerFilters) => void;
  onUpdateBug?: (id: string, payload: Partial<BugReport>) => Promise<void> | void;
};

const BugReportsTable: React.FC<Props> = ({
  bugReports = [],
  total = 0,
  loading = false,
  value,
  onFetch,
  onUpdateBug,
}) => {
  const { Text } = Typography;
  const intl = useIntl();

  const filters = value;
  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");

  React.useEffect(() => setSearchDraft(filters.search ?? ""), [filters.search]);

  const antdFilteredValue = useMemo(() => {
    return {
      priority: filters.priority ? [filters.priority] : null,
      status: filters.status ? [filters.status] : null,
      category: filters.category ? [filters.category] : null,
    };
  }, [filters.priority, filters.status, filters.category]);

  const fetchNow = (next: Partial<ServerFilters>) => {
    onFetch({ ...filters, ...next });
  };

  const applySearch = () => {
    const term = (searchDraft || "").trim();
    if ((filters.search || "") === term) return;
    fetchNow({ page: 1, search: term });
  };

  const resetAll = () => {
    setSearchDraft("");
    onFetch({
      page: 1,
      limit: filters.limit ?? 10,
      search: "",
      priority: "",
      status: "",
      category: "",
    });
  };

  const updateBugStatus = async (bug: BugReport, newStatus: string) => {
    try {
      if (onUpdateBug) {
        await onUpdateBug(bug._id, { status: newStatus });
        message.success("Bug status updated successfully");
        fetchNow({});
      }
    } catch {
      message.error("Failed to update bug status");
    }
  };

  const columns: ColumnsType<BugReport> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      width: 200,
      render: (title?: string) => (
        <div title={title} className="font-medium">
          {title || "-"}
        </div>
      ),
    },
    {
      title: "Reported By",
      key: "user",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.user_name || "Anonymous"}</div>
          <div className="text-sm text-gray-500">{record.user_email || "-"}</div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 250,
      render: (description?: string) => (
        <div title={description} className="max-w-xs truncate">
          {description || "-"}
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date?: string) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date?: string) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
  ];

  const handleChange = (
    pagination: TablePaginationConfig,
    tableFilters: Record<string, FilterValue | null>
  ) => {
    const page = pagination.current ?? 1;
    const limit = pagination.pageSize ?? 10;

    const priority = (tableFilters.priority?.[0] as string) || "";
    const status = (tableFilters.status?.[0] as string) || "";
    const category = (tableFilters.category?.[0] as string) || "";

    fetchNow({ page, limit, priority, status, category });
  };

  const isDirtySearch = (searchDraft || "").trim() !== (filters.search || "");

  return (
    <Card
      title="Bug Reports Management"
      extra={
        <Space>
          <Text className="!text-lg !font-semibold">
            Total Bug Reports: {total}
          </Text>
        </Space>
      }
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          value={searchDraft}
          placeholder="Search title, description, user..."
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
            Search
          </Button>

          <Button onClick={resetAll} icon={<ReloadOutlined />} disabled={loading}>
            Reset
          </Button>
        </Space>
      </div>

      <Table<BugReport>
        loading={loading}
        rowKey="_id"
        columns={columns}
        dataSource={bugReports}
        onChange={handleChange}
        pagination={{
          current: filters.page,
          pageSize: filters.limit,
          total,
          showSizeChanger: true,
        }}
        size="large"
        scroll={{ x: 1200 }}
        locale={{ emptyText: "No bug reports found" }}
      />
    </Card>
  );
};

export default BugReportsTable;
