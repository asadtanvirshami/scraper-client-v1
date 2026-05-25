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
  Modal,
  Descriptions,
  Avatar,
  theme,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import TableHeaderTitle from "@/components/ui (generic)/table-header-title";

/* ================= TYPES ================= */

export type UserRole = "USER" | "ADMIN" | "user" | "admin";

export type AppUser = {
  _id: string;
  first_name: string;
  last_name?: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  avatar_url_id?: string;
  auth_provider?: "local" | "google" | "facebook" | "github";
  is_verified?: boolean;
  is_blocked?: boolean;
  created?: string | Date;
};

export type ServerFilters = {
  page: number;
  limit: number;
  search?: string;

  role?: string;
  auth_provider?: string;
  is_verified?: boolean | undefined;
  is_blocked?: boolean | undefined;
};

export type RowActionLoading = {
  verifyId?: string | null;
  blockId?: string | null;
  deleteId?: string | null;
};

/* ================= PROPS ================= */

type Props = {
  data?: AppUser[];
  total?: number;
  loading?: boolean;
  actionLoading?: RowActionLoading;

  value: ServerFilters;
  onFetch: (filters: ServerFilters) => void;

  // ✅ if true => show filters + actions; if false => hide both
  showFilters?: boolean;

  onDeleteOne?: (user: AppUser) => Promise<void> | void;
  onToggleBlock?: (user: AppUser) => Promise<void> | void;
  onToggleVerify?: (user: AppUser) => Promise<void> | void;

  selectedRowKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;

  onBulkDelete?: () => void;
  onDeleteAll?: () => void;
};

/* ================= COMPONENT ================= */

const UsersTableServer: React.FC<Props> = ({
  data = [],
  total = 0,
  loading = false,
  actionLoading,
  value,
  showFilters = true,
  onFetch,
  onDeleteOne,
  onToggleBlock,
  onToggleVerify,
  selectedRowKeys = [],
  onSelectionChange,
  onBulkDelete,
  onDeleteAll,
}) => {
  const { Text } = Typography;
  const intl = useIntl();
  const { token } = theme.useToken();

  const filters = value;

  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  React.useEffect(() => setSearchDraft(filters.search ?? ""), [filters.search]);

  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  // ✅ Only provide filteredValue when showFilters = true
  const antdFilteredValue = useMemo(() => {
    if (!showFilters) {
      return {
        role: null,
        auth_provider: null,
        is_verified: null,
        is_blocked: null,
      };
    }

    return {
      role: filters.role ? [filters.role] : null,
      auth_provider: filters.auth_provider ? [filters.auth_provider] : null,
      is_verified:
        filters.is_verified !== undefined
          ? [String(filters.is_verified)]
          : null,
      is_blocked:
        filters.is_blocked !== undefined ? [String(filters.is_blocked)] : null,
    };
  }, [
    showFilters,
    filters.role,
    filters.auth_provider,
    filters.is_verified,
    filters.is_blocked,
  ]);

  const withFilters = <T extends object>(cfg: T) =>
    showFilters ? cfg : ({} as T);

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
      role: "",
      auth_provider: "",
      is_verified: undefined,
      is_blocked: undefined,
    });
  };

  // ✅ If you hide filters, also clear server-side filter state
  React.useEffect(() => {
    if (!showFilters) {
      onFetch({
        ...filters,
        page: 1,
        role: "",
        auth_provider: "",
        is_verified: undefined,
        is_blocked: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFilters]);

  const baseColumns: ColumnsType<AppUser> = useMemo(() => {
    const cols: ColumnsType<AppUser> = [
      {
        title: (
          <FormattedMessage id="admin.users.table.user" defaultMessage="User" />
        ),
        key: "user",
        render: (_, user) => (
          <Space>
            <Avatar
              src={user.avatar_url}
              icon={!user.avatar_url && <UserOutlined />}
            />
            <div>
              <div className="font-medium">
                {user.first_name} {user.last_name || ""}
              </div>
              <div className="text-xs text-gray-500 dark:text-white/60">
                {user.email}
              </div>
            </div>
          </Space>
        ),
      },

      {
        title: (
          <FormattedMessage id="admin.users.table.role" defaultMessage="Role" />
        ),
        dataIndex: "role",
        key: "role",
        ...withFilters({
          filters: [
            { text: "ADMIN", value: "ADMIN" },
            { text: "USER", value: "USER" },
          ],
          filteredValue: antdFilteredValue.role as any,
        }),
        render: (v) => (
          <Tag color={String(v).toUpperCase() === "ADMIN" ? "purple" : "blue"}>
            {String(v).toUpperCase()}
          </Tag>
        ),
      },

      {
        title: (
          <FormattedMessage
            id="admin.users.table.provider"
            defaultMessage="Provider"
          />
        ),
        dataIndex: "auth_provider",
        key: "auth_provider",
        ...withFilters({
          filters: [
            { text: "local", value: "local" },
            { text: "google", value: "google" },
            { text: "facebook", value: "facebook" },
            { text: "github", value: "github" },
          ],
          filteredValue: antdFilteredValue.auth_provider as any,
        }),
        render: (v) => <Tag>{String(v || "local")}</Tag>,
      },

      {
        title: (
          <FormattedMessage
            id="admin.users.table.verified"
            defaultMessage="Verified"
          />
        ),
        dataIndex: "is_verified",
        key: "is_verified",
        ...withFilters({
          filters: [
            {
              text: <FormattedMessage id="commons.yes" defaultMessage="Yes" />,
              value: "true",
            },
            {
              text: <FormattedMessage id="commons.no" defaultMessage="No" />,
              value: "false",
            },
          ],
          filteredValue: antdFilteredValue.is_verified as any,
        }),
        render: (v) =>
          v ? (
            <Tag color="green">
              <FormattedMessage id="commons.yes" defaultMessage="Yes" />
            </Tag>
          ) : (
            <Tag color="red">
              <FormattedMessage id="commons.no" defaultMessage="No" />
            </Tag>
          ),
      },

      {
        title: (
          <FormattedMessage
            id="admin.users.table.blocked"
            defaultMessage="Blocked"
          />
        ),
        dataIndex: "is_blocked",
        key: "is_blocked",
        ...withFilters({
          filters: [
            {
              text: <FormattedMessage id="commons.yes" defaultMessage="Yes" />,
              value: "true",
            },
            {
              text: <FormattedMessage id="commons.no" defaultMessage="No" />,
              value: "false",
            },
          ],
          filteredValue: antdFilteredValue.is_blocked as any,
        }),
        render: (v) =>
          v ? (
            <Tag color="red">
              <FormattedMessage id="commons.yes" defaultMessage="Yes" />
            </Tag>
          ) : (
            <Tag color="green">
              <FormattedMessage id="commons.no" defaultMessage="No" />
            </Tag>
          ),
      },
    ];

    // ✅ Actions column is ALSO controlled by showFilters (as you requested)
    if (showFilters) {
      cols.push({
        title: (
          <FormattedMessage id="commons.actions" defaultMessage="Actions" />
        ),
        key: "actions",
        fixed: "right",
        width: 260,
        render: (_, user) => (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelectedUser(user)}
            />

            <Popconfirm
              title={intl.formatMessage({
                id: user.is_blocked
                  ? "commons.confirm_unblock"
                  : "commons.confirm_block",
              })}
              onConfirm={async () => {
                if (onToggleBlock) await onToggleBlock({ ...user });
              }}
            >
              <Button
                size="small"
                loading={actionLoading?.blockId === user._id}
                icon={user.is_blocked ? <UnlockOutlined /> : <LockOutlined />}
              />
            </Popconfirm>

            <Popconfirm
              title={intl.formatMessage({
                id: user.is_verified
                  ? "commons.confirm_unverify"
                  : "commons.confirm_verify",
                defaultMessage: user.is_verified
                  ? "Unverify this user?"
                  : "Verify this user?",
              })}
              onConfirm={async () => {
                if (onToggleVerify) await onToggleVerify({ ...user });
              }}
            >
              <Button
                size="small"
                loading={actionLoading?.verifyId === user._id}
                icon={
                  user.is_verified ? (
                    <CloseCircleOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
              />
            </Popconfirm>

            <Popconfirm
              title={intl.formatMessage({
                id: "commons.confirm_delete_one",
                defaultMessage: "Delete this user?",
              })}
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                if (onDeleteOne) await onDeleteOne(user);
              }}
            >
              <Button
                size="small"
                danger
                loading={actionLoading?.deleteId === user._id}
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
        ),
      });
    }

    return cols;
  }, [
    showFilters,
    intl,
    actionLoading?.blockId,
    actionLoading?.verifyId,
    actionLoading?.deleteId,
    antdFilteredValue.role,
    antdFilteredValue.auth_provider,
    antdFilteredValue.is_verified,
    antdFilteredValue.is_blocked,
    onDeleteOne,
    onToggleBlock,
    onToggleVerify,
  ]);

  const handleChange = (
    pagination: TablePaginationConfig,
    tableFilters: Record<string, FilterValue | null>,
  ) => {
    const page = pagination.current ?? 1;
    const limit = pagination.pageSize ?? 10;

    // ✅ if filters/actions are hidden, ignore tableFilters completely
    if (!showFilters) {
      fetchNow({ page, limit });
      return;
    }

    const role = (tableFilters.role?.[0] as string) || "";
    const auth_provider = (tableFilters.auth_provider?.[0] as string) || "";

    const verifiedRaw = (tableFilters.is_verified?.[0] as string) ?? "";
    const is_verified =
      verifiedRaw === "true"
        ? true
        : verifiedRaw === "false"
          ? false
          : undefined;

    const blockedRaw = (tableFilters.is_blocked?.[0] as string) ?? "";
    const is_blocked =
      blockedRaw === "true" ? true : blockedRaw === "false" ? false : undefined;

    fetchNow({ page, limit, role, auth_provider, is_verified, is_blocked });
  };

  const rowSelection =
    onSelectionChange && selectedRowKeys
      ? {
          selectedRowKeys,
          onChange: onSelectionChange,
        }
      : undefined;

  const isDirtySearch = (searchDraft || "").trim() !== (filters.search || "");
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

  return (
    <>
      <Card
        title={
          <TableHeaderTitle
            icon={<UserOutlined />}
            title={<FormattedMessage id="admin.users.title" defaultMessage="Users" />}
          />
        }
        extra={
          <Space>
            {/* ✅ also hide bulk actions when showFilters is false */}
            {showFilters && onDeleteAll && data.length > 0 && (
              <Button
                danger
                onClick={onDeleteAll}
                loading={loading}
                size="middle"
              >
                <FormattedMessage
                  id="commons.delete_all"
                  defaultMessage="Delete All"
                />
              </Button>
            )}

            {showFilters && selectedRowKeys && selectedRowKeys.length > 0 && (
              <Button
                danger
                onClick={onBulkDelete}
                loading={loading}
                size="middle"
              >
                <FormattedMessage
                  id="commons.bulk_delete"
                  defaultMessage="Delete Selected ({count})"
                  values={{ count: selectedRowKeys.length }}
                />
              </Button>
            )}

            <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
              <FormattedMessage
                id="admin.users.total"
                defaultMessage="Total {total}"
                values={{ total }}
              />
            </Tag>
          </Space>
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
                id: "admin.users.search.placeholder",
                defaultMessage: "Search name or email",
              })}
              onChange={(e) => setSearchDraft(e.target.value)}
              className="sm:max-w-md"
              onPressEnter={applySearch}
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
            </Space>
          </div>
        )}

        <Table<AppUser>
          loading={loading}
          rowKey="_id"
          columns={baseColumns}
          dataSource={data}
          onChange={handleChange}
          rowSelection={rowSelection}
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
          scroll={{ x: 900 }}
          locale={{
            emptyText: (
              <FormattedMessage
                id="admin.users.empty"
                defaultMessage="No users"
              />
            ),
          }}
        />
      </Card>

      {/* ✅ Modal still works even if actions hidden (it just won't open) */}
      <Modal
        open={!!selectedUser}
        title={intl.formatMessage({
          id: "admin.users.details.title",
          defaultMessage: "User details",
        })}
        footer={null}
        onCancel={() => setSelectedUser(null)}
      >
        {selectedUser && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item
              label={intl.formatMessage({ id: "commons.name" })}
            >
              {selectedUser.first_name} {selectedUser.last_name}
            </Descriptions.Item>

            <Descriptions.Item
              label={intl.formatMessage({ id: "commons.email" })}
            >
              {selectedUser.email}
            </Descriptions.Item>

            <Descriptions.Item
              label={intl.formatMessage({ id: "commons.role" })}
            >
              {selectedUser.role}
            </Descriptions.Item>

            <Descriptions.Item
              label={intl.formatMessage({ id: "admin.users.table.verified" })}
            >
              {selectedUser.is_verified
                ? intl.formatMessage({ id: "commons.yes" })
                : intl.formatMessage({ id: "commons.no" })}
            </Descriptions.Item>

            <Descriptions.Item
              label={intl.formatMessage({ id: "admin.users.table.blocked" })}
            >
              {selectedUser.is_blocked
                ? intl.formatMessage({ id: "commons.yes" })
                : intl.formatMessage({ id: "commons.no" })}
            </Descriptions.Item>

            <Descriptions.Item
              label={intl.formatMessage({ id: "commons.created" })}
            >
              {formatDateTime(selectedUser.created)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default UsersTableServer;
