"use client";

import React, { useMemo, useState } from "react";
import { message, Modal } from "antd";
import { useIntl } from "react-intl";
import { useQueryClient } from "@tanstack/react-query";

import UsersTableServer, {
  AppUser,
  RowActionLoading,
  ServerFilters,
} from "@/features/user/ui/table";

import {
  useFetchUsers,
  useBulkDeleteUsers,
  useBlockUser,
  useUpdateProfile,
  usersKeys,
} from "@/features/user/hooks";

import { useUserInfo } from "@/helpers/use-user";

/* ================= CONSTANTS ================= */

const DEFAULT_FILTERS: ServerFilters = {
  page: 1,
  limit: 10,
  search: "",
  role: "",
  auth_provider: "",
  is_verified: undefined,
  is_blocked: undefined,
};

/* ================= COMPONENT ================= */

const UserTableLayout: React.FC = () => {
  const intl = useIntl();
  const { id: adminId, role } = useUserInfo();
  const qc = useQueryClient();

  const [query, setQuery] = useState<ServerFilters>(DEFAULT_FILTERS);

  const [actionLoading, setActionLoading] = useState<RowActionLoading>({
    verifyId: null,
    blockId: null,
    deleteId: null,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  /* ================= QUERY ================= */

  const { data, isFetching } = useFetchUsers(query as any);
  const users = data?.data ?? [];
  const total = data?.pagination?.totalCount ?? 0;

  /* ================= MUTATIONS ================= */

  const bulkDeleteUsers = useBulkDeleteUsers();
  const blockUser = useBlockUser();
  const verifyUser = useUpdateProfile();

  /* ================= HELPERS ================= */

  const updateCacheRemoveUsers = (idsToRemove: string[]) => {
    qc.setQueryData(usersKeys.list(query as any), (oldData: any) => {
      if (!oldData) return oldData;

      const beforeCount = oldData.data?.length ?? 0;
      const nextData = (oldData.data ?? []).filter(
        (u: AppUser) => !idsToRemove.includes(u._id),
      );
      const removedFromPage = beforeCount - nextData.length;

      return {
      ...oldData,
        data: nextData,
        pagination: {
          ...oldData.pagination,
          totalCount: Math.max(0, (oldData.pagination?.totalCount ?? 0) - idsToRemove.length),
        },
      };
    });
  };

  /* ================= HANDLERS ================= */

  const handleDeleteOne = async (user: AppUser) => {
    if (role !== "ADMIN" || !adminId) return;

    setActionLoading((s) => ({ ...s, deleteId: user._id }));
    try {
      await bulkDeleteUsers.mutateAsync({
        userIds: [user._id],
        actorId: adminId,
      });

      message.success(
        intl.formatMessage({
          id: "commons.deleted",
          defaultMessage: "User deleted",
        }),
      );

      updateCacheRemoveUsers([user._id]);

      // also remove from selection if it was selected
      setSelectedRowKeys((prev) => prev.filter((k) => String(k) !== user._id));

      // go back to page 1 to avoid empty page edge cases
      setQuery((f) => ({ ...f, page: 1 }));
    } catch (error) {
      console.error("Delete error", error);
      message.error(
        intl.formatMessage({
          id: "commons.delete_failed",
          defaultMessage: "User delete failed",
        }),
      );
    } finally {
      setActionLoading((s) => ({ ...s, deleteId: null }));
    }
  };

  const handleBulkDeleteSelected = async () => {
    if (role !== "ADMIN" || !adminId) return;
    if (!selectedRowKeys.length) return;

    const ids = selectedRowKeys.map(String);

    Modal.confirm({
      title: intl.formatMessage({
        id: "admin.users.confirm.bulk_delete",
        defaultMessage: "Delete selected users?",
      }),
      content: intl.formatMessage(
        {
          id: "admin.users.confirm.bulk_delete_desc",
          defaultMessage: "This will delete {count} user(s). This action cannot be undone.",
        },
        { count: ids.length },
      ),
      okText: intl.formatMessage({ id: "commons.delete", defaultMessage: "Delete" }),
      okButtonProps: { danger: true },
      cancelText: intl.formatMessage({ id: "commons.cancel", defaultMessage: "Cancel" }),
      onOk: async () => {
        setActionLoading((s) => ({ ...s, deleteId: "__bulk__" }));
        try {
          await bulkDeleteUsers.mutateAsync({
            userIds: ids,
            actorId: adminId,
          });

          message.success(
            intl.formatMessage(
              {
                id: "admin.users.bulk_deleted",
                defaultMessage: "Deleted {count} user(s)",
              },
              { count: ids.length },
            ),
          );

          updateCacheRemoveUsers(ids);

          setSelectedRowKeys([]);
          setQuery((f) => ({ ...f, page: 1 }));
        } catch (error) {
          console.error("Bulk delete error", error);
          message.error(
            intl.formatMessage({
              id: "commons.delete_failed",
              defaultMessage: "User delete failed",
            }),
          );
        } finally {
          setActionLoading((s) => ({ ...s, deleteId: null }));
        }
      },
    });
  };

  const handleDeleteAll = async () => {
    if (role !== "ADMIN" || !adminId) return;
    if (!total) return;

    Modal.confirm({
      title: intl.formatMessage({
        id: "admin.users.confirm.delete_all",
        defaultMessage: "Delete all users?",
      }),
      content: intl.formatMessage({
        id: "admin.users.confirm.delete_all_desc",
        defaultMessage: "This will delete all users matching current filters. This action cannot be undone.",
      }),
      okText: intl.formatMessage({ id: "commons.delete", defaultMessage: "Delete" }),
      okButtonProps: { danger: true },
      cancelText: intl.formatMessage({ id: "commons.cancel", defaultMessage: "Cancel" }),
      onOk: async () => {
        setActionLoading((s) => ({ ...s, deleteId: "__all__" }));
        try {
          // ✅ if your API supports "delete all by filters", do that.
          // If it only supports ids, you MUST implement a server endpoint.
          await bulkDeleteUsers.mutateAsync({
            userIds: ["__ALL__"], // <-- replace with your actual API contract
            actorId: adminId,
            filters: query as any, // optional, if supported
          } as any);

          message.success(
            intl.formatMessage({
              id: "admin.users.all_deleted",
              defaultMessage: "All users deleted",
            }),
          );

          // easiest: invalidate list to refetch
          qc.invalidateQueries({ queryKey: usersKeys.list(query as any) });

          setSelectedRowKeys([]);
          setQuery((f) => ({ ...f, page: 1 }));
        } catch (error) {
          message.error(
            intl.formatMessage({
              id: "commons.delete_failed",
              defaultMessage: "User delete failed",
            }),
          );
        } finally {
          setActionLoading((s) => ({ ...s, deleteId: null }));
        }
      },
    });
  };

  const handleToggleBlock = async (user: AppUser) => {
    setActionLoading((s) => ({ ...s, blockId: user._id }));
    try {
      await blockUser.mutateAsync({ id: user._id });

      message.success(
        intl.formatMessage({
          id: user.is_blocked ? "commons.unblocked" : "commons.blocked",
          defaultMessage: user.is_blocked ? "User unblocked" : "User blocked",
        }),
      );

      qc.setQueryData(usersKeys.list(query as any), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((u: AppUser) =>
            u._id === user._id ? { ...u, is_blocked: !u.is_blocked } : u,
          ),
        };
      });
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: "commons.block_failed",
          defaultMessage: "User block failed",
        }),
      );
    } finally {
      setActionLoading((s) => ({ ...s, blockId: null }));
    }
  };

  const handleToggleVerify = async (user: AppUser) => {
    setActionLoading((s) => ({ ...s, verifyId: user._id }));
    try {
      await verifyUser.mutateAsync({
        _id: user._id,
        is_verified: !user.is_verified,
      });

      message.success(
        intl.formatMessage({
          id: user.is_verified ? "commons.unverified" : "commons.verified",
          defaultMessage: user.is_verified ? "User unverified" : "User verified",
        }),
      );

      qc.setQueryData(usersKeys.list(query as any), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((u: AppUser) =>
            u._id === user._id ? { ...u, is_verified: !u.is_verified } : u,
          ),
        };
      });
    } catch (error) {
      message.error(
        intl.formatMessage({
          id: "commons.verify_failed",
          defaultMessage: "User verify failed",
        }),
      );
    } finally {
      setActionLoading((s) => ({ ...s, verifyId: null }));
    }
  };

  return (
    <UsersTableServer
      data={users}
      total={total}
      loading={isFetching}
      actionLoading={actionLoading}
      value={query}
      onFetch={(next) => setQuery(next as any)}
      onDeleteOne={handleDeleteOne}
      onToggleBlock={handleToggleBlock}
      onToggleVerify={handleToggleVerify}
      selectedRowKeys={selectedRowKeys}
      onSelectionChange={setSelectedRowKeys}
      onBulkDelete={handleBulkDeleteSelected}
      onDeleteAll={handleDeleteAll}
    />
  );
};

export default UserTableLayout;
