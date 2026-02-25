"use client";

import React from "react";
import { Divider, Space, Spin, Tag, Typography, Button, Empty } from "antd";
import {
  useClearAllNotifications,
  useNotifications,
  useMarkAllRead,
} from "@/features/notifications/hooks/use-notification";
import { useUserInfo } from "@/helpers/use-user";
import { useAppDispatch } from "@/redux/hook";
import { markAllRead, clearAll } from "@/redux/slices/notification/slice";
import { FormattedMessage } from "react-intl";
import Spinner from "@/components/ui (generic)/spinner";

const { Text } = Typography;

function formatTs(ts?: number) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

type Level = "info" | "success" | "warning" | "error";

const levelTag = (level: Level) => (
  <Tag
    color={
      level === "error"
        ? "red"
        : level === "warning"
          ? "gold"
          : level === "success"
            ? "green"
            : "blue"
    }
  >
    <FormattedMessage id={`notifications.level.${level}`} />
  </Tag>
);

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { id } = useUserInfo();

  const { items, isLoading: isLoadingNotifications } = useNotifications(
    id ?? "",
    true,
  );

  const clearAllNotifications = useClearAllNotifications();
  const markAllReadNotifications = useMarkAllRead();

  const isClearing = clearAllNotifications.isPending;
  const isMarking = markAllReadNotifications.isPending;

  const grouped = React.useMemo(() => {
    const g: Record<Level, typeof items> = {
      info: [],
      success: [],
      warning: [],
      error: [],
    };
    for (const n of items) {
      const level = (n.level as Level) || "info";
      g[level].push(n);
    }
    return g;
  }, [items]);

  const handleClearAll = async () =>
    await clearAllNotifications.mutateAsync(id as string, {
      onSuccess: () => dispatch(clearAll()),
    });

  const handleMarkAllRead = async () =>
    await markAllReadNotifications.mutateAsync(id as string, {
      onSuccess: () => dispatch(markAllRead()),
    });

  const hasUnread = items.some((n: any) => !n.is_read);

  if (isLoadingNotifications) {
    return <Spinner size="large" />;
  }

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
            disabled={items.length === 0 || isClearing}
            loading={isClearing}
            onClick={handleClearAll}
          >
            <FormattedMessage id="notifications.actions.clear_all" />
          </Button>
        </Space>
      </div>

      {!items.length && (
        <div style={{ marginTop: 12 }}>
          <Empty />
          {/* <Text type="secondary">
            <FormattedMessage id="notifications.empty" />
          </Text> */}
        </div>
      )}
      {/* CONTENT */}

      <div style={{ marginTop: 12 }}>
        {(["error", "warning", "success", "info"] as const).map((level) => {
          const arr = grouped[level];
          if (!arr.length) return null;

          return (
            <div key={level} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {levelTag(level)}
                <Text type="secondary">{arr.length}</Text>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {arr.map((n: any) => (
                  <div
                    key={n.id}
                    style={{
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 12,
                      padding: 12,
                      background: "#272626",
                      opacity: n.is_read ? 0.7 : 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <Text strong style={{ fontSize: 13 }}>
                        {n.title}
                      </Text>

                      {!n.is_read && (
                        <Tag color="processing" style={{ margin: 0 }}>
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

                    {n.ts && (
                      <div style={{ marginTop: 6 }}>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {formatTs(n.ts)}
                        </Text>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Divider style={{ margin: "16px 0 0" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
