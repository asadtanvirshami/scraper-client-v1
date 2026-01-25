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
  Switch,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";

type User = {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_blocked?: boolean;
  is_deleted?: boolean;
  createdAt?: string;
  last_login?: string;
};

type ServerFilters = {
  page: number;
  limit: number;
  search?: string;
  is_blocked?: boolean | undefined;
  is_deleted?: boolean | undefined;
};

type Props = {
  users?: User[];
  total?: number;
  loading?: boolean;
  value: ServerFilters;
  onFetch: (filters: ServerFilters) => void;
  onDeleteUser?: (user: User) => Promise<void> | void;
  onUpdateUser?: (id: string, payload: Partial<User>) => Promise<void> | void;
};

const UsersTable: React.FC<Props> = ({
  users = [],
  total = 0,
  loading = false,
  value,
  onFetch,
  onDeleteUser,
  onUpdateUser,
}) => {
  const { Text } = Typography;
  const intl = useIntl();

  const filters = value;
  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  React.useEffect(() => setSearchDraft(filters.search ?? ""), [filters.search]);

  const antdFilteredValue = useMemo(() => {
    return {
      is_blocked:
        typeof filters.is_blocked === "boolean"
          ? [String(filters.is_blocked)]
          : null,
      is_deleted:
        typeof filters.is_deleted === "boolean"
          ? [String(filters.is_deleted)]
          : null,
    };
  }, [filters.is_blocked, filters.is_deleted]);

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
      is_blocked: undefined,
      is_deleted: undefined,
    });
  };

  const toggleBlockUser = async (user: User) => {
    try {
      if (onUpdateUser) {
        await onUpdateUser(user._id, { is_blocked: !user.is_blocked });
        message.success(
          user.is_blocked
            ? "User unblocked successfully"
            : "User blocked successfully"
        );
        fetchNow({});
      }
    } catch {
      message.error("Failed to update user status");
    }
  };

  const doDeleteUser = async (user: User) => {
    try {
      if (onDeleteUser) await onDeleteUser(user);
      message.success("User deleted successfully");
      fetchNow({});
    } catch {
      message.error("Failed to delete user");
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: "Name",
      key: "name",
      render: (_, record) =>
        `${record.first_name || ""} ${record.last_name || ""}`.trim() || "-",
    },
    {
      title: "Email",
      key: "email",
      ellipsis: true,
      render: (_, record) => record.email || "-",
    },
    {
      title: "Status",
      key: "status",
      filters: [
        { text: "Blocked", value: "true" },
        { text: "Active", value: "false" },
      ],
      filteredValue: antdFilteredValue.is_blocked as any,
      render: (_, record) => (
        <Space>
          <Tag color={record.is_blocked ? "red" : "green"}>
            {record.is_blocked ? "Blocked" : "Active"}
          </Tag>
          {record.is_deleted && <Tag color="volcano">Deleted</Tag>}
        </Space>
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

    const blockedRaw = (tableFilters.is_blocked?.[0] as string) ?? "";
    const is_blocked =
      blockedRaw === "true" ? true : blockedRaw === "false" ? false : undefined;

    const deletedRaw = (tableFilters.is_deleted?.[0] as string) ?? "";
    const is_deleted =
      deletedRaw === "true" ? true : deletedRaw === "false" ? false : undefined;

    fetchNow({ page, limit, is_blocked, is_deleted });
  };

  const isDirtySearch = (searchDraft || "").trim() !== (filters.search || "");

  return (
    <Card
      title="Users Management"
      extra={
        <Space>
          <Text className="!text-lg !font-semibold">
            Total Users: {total}
          </Text>
        </Space>
      }
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          value={searchDraft}
          placeholder="Search name, email..."
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

      <Table<User>
        loading={loading}
        rowKey="_id"
        columns={columns}
        dataSource={users}
        onChange={handleChange}
        pagination={{
          current: filters.page,
          pageSize: filters.limit,
          total,
          showSizeChanger: true,
        }}
        size="large"
        scroll={{ x: 900 }}
        locale={{ emptyText: "No users found" }}
      />
    </Card>
  );
};

export default UsersTable;
