"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { useIntl } from "react-intl";
import {
  AppNavGroup,
  AppNavNode,
  useAppNavigation,
} from "@/components/layout/navigation/app-navigation";

const { Sider } = Layout;

const toMenuNode = (node: AppNavNode): Required<MenuProps>["items"][number] => {
  if (node.type === "submenu") {
    return {
      key: node.key,
      icon: node.icon,
      label: node.label,
      children: node.children.map((child) => ({
        key: child.key,
        icon: child.icon,
        label: child.label,
        disabled: child.disabled,
      })),
    };
  }

  return {
    key: node.key,
    icon: node.icon,
    label: node.label,
    disabled: node.disabled,
  };
};

const toMenuItems = (groups: AppNavGroup[]): MenuProps["items"] =>
  groups.map((group) => ({
    key: group.key,
    type: "group",
    label: group.label,
    children: group.items.map(toMenuNode),
  }));

const AppSider: React.FC = () => {
  const intl = useIntl();
  const { activeParentKeys, groups, isAdmin, navigate, selectedKeys } =
    useAppNavigation();
  const [openKeys, setOpenKeys] = useState<string[]>(activeParentKeys);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    setOpenKeys((prev) => Array.from(new Set([...prev, ...activeParentKeys])));
  }, [activeParentKeys]);

  const items = useMemo(() => toMenuItems(groups), [groups]);
  const expand = useCallback(() => setCollapsed(false), []);
  const collapse = useCallback(() => setCollapsed(true), []);

  return (
    <Sider
      width={252}
      collapsedWidth={64}
      className="app-sidebar"
      trigger={null}
      onMouseEnter={expand}
      onMouseLeave={collapse}
    >
      <div className="app-sidebar__brand">
        <div className={`app-sidebar__brand-text${collapsed ? " app-sidebar__brand-text--hidden" : ""}`}>
          <div className="app-sidebar__name">
            {intl.formatMessage({ id: "sidebar.brand", defaultMessage: "DataHarvX" })}
          </div>
          <div className="app-sidebar__role">
            {isAdmin
              ? intl.formatMessage({ id: "sidebar.role.admin", defaultMessage: "Admin" })
              : intl.formatMessage({ id: "sidebar.role.user", defaultMessage: "Workspace" })}
          </div>
        </div>
      </div>

      <div className="app-sidebar__nav">
        <Menu
          mode="inline"
          inlineCollapsed={collapsed}
          items={items}
          selectedKeys={selectedKeys}
          openKeys={collapsed ? [] : openKeys}
          onOpenChange={setOpenKeys}
          onClick={({ key }) => navigate(key)}
          className="app-sidebar-menu"
        />
      </div>
    </Sider>
  );
};

export default AppSider;
