"use client";

import React, { useMemo } from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  ChartBarSquareIcon,
  ChartPieIcon,
  MegaphoneIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  FolderIcon,
  BellIcon,
  BugAntIcon,
  DocumentTextIcon,
  UsersIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import { useIntl } from "react-intl";
import { usePathname, useRouter } from "next/navigation";
import { useUserInfo } from "@/helpers/use-user";

const { Sider } = Layout;

type MenuKey =
  // workspace
  | "dashboard"
  | "analysis"
  | "campaigns"
  | "leads"
  | "folders"
  | "billing"
  | "settings"
  | "notifications"
  | "email_templates"
  // admin
  | "admin_dashboard"
  | "admin_users"
  | "admin_bugs"
  | "admin_feedbacks"
  | "admin_notifications"
  | "admin_reports";

const AppSider: React.FC = () => {
  const intl = useIntl();
  const router = useRouter();
  const pathname = usePathname();
  const { id: userId, role, is_admin } = useUserInfo() as any;

  const isAdmin = Boolean(is_admin) || role === "ADMIN" || role === "admin";
  const uid = userId ? String(userId) : "";

  // ✅ map menu keys to routes
  // NOTE: keep these aligned with your actual route structure
  const routes: Record<MenuKey, string> = {
    // workspace
    dashboard: uid ? `/dashboard/u/${uid}` : "/dashboard",
    analysis: "/analysis",
    campaigns: "/campaigns",
    leads: "/leads",
    folders: "/folders",
    notifications: "/notifications",
    billing: "/billings",
    settings: "/settings",
    email_templates: "/email-templates",

    // admin (you can adjust paths if yours differ)
    admin_dashboard: uid ? `/dashboard/a/${uid}` : "/dashboard/a",
    admin_users: "/users",
    admin_bugs: "/bugs",
    admin_feedbacks: "/feedback",
    admin_notifications: "/notifications",
    admin_reports: "/reports",
  };

  const workspaceItems: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: <ChartBarSquareIcon className="h-5 w-5" />,
      label: intl.formatMessage({ id: "sidebar.dashboard" }),
    },
    {
      key: "analysis",
      icon: <ChartPieIcon className="h-5 w-5" />,
      label: intl.formatMessage({
        id: "sidebar.analysis",
        defaultMessage: "Analysis",
      }),
    },
    {
      key: "campaigns",
      icon: <MegaphoneIcon className="h-5 w-5" />,
      label: intl.formatMessage({ id: "sidebar.campaigns" }),
    },
    {
      key: "leads",
      icon: <UserGroupIcon className="h-5 w-5" />,
      label: intl.formatMessage({ id: "sidebar.leads" }),
    },
    {
      key: "folders",
      icon: <FolderIcon className="h-5 w-5" />,
      label: intl.formatMessage({
        id: "sidebar.folders",
        defaultMessage: "Folders",
      }),
    },
    {
      key: "billing",
      icon: <CreditCardIcon className="h-5 w-5" />,
      label: intl.formatMessage({ id: "sidebar.billing" }),
    },
    {
      key: "notifications",
      icon: <BellIcon className="h-5 w-5" />,
      label: intl.formatMessage({ id: "sidebar.notifications" }),
    },
    {
      key: "email_templates",
      icon: <RectangleStackIcon className="h-5 w-5" />,
      label: intl.formatMessage({
        id: "sidebar.email_templates",
        defaultMessage: "Email Templates",
      }),
    },
    {
      key: "settings",
      icon: <Cog6ToothIcon className="h-5 w-5" />,
      label: intl.formatMessage({ id: "sidebar.settings" }),
    },
  ];

  // ✅ Admin menu: Users, Bugs, Feedbacks, Notifications, Dashboard, Reports
  const adminItems: MenuProps["items"] = [
    {
      key: "admin_dashboard",
      icon: <ChartBarSquareIcon className="h-5 w-5" />,
      label: intl.formatMessage({
        id: "sidebar.admin.dashboard",
        defaultMessage: "Dashboard",
      }),
    },
    {
      key: "admin_users",
      icon: <UsersIcon className="h-5 w-5" />,
      label: intl.formatMessage({
        id: "sidebar.admin.users",
        defaultMessage: "Users",
      }),
    },
    {
      key: "admin_bugs",
      icon: <BugAntIcon className="h-5 w-5" />,
      label: intl.formatMessage({
        id: "sidebar.admin.bugs",
        defaultMessage: "Bugs",
      }),
    },
    {
      key: "admin_feedbacks",
      icon: <DocumentTextIcon className="h-5 w-5" />,
      label: intl.formatMessage({
        id: "sidebar.admin.feedbacks",
        defaultMessage: "Feedbacks",
      }),
    },
    {
      key: "admin_notifications",
      icon: <BellIcon className="h-5 w-5" />,
      label: intl.formatMessage({
        id: "sidebar.admin.notifications",
        defaultMessage: "Notifications",
      }),
    },
    {
      key: "admin_reports",
      icon: <DocumentTextIcon className="h-5 w-5" />,
      label: intl.formatMessage({
        id: "sidebar.admin.reports",
        defaultMessage: "Reports",
      }),
    },
  ];

  const items = isAdmin ? adminItems : workspaceItems;

  // ✅ compute selected key from URL (supports nested paths)
  const selectedKeys = useMemo(() => {
    if (!pathname) return [isAdmin ? "admin_dashboard" : "dashboard"];

    // admin dashboard route detection
    if (pathname.startsWith("/dashboard/a")) return ["admin_dashboard"];

    // workspace dashboard route detection
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/u")) {
      return ["dashboard"];
    }

    // find best match by longest prefix
    const matched = (Object.keys(routes) as MenuKey[])
      .map((k) => ({ key: k, path: routes[k] }))
      .sort((a, b) => b.path.length - a.path.length)
      .find((r) => pathname === r.path || pathname.startsWith(r.path + "/"));

    return [matched?.key ?? (isAdmin ? "admin_dashboard" : "dashboard")];
  }, [pathname, isAdmin]); // routes is stable but OK; keep deps minimal

  const onClick: MenuProps["onClick"] = ({ key }) => {
    const k = key as MenuKey;
    const href = routes[k];
    if (!href) return;

    // if user id required for these dashboard routes, prevent pushing
    if ((k === "dashboard" || k === "admin_dashboard") && !uid) return;

    router.push(href);
  };

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      width={200}
      style={{
        // background: "rgba(255,255,255,0.85)",
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
          <div style={{ lineHeight: 1.1 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                background: "linear-gradient(90deg, #8b5cf6 0%, #a78bfa 55%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {intl.formatMessage({ id: "sidebar.brand" })}
            </div>

            <div style={{ fontSize: 12 }}>
              {isAdmin
                ? intl.formatMessage({
                    id: "sidebar.role.admin",
                    defaultMessage: "Admin",
                  })
                : intl.formatMessage({
                    id: "sidebar.role.user",
                    defaultMessage: "Workspace",
                  })}
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
        className="dhx-sider-menu !bg-transparent !dark:text-white"
      />

      {/* Small shadcn-like look overrides (scoped by class) */}
      <style jsx global>{`
        .dhx-sider-menu .ant-menu-item {
          height: 42px;
          margin: 6px 0;
          border-radius: 10px;
          padding-left: 12px !important;
          padding-right: 12px !important;
          transition: all 120ms ease;
        }

        .dhx-sider-menu .ant-menu-item .ant-menu-title-content {
          font-weight: 600;
          font-size: 13px;
        }

        .dhx-sider-menu .ant-menu-item:hover {
        }

        .dhx-sider-menu .ant-menu-item-selected {
        }

        .dhx-sider-menu .ant-menu-item-selected::after {
          display: none;
        }

        .dhx-sider-menu .ant-menu-item-icon {
        }

        .dhx-sider-menu .ant-menu-item-selected .ant-menu-item-icon {
        }
      `}</style>
    </Sider>
  );
};

export default AppSider;
