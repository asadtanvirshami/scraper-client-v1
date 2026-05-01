"use client";

import React, { useState } from "react";
import { Divider, Pagination, Space, Tag, Typography, Button, Empty } from "antd";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useClearAllNotifications,
  useMarkAllRead,
} from "@/features/notifications/hooks/use-notification";
import { useUserInfo } from "@/helpers/use-user";
import { useAppDispatch } from "@/redux/hook";
import { markAllRead, clearAll } from "@/redux/slices/notification/slice";
import { FormattedMessage } from "react-intl";
import Spinner from "@/components/ui (generic)/spinner";
import { fetchNotifications } from "@/api/api_calls/notifications";

const { Text } = Typography;

const PAGE_SIZE = 10;

function formatTs(ts?: string | number) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

type Level = "info" | "success" | "warning" | "error" | "alert" | "reminder";

const levelColor: Record<string, string> = {
  error: "red",
  warning: "gold",
  success: "green",
  alert: "orange",
  reminder: "purple",
  info: "blue",
};

const levelTag = (level: string) => (
  <Tag color={levelColor[level] ?? "blue"}>
    {level.charAt(0).toUpperCase() + level.slice(1)}
  </Tag>
);

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { id } = useUserInfo();

  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["notifications", "paginated", id, page],
    queryFn: () => fetchNotifications((page - 1) * PAGE_SIZE, PAGE_SIZE),
    enabled: !!id,
    staleTime: 30_000,
  });

  const notifications: any[] = data?.data?.data ?? [];
  const totalCount: number = data?.data?.totalCount ?? 0;

  const clearAllNotifications = useClearAllNotifications();
  const markAllReadNotifications = useMarkAllRead();

  const isClearing = clearAllNotifications.isPending;
  const isMarking = markAllReadNotifications.isPending;

  const handleClearAll = async () => {
    await clearAllNotifications.mutateAsync(id as string, {
      onSuccess: () => {
        dispatch(clearAll());
        setPage(1);
        queryClient.invalidateQueries({ queryKey: ["notifications", "paginated"] });
      },
    });
  };

  const handleMarkAllRead = async () => {
    await markAllReadNotifications.mutateAsync(id as string, {
      onSuccess: () => {
        dispatch(markAllRead());
        queryClient.invalidateQueries({ queryKey: ["notifications", "paginated"] });
      },
    });
  };

  const hasUnread = notifications.some((n: any) => !n.is_read);

  if (isLoading) return <Spinner size="large" />;

  return (
    <div style={{ minHeight: "100vh", padding: "16px 12px 32px" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 12,
        }}
      >
        <Text strong style={{ fontSize: 16 }}>
          <FormattedMessage id="notifications.title" />
          {totalCount > 0 && (
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 400, marginLeft: 8 }}>
              ({totalCount})
            </Text>
          )}
        </Text>

        <Space>
          <Button
            disabled={!hasUnread || isMarking}
            loading={isMarking}
            onClick={handleMarkAllRead}
          >
            <FormattedMessage id="notifications.actions.mark_all_read" />
          </Button>

          <Button
            danger
            disabled={totalCount === 0 || isClearing}
            loading={isClearing}
            onClick={handleClearAll}
          >
            <FormattedMessage id="notifications.actions.clear_all" />
          </Button>
        </Space>
      </div>

      {/* CONTENT */}
      {notifications.length === 0 && !isFetching ? (
        <div style={{ marginTop: 24 }}>
          <Empty />
        </div>
      ) : (
        <div style={{ marginTop: 12, opacity: isFetching ? 0.6 : 1, transition: "opacity 0.2s" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notifications.map((n: any) => (
              <div
                key={n.id ?? n._id}
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  padding: 12,
                  background: "#272626",
                  opacity: n.is_read ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {levelTag(n.type ?? "info")}
                    <Text strong style={{ fontSize: 13 }}>
                      {n.title}
                    </Text>
                  </div>

                  {!n.is_read && (
                    <Tag color="processing" style={{ margin: 0, flexShrink: 0 }}>
                      <FormattedMessage id="notifications.badge.new" />
                    </Tag>
                  )}
                </div>

                {n.message && (
                  <div style={{ marginTop: 6 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {n.message}
                    </Text>
                  </div>
                )}

                {(n.created_at ?? n.ts) && (
                  <div style={{ marginTop: 6 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {formatTs(n.created_at ?? n.ts)}
                    </Text>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Divider style={{ margin: "20px 0 16px" }} />

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              current={page}
              pageSize={PAGE_SIZE}
              total={totalCount}
              onChange={(p) => setPage(p)}
              showSizeChanger={false}
              showTotal={(total) => `${total} notifications`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
