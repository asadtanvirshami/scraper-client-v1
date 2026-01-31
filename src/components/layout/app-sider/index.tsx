"use client";

import React, { useMemo } from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  ChartBarSquareIcon,
  MegaphoneIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { useIntl } from "react-intl";
import { usePathname, useRouter } from "next/navigation";
import { useUserInfo } from "@/helpers/use-user";

const { Sider } = Layout;

type MenuKey =
  | "dashboard"
  | "campaigns"
  | "leads"
  | "folders"
  | "billing"
  | "settings";

const AppSider: React.FC = () => {
  const intl = useIntl();
  const router = useRouter();
  const pathname = usePathname();
  const { id: userId, role, is_admin } = useUserInfo() as any;

  const isAdmin = Boolean(is_admin) || role === "ADMIN" || role === "admin";
  const dashboardPrefix = isAdmin ? "a" : "u";
  const uid = userId ? String(userId) : "";

  // ✅ map menu keys to routes
  const routes: Record<MenuKey, string> = {
    dashboard: uid ? `/dashboard/${dashboardPrefix}/${uid}` : "/dashboard",
    campaigns: "/campaigns",
    leads: "/leads",
    folders: "/folders",
    billing: "/billings",
    settings: "/settings",
  };

  const items: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: <ChartBarSquareIcon className="w-5 h-5" />,
      label: intl.formatMessage({ id: "sidebar.dashboard" }),
    },
    {
      key: "campaigns",
      icon: <MegaphoneIcon className="w-5 h-5" />,
      label: intl.formatMessage({ id: "sidebar.campaigns" }),
    },
    {
      key: "leads",
      icon: <UserGroupIcon className="w-5 h-5" />,
      label: intl.formatMessage({ id: "sidebar.leads" }),
    },
    {
      key: "folders",
      icon: <FolderIcon className="w-5 h-5" />,
      label: intl.formatMessage({ id: "sidebar.folders", defaultMessage: "Folders" }),
    },
    {
      key: "billing",
      icon: <CreditCardIcon className="w-5 h-5" />,
      label: intl.formatMessage({ id: "sidebar.billing" }),
    },
    {
      key: "settings",
      icon: <Cog6ToothIcon className="w-5 h-5" />,
      label: intl.formatMessage({ id: "sidebar.settings" }),
    },
  ];

  // ✅ compute selected key from URL (supports nested paths & /dashboard/a|u/[id])
  const selectedKeys = useMemo(() => {
    if (!pathname) return ["dashboard"];

    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      return ["dashboard"];
    }

    const matched = (Object.keys(routes) as MenuKey[])
      .filter((k) => k !== "dashboard")
      .map((k) => ({ key: k, path: routes[k] }))
      .sort((a, b) => b.path.length - a.path.length)
      .find((r) => pathname === r.path || pathname.startsWith(r.path + "/"));

    return [matched?.key ?? "dashboard"];
  }, [pathname, routes]);

  const onClick: MenuProps["onClick"] = ({ key }) => {
    const k = key as MenuKey;
    const href = routes[k];
    if (!href) return;
    if (k === "dashboard" && !uid) return;
    router.push(href);
  };

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      width={200}
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(10px)",
        borderRight: "1px solid rgba(15,23,42,0.08)",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: "18px 18px 10px",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(15,23,42,0.06)",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "rgba(15,23,42,0.85)",
            }}
          >
            D
          </div>

          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(15,23,42,0.9)" }}>
              {intl.formatMessage({ id: "sidebar.brand" })}
            </div>
            <div style={{ fontSize: 12, color: "rgba(15,23,42,0.55)" }}>
              {isAdmin
                ? intl.formatMessage({ id: "sidebar.role.admin", defaultMessage: "Admin" })
                : intl.formatMessage({ id: "sidebar.role.user", defaultMessage: "Workspace" })}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        items={items}
        selectedKeys={selectedKeys}
        onClick={onClick}
        style={{
          background: "transparent",
          borderInlineEnd: "none",
          padding: 10,
        }}
        className="
          dhx-sider-menu
          !bg-transparent
        "
      />

      {/* Small shadcn-like look overrides (scoped by class) */}
      <style jsx global>{`
        .dhx-sider-menu .ant-menu-item {
          height: 42px;
          margin: 6px 0;
          border-radius: 10px;
          padding-left: 12px !important;
          padding-right: 12px !important;
          color: rgba(15, 23, 42, 0.75);
          transition: all 120ms ease;
        }

        .dhx-sider-menu .ant-menu-item .ant-menu-title-content {
          font-weight: 600;
          font-size: 13px;
        }

        .dhx-sider-menu .ant-menu-item:hover {
          background: rgba(15, 23, 42, 0.04);
          color: rgba(15, 23, 42, 0.9);
        }

        .dhx-sider-menu .ant-menu-item-selected {
          background: rgba(59, 130, 246, 0.12) !important;
          color: rgba(15, 23, 42, 0.92) !important;
        }

        .dhx-sider-menu .ant-menu-item-selected::after {
          display: none;
        }

        .dhx-sider-menu .ant-menu-item-icon {
          color: rgba(15, 23, 42, 0.7);
        }

        .dhx-sider-menu .ant-menu-item-selected .ant-menu-item-icon {
          color: rgba(15, 23, 42, 0.92);
        }
      `}</style>
    </Sider>
  );
};

export default AppSider;
