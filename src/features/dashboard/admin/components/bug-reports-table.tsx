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
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  BugOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { BugReport, BugFilters } from "../hooks/use-bug-reports";

type Props = {
  bugReports?: BugReport[];
  total?: number;
  loading?: boolean;
  value: BugFilters;
  onFetch: (filters: BugFilters) => void;
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

  const fetchNow = (next: Partial<BugFilters>) => {
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

  const columns: ColumnsType<BugReport> = [
    {
      title: "Bug Description",
      dataIndex: "bug",
      key: "bug",
      ellipsis: true,
      width: 300,
      render: (bug?: string) => (
        <div title={bug} className="font-medium">
          {bug || "-"}
        </div>
      ),
    },
    {
      title: "Reported By",
      key: "user",
      render: (_, record) => (
        <div>
          {record.user_id ? (
            <>
              <div className="font-medium">
                {record.user_id.first_name} {record.user_id.last_name}
              </div>
              <div className="text-sm text-gray-500">{record.user_id.email}</div>
            </>
          ) : (
            <div className="text-gray-500">Anonymous</div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_deleted",
      key: "is_deleted",
      render: (is_deleted?: boolean) => (
        <Badge
          status={is_deleted ? "error" : "success"}
          text={is_deleted ? "DELETED" : "ACTIVE"}
        />
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

    fetchNow({ page, limit });
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
          placeholder="Search bug description..."
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
        scroll={{ x: 800 }}
        locale={{ emptyText: "No bug reports found" }}
      />
    </Card>
  );
};

export default BugReportsTable;
