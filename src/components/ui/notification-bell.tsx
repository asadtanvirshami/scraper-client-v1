"use client";

import React from "react";
import { BellOutlined } from "@ant-design/icons";
import {
  Badge,
  Button,
  Dropdown,
  Space,
  Divider,
  Spin,
  Tag,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import { useAppDispatch } from "@/redux/hook";
import { markAllRead, clearAll } from "@/redux/slices/notification/slice";
import {
  useClearAllNotifications,
  useMarkAllRead,
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
        <FormattedMessage id="notifications.level.error" defaultMessage="error" />
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

export default function NotificationsBellAntd() {
  const dispatch = useAppDispatch();
  const { id } = useUserInfo();
  const [open, setOpen] = React.useState(false);

  const { items, unread, isLoading: isLoadingNotifications } = useNotifications(
    id,
    true
  );

  const markAllReadNotifications = useMarkAllRead();
  const clearAllNotifications = useClearAllNotifications();

  const isLoading =
    markAllReadNotifications.isPending || clearAllNotifications.isPending;

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

  const handleDeleteAll = async () =>
    await clearAllNotifications.mutateAsync(
      { userId: id },
      { onSuccess: () => dispatch(clearAll()) }
    );

  const handleMarkAllRead = async () =>
    await markAllReadNotifications.mutateAsync(id, {
      onSuccess: () => dispatch(markAllRead()),
    });

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 2,
  };

  const listWrapStyle: React.CSSProperties = {
    maxHeight: 420,
    overflowY: "auto",
    padding: "8px 12px 12px",
  };

  const cardStyle: React.CSSProperties = {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 12,
    padding: 12,
    background: "#fff",
    cursor: "default",
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "content",
      label: (
        <div onClick={(e) => e.stopPropagation()}>
          <div style={headerStyle}>
            <Text strong>
              <FormattedMessage
                id="notifications.title"
                defaultMessage="Notifications"
              />
            </Text>

            <Space size={6}>
              <Button
                size="small"
                type="text"
                disabled={items.length === 0 || isLoading}
                onClick={() => handleMarkAllRead()}
              >
                <FormattedMessage
                  id="notifications.actions.mark_all_read"
                  defaultMessage="Mark all as read"
                />
              </Button>

              <Button
                size="small"
                type="text"
                danger
                disabled={items.length === 0 || isLoading}
                onClick={() => handleDeleteAll()}
              >
                <FormattedMessage
                  id="notifications.actions.clear_all"
                  defaultMessage="Clear all"
                />
              </Button>
            </Space>
          </div>

          <Divider style={{ margin: 0 }} />

          {items.length === 0 ? (
            <div style={{ padding: 16 }}>
              {isLoadingNotifications ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 12,
                  }}
                >
                  <Spin />
                </div>
              ) : (
                <Text type="secondary">
                  <FormattedMessage
                    id="notifications.empty"
                    defaultMessage="You have no notifications."
                  />
                </Text>
              )}
            </div>
          ) : (
            <div style={listWrapStyle}>
              {(["error", "warning", "success", "info"] as const).map(
                (level) => {
                  const arr = grouped[level];
                  if (!arr || arr.length === 0) return null;

                  return (
                    <div key={level} style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        {levelTag(level)}
                        <Text type="secondary">{arr.length}</Text>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {arr.map((n) => (
                          <div
                            key={n.id}
                            style={{
                              ...cardStyle,
                              opacity: n.is_read ? 0.7 : 1,
                            }}
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

                      <Divider style={{ margin: "10px 0 0" }} />
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      open={open}
      onOpenChange={(v) => setOpen(v)}
      trigger={["click"]}
      menu={{ items: menuItems }}
      placement="bottomRight"
    >
      <Badge count={unread} size="small" overflowCount={99}>
        <Button shape="circle" icon={<BellOutlined />} />
      </Badge>
    </Dropdown>
  );
}
