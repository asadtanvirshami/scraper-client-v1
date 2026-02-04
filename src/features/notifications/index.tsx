"use client";

import React from "react";
import { Divider, Space, Spin, Tag, Typography, Button } from "antd";
import { useAppDispatch } from "@/redux/hook";
import { clearAll } from "@/redux/slices/notification/slice";
import {
  useClearAllNotifications,
  useNotifications,
} from "@/features/notifications/hooks/use-notification";
import { useUserInfo } from "@/helpers/use-user";
import { FormattedMessage } from "react-intl";

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

const levelTag = (level: Level) => {
  if (level === "error")
    return (
      <Tag color="red">
        <FormattedMessage
          id="notifications.level.error"
          defaultMessage="error"
        />
      </Tag>
    );
  if (level === "warning")
    return (
      <Tag color="gold">
        <FormattedMessage
          id="notifications.level.warning"
          defaultMessage="warning"
        />
      </Tag>
    );
  if (level === "success")
    return (
      <Tag color="green">
        <FormattedMessage
          id="notifications.level.success"
          defaultMessage="success"
        />
      </Tag>
    );
  return (
    <Tag color="blue">
      <FormattedMessage id="notifications.level.info" defaultMessage="info" />
    </Tag>
  );
};

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { id } = useUserInfo();

  const { items, isLoading: isLoadingNotifications } = useNotifications(
    id ?? "",
    true,
  );

  const clearAllNotifications = useClearAllNotifications();

  const isLoading = clearAllNotifications.isPending;

  const grouped = React.useMemo(() => {
    const g: Record<Level, typeof items> = {
      info: [],
      success: [],
      warning: [],
      error: [],
    };
    for (const n of items) {
      const level = (n.level as Level) || "info";
      (g[level] ??= []).push(n);
    }
    return g;
  }, [items]);

  const handleClearAll = async () =>
    await clearAllNotifications.mutateAsync(id as string);

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 2,
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  };

  const pageWrapStyle: React.CSSProperties = {
    margin: "0 auto",
    padding: "16px 12px 32px",
  };

  const listWrapStyle: React.CSSProperties = {
    maxHeight: "calc(100vh - 150px)",
    overflowY: "auto",
    padding: "12px 4px 0",
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
    cursor: "default",
  };

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      <div style={pageWrapStyle}>
        <div style={headerStyle}>
          <Text strong style={{ fontSize: 16 }}>
            <FormattedMessage
              id="notifications.title"
              defaultMessage="Notifications"
            />
          </Text>

          <Space size={8}>
            <Button
              danger
              disabled={items.length === 0 || isLoading}
              loading={isLoading}
              onClick={handleClearAll}
            >
              <FormattedMessage
                id="notifications.actions.clear_all"
                defaultMessage="Clear all"
              />
            </Button>
          </Space>
        </div>

        {isLoadingNotifications ? (
          <div
            style={{ display: "flex", justifyContent: "center", padding: 24 }}
          >
            <Spin />
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: 16 }}>
            <Text type="secondary">
              <FormattedMessage
                id="notifications.empty"
                defaultMessage="You have no notifications."
              />
            </Text>
          </div>
        ) : (
          <div style={listWrapStyle}>
            {(["error", "warning", "success", "info"] as const).map((level) => {
              const arr = grouped[level];
              if (!arr || arr.length === 0) return null;

              return (
                <div key={level} style={{ marginBottom: 12 }}>
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

                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {arr.map((n:any) => (
                      <div
                        key={n.id}
                        style={{ ...cardStyle, opacity: n.is_read ? 0.7 : 1 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 10,
                          }}
                        >
                          <Text
                            strong
                            style={{ fontSize: 13, lineHeight: 1.2 }}
                          >
                            {n.title}
                          </Text>

                          {!n.is_read && (
                            <Tag color="processing" style={{ margin: 0 }}>
                              <FormattedMessage
                                id="notifications.badge.new"
                                defaultMessage="NEW"
                              />
                            </Tag>
                          )}
                        </div>

                        {n.message ? (
                          <div style={{ marginTop: 6 }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>
                              {n.message}
                            </Text>
                          </div>
                        ) : null}

                        {n.ts ? (
                          <div style={{ marginTop: 6 }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {formatTs(n.ts)}
                            </Text>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <Divider style={{ margin: "12px 0 0" }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
