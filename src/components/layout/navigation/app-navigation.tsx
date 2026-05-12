"use client";

import React, { useMemo } from "react";
import {
  BanknotesIcon,
  BellIcon,
  BugAntIcon,
  ChartBarSquareIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  DocumentTextIcon,
  FolderIcon,
  MegaphoneIcon,
  QueueListIcon,
  RectangleStackIcon,
  UserGroupIcon,
  UsersIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";
import { useIntl } from "react-intl";
import { usePathname, useRouter } from "next/navigation";
import { useUserInfo } from "@/helpers/use-user";

export type NavMode = "sidebar" | "deck";
export type MenuKey =
  | "dashboard"
  | "analysis"
  | "scrape_jobs"
  | "campaigns"
  | "leads"
  | "folders"
  | "billing"
  | "settings"
  | "notifications"
  | "email_templates"
  | "admin_dashboard"
  | "admin_users"
  | "admin_bugs"
  | "admin_feedbacks"
  | "admin_notifications"
  | "admin_reports"
  | "admin_account_pool"
  | "admin_billing_management";

export type AppNavLeaf = {
  type: "item";
  key: MenuKey;
  label: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

export type AppNavSubmenu = {
  type: "submenu";
  key: string;
  label: string;
  icon: React.ReactNode;
  children: AppNavLeaf[];
};

export type AppNavNode = AppNavLeaf | AppNavSubmenu;

export type AppNavGroup = {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: AppNavNode[];
};

const iconClassName = "h-5 w-5";

const createIcon = (Icon: React.ElementType) => (
  <Icon className={iconClassName} aria-hidden="true" />
);

const flattenItems = (groups: AppNavGroup[]) =>
  groups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.type === "submenu" ? item.children : [item],
    ),
  );

export function useAppNavigation() {
  const intl = useIntl();
  const router = useRouter();
  const pathname = usePathname();
  const { id: userId, role, is_admin } = useUserInfo() as any;

  const isAdmin = Boolean(is_admin) || role === "ADMIN" || role === "admin";
  const uid = userId ? String(userId) : "";

  const groups = useMemo<AppNavGroup[]>(() => {
    const routes: Record<MenuKey, string> = {
      dashboard: uid ? `/dashboard/u/${uid}` : "/dashboard",
      analysis: "/analysis",
      scrape_jobs: "/analysis/scrape-jobs",
      campaigns: "/campaigns",
      leads: "/leads",
      folders: "/folders",
      notifications: "/notifications",
      billing: "/billings",
      settings: "/settings",
      email_templates: "/email-templates",
      admin_dashboard: uid ? `/dashboard/a/${uid}` : "/dashboard/a",
      admin_users: "/users",
      admin_bugs: "/bugs",
      admin_feedbacks: "/feedback",
      admin_notifications: "/notifications",
      admin_reports: "/reports",
      admin_account_pool: "/admin/account-pool",
      admin_billing_management: "/admin/billing-management",
    };

    if (isAdmin) {
      return [
        {
          key: "admin-command",
          label: intl.formatMessage({
            id: "sidebar.group.command",
            defaultMessage: "Command",
          }),
          icon: createIcon(ChartBarSquareIcon),
          items: [
            {
              type: "item",
              key: "admin_dashboard",
              href: routes.admin_dashboard,
              disabled: !uid,
              icon: createIcon(ChartBarSquareIcon),
              label: intl.formatMessage({
                id: "sidebar.admin.dashboard",
                defaultMessage: "Dashboard",
              }),
            },
            {
              type: "item",
              key: "admin_users",
              href: routes.admin_users,
              icon: createIcon(UsersIcon),
              label: intl.formatMessage({
                id: "sidebar.admin.users",
                defaultMessage: "Users",
              }),
            },
          ],
        },
        {
          key: "admin-operations",
          label: intl.formatMessage({
            id: "sidebar.group.operations",
            defaultMessage: "Operations",
          }),
          icon: createIcon(DocumentTextIcon),
          items: [
            {
              type: "submenu",
              key: "admin-quality",
              icon: createIcon(BugAntIcon),
              label: intl.formatMessage({
                id: "sidebar.admin.quality",
                defaultMessage: "Quality",
              }),
              children: [
                {
                  type: "item",
                  key: "admin_bugs",
                  href: routes.admin_bugs,
                  icon: createIcon(BugAntIcon),
                  label: intl.formatMessage({
                    id: "sidebar.admin.bugs",
                    defaultMessage: "Bugs",
                  }),
                },
                {
                  type: "item",
                  key: "admin_feedbacks",
                  href: routes.admin_feedbacks,
                  icon: createIcon(DocumentTextIcon),
                  label: intl.formatMessage({
                    id: "sidebar.admin.feedbacks",
                    defaultMessage: "Feedbacks",
                  }),
                },
              ],
            },
            {
              type: "item",
              key: "admin_notifications",
              href: routes.admin_notifications,
              icon: createIcon(BellIcon),
              label: intl.formatMessage({
                id: "sidebar.admin.notifications",
                defaultMessage: "Notifications",
              }),
            },
            {
              type: "item",
              key: "admin_reports",
              href: routes.admin_reports,
              disabled: true,
              icon: createIcon(DocumentTextIcon),
              label: intl.formatMessage({
                id: "sidebar.admin.reports",
                defaultMessage: "Reports",
              }),
            },
            {
              type: "item",
              key: "admin_account_pool",
              href: routes.admin_account_pool,
              icon: createIcon(CircleStackIcon),
              label: intl.formatMessage({
                id: "sidebar.admin.account_pool",
                defaultMessage: "Account Pooling",
              }),
            },
            {
              type: "item",
              key: "admin_billing_management",
              href: routes.admin_billing_management,
              icon: createIcon(BanknotesIcon),
              label: intl.formatMessage({
                id: "sidebar.admin.billing_management",
                defaultMessage: "Billing Management",
              }),
            },
          ],
        },
      ];
    }

    return [
      {
        key: "workspace",
        label: intl.formatMessage({
          id: "sidebar.group.workspace",
          defaultMessage: "Workspace",
        }),
        icon: createIcon(ChartBarSquareIcon),
        items: [
          {
            type: "item",
            key: "dashboard",
            href: routes.dashboard,
            disabled: !uid,
            icon: createIcon(ChartBarSquareIcon),
            label: intl.formatMessage({ id: "sidebar.dashboard" }),
          },
          {
            type: "item",
            key: "analysis",
            href: routes.analysis,
            icon: createIcon(ChartPieIcon),
            label: intl.formatMessage({
              id: "sidebar.analysis",
              defaultMessage: "Analysis",
            }),
          },
          {
            type: "item",
            key: "scrape_jobs",
            href: routes.scrape_jobs,
            icon: createIcon(QueueListIcon),
            label: intl.formatMessage({
              id: "sidebar.scrape_jobs",
              defaultMessage: "Scrape Jobs",
            }),
          },
        ],
      },
      {
        key: "pipeline",
        label: intl.formatMessage({
          id: "sidebar.group.pipeline",
          defaultMessage: "Pipeline",
        }),
        icon: createIcon(MegaphoneIcon),
        items: [
          {
            type: "submenu",
            key: "growth",
            icon: createIcon(MegaphoneIcon),
            label: intl.formatMessage({
              id: "sidebar.growth",
              defaultMessage: "Growth",
            }),
            children: [
              {
                type: "item",
                key: "campaigns",
                href: routes.campaigns,
                icon: createIcon(MegaphoneIcon),
                label: intl.formatMessage({ id: "sidebar.campaigns" }),
              },
              {
                type: "item",
                key: "email_templates",
                href: routes.email_templates,
                icon: createIcon(RectangleStackIcon),
                label: intl.formatMessage({
                  id: "sidebar.email_templates",
                  defaultMessage: "Email Templates",
                }),
              },
            ],
          },
          {
            type: "submenu",
            key: "records",
            icon: createIcon(UserGroupIcon),
            label: intl.formatMessage({
              id: "sidebar.records",
              defaultMessage: "Records",
            }),
            children: [
              {
                type: "item",
                key: "leads",
                href: routes.leads,
                icon: createIcon(UserGroupIcon),
                label: intl.formatMessage({ id: "sidebar.leads" }),
              },
              {
                type: "item",
                key: "folders",
                href: routes.folders,
                icon: createIcon(FolderIcon),
                label: intl.formatMessage({
                  id: "sidebar.folders",
                  defaultMessage: "Folders",
                }),
              },
            ],
          },
        ],
      },
      {
        key: "system",
        label: intl.formatMessage({
          id: "sidebar.group.system",
          defaultMessage: "System",
        }),
        icon: createIcon(Cog6ToothIcon),
        items: [
          {
            type: "item",
            key: "notifications",
            href: routes.notifications,
            icon: createIcon(BellIcon),
            label: intl.formatMessage({ id: "sidebar.notifications" }),
          },
          {
            type: "item",
            key: "billing",
            href: routes.billing,
            icon: createIcon(CreditCardIcon),
            label: intl.formatMessage({ id: "sidebar.billing" }),
          },
          {
            type: "item",
            key: "settings",
            href: routes.settings,
            icon: createIcon(Cog6ToothIcon),
            label: intl.formatMessage({ id: "sidebar.settings" }),
          },
        ],
      },
    ];
  }, [intl, isAdmin, uid]);

  const leafItems = useMemo(() => flattenItems(groups), [groups]);

  const selectedItem = useMemo(() => {
    if (!pathname) return leafItems[0];

    const dashboardKey = isAdmin ? "admin_dashboard" : "dashboard";
    if (isAdmin && pathname.startsWith("/dashboard/a")) {
      return leafItems.find((item) => item.key === dashboardKey);
    }

    if (!isAdmin && (pathname === "/dashboard" || pathname.startsWith("/dashboard/u"))) {
      return leafItems.find((item) => item.key === dashboardKey);
    }

    return (
      [...leafItems]
        .sort((a, b) => b.href.length - a.href.length)
        .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ??
      leafItems.find((item) => item.key === dashboardKey) ??
      leafItems[0]
    );
  }, [isAdmin, leafItems, pathname]);

  const selectedKeys = selectedItem ? [selectedItem.key] : [];

  const activeParentKeys = useMemo(() => {
    if (!selectedItem) return [];

    return groups.flatMap((group) =>
      group.items.flatMap((item) => {
        if (item.type === "item") return item.key === selectedItem.key ? [group.key] : [];
        return item.children.some((child) => child.key === selectedItem.key)
          ? [group.key, item.key]
          : [];
      }),
    );
  }, [groups, selectedItem]);

  const navigate = (key: string) => {
    const item = leafItems.find((navItem) => navItem.key === key);
    if (!item || item.disabled) return;
    router.push(item.href);
  };

  return {
    activeParentKeys,
    groups,
    isAdmin,
    navigate,
    pathname,
    selectedItem,
    selectedKeys,
  };
}
