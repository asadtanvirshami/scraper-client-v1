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
  Rate,
  Badge,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  MessageOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";

type Feedback = {
  _id: string;
  user_name?: string;
  user_email?: string;
  rating?: number;
  message?: string;
  type?: string;
  status?: string;
  createdAt?: string;
};

type ServerFilters = {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  status?: string;
  rating?: number;
};

type Props = {
  feedback?: Feedback[];
  total?: number;
  loading?: boolean;
  value: ServerFilters;
  onFetch: (filters: ServerFilters) => void;
};

const FeedbackTable: React.FC<Props> = ({
  feedback = [],
  total = 0,
  loading = false,
  value,
  onFetch,
}) => {
  const { Text } = Typography;
  const intl = useIntl();

  const filters = value;
  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");

  React.useEffect(() => setSearchDraft(filters.search ?? ""), [filters.search]);

  const antdFilteredValue = useMemo(() => {
    return {
      type: filters.type ? [filters.type] : null,
      status: filters.status ? [filters.status] : null,
      rating: filters.rating ? [String(filters.rating)] : null,
    };
  }, [filters.type, filters.status, filters.rating]);

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
      type: "",
      status: "",
      rating: undefined,
    });
  };

  const columns: ColumnsType<Feedback> = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.user_name || "Anonymous"}</div>
          <div className="text-sm text-gray-500">{record.user_email || "-"}</div>
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      filters: [
        { text: "5 Stars", value: "5" },
        { text: "4 Stars", value: "4" },
        { text: "3 Stars", value: "3" },
        { text: "2 Stars", value: "2" },
        { text: "1 Star", value: "1" },
      ],
      filteredValue: antdFilteredValue.rating as any,
      render: (rating?: number) => (
        <Rate disabled value={rating} style={{ fontSize: 14 }} />
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "General", value: "general" },
        { text: "Bug Report", value: "bug" },
        { text: "Feature Request", value: "feature" },
        { text: "Complaint", value: "complaint" },
      ],
      filteredValue: antdFilteredValue.type as any,
      render: (type?: string) => {
        const colorMap: Record<string, string> = {
          general: "blue",
          bug: "red",
          feature: "green",
          complaint: "orange",
        };
        return (
          <Tag color={colorMap[type || "general"] || "blue"}>
            {type?.toUpperCase() || "GENERAL"}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "New", value: "new" },
        { text: "In Review", value: "review" },
        { text: "Resolved", value: "resolved" },
        { text: "Closed", value: "closed" },
      ],
      filteredValue: antdFilteredValue.status as any,
      render: (status?: string) => {
        const colorMap: Record<string, string> = {
          new: "blue",
          review: "orange",
          resolved: "green",
          closed: "default",
        };
        return (
          <Badge
            status={colorMap[status || "new"] as any}
            text={status?.toUpperCase() || "NEW"}
          />
        );
      },
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      width: 300,
      render: (message?: string) => (
        <div title={message} className="max-w-xs truncate">
          {message || "-"}
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
  ];

  const handleChange = (
    pagination: TablePaginationConfig,
    tableFilters: Record<string, FilterValue | null>
  ) => {
    const page = pagination.current ?? 1;
    const limit = pagination.pageSize ?? 10;

    const type = (tableFilters.type?.[0] as string) || "";
    const status = (tableFilters.status?.[0] as string) || "";
    const ratingRaw = (tableFilters.rating?.[0] as string) ?? "";
    const rating = ratingRaw ? parseInt(ratingRaw) : undefined;

    fetchNow({ page, limit, type, status, rating });
  };

  const isDirtySearch = (searchDraft || "").trim() !== (filters.search || "");

  return (
    <Card
      title="Feedback Management"
      extra={
        <Space>
          <Text className="!text-lg !font-semibold">
            Total Feedback: {total}
          </Text>
        </Space>
      }
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          value={searchDraft}
          placeholder="Search user name, email, message..."
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

      <Table<Feedback>
        loading={loading}
        rowKey="_id"
        columns={columns}
        dataSource={feedback}
        onChange={handleChange}
        pagination={{
          current: filters.page,
          pageSize: filters.limit,
          total,
          showSizeChanger: true,
        }}
        size="large"
        scroll={{ x: 1000 }}
        locale={{ emptyText: "No feedback found" }}
      />
    </Card>
  );
};

export default FeedbackTable;
