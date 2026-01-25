"use client";

import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  ChartBarSquareIcon,
  MegaphoneIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { useIntl } from "react-intl";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useUserInfo } from "@/helpers/use-user";

const { Sider } = Layout;

type MenuKey = "dashboard" | "campaigns" | "leads" | "billing" | "settings";

const AppSider = () => {
  const intl = useIntl();
  const router = useRouter();
  const pathname = usePathname();

  const { id: userId, role, is_admin } = useUserInfo() as any;

  // ✅ Decide admin/user (adjust to your real user shape)
  const isAdmin = Boolean(is_admin) || role === "ADMIN" || role === "admin";

  // ✅ Base prefix for role routes
  const dashboardPrefix = isAdmin ? "a" : "u";

  // ✅ safety: avoid pushing invalid URLs before userId exists
  const uid = userId ? String(userId) : "";

  // ✅ map menu keys to routes
  const routes: Record<MenuKey, string> = {
    dashboard: uid ? `/dashboard/${dashboardPrefix}/${uid}` : "/dashboard",
    campaigns: "/campaigns",
    leads: "/leads",
    billing: "/billing",
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

    // treat any /dashboard/* as dashboard
    if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
      return ["dashboard"];
    }

    // normal matching
    const matched = (Object.keys(routes) as MenuKey[])
      .filter((k) => k !== "dashboard") // dashboard already handled above
      .map((k) => ({ key: k, path: routes[k] }))
      .sort((a, b) => b.path.length - a.path.length)
      .find((r) => pathname === r.path || pathname.startsWith(r.path + "/"));

    return [matched?.key ?? "dashboard"];
  }, [pathname, routes]);

  const onClick: MenuProps["onClick"] = ({ key }) => {
    const k = key as MenuKey;
    const href = routes[k];

    if (!href) return;

    // ✅ avoid navigating to /dashboard/u/ (missing id)
    if (k === "dashboard" && !uid) return;

    router.push(href);
  };

  return (
    <Sider breakpoint="lg" collapsedWidth="0">
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold">
          {intl.formatMessage({ id: "sidebar.brand" })}
        </h1>
      </div>

      <Menu
        mode="inline"
        className="!border-r-0"
        items={items}
        selectedKeys={selectedKeys}
        onClick={onClick}
      />
    </Sider>
  );
};

export default AppSider;