"use client";

import React, { useMemo, useState } from "react";
import { Popover, Tooltip } from "antd";
import {
  AppNavGroup,
  AppNavLeaf,
  AppNavNode,
  useAppNavigation,
} from "@/components/layout/navigation/app-navigation";

const collectLeaves = (items: AppNavNode[]): AppNavLeaf[] =>
  items.flatMap((item) => (item.type === "submenu" ? item.children : [item]));

const AppBottomDeck = () => {
  const { activeParentKeys, groups, navigate, selectedKeys } = useAppNavigation();
  const [openKey, setOpenKey] = useState<string | null>(null);

  const activeKey = selectedKeys[0];
  const deckGroups = useMemo(
    () =>
      groups.map((group) => ({
        ...group,
        leaves: collectLeaves(group.items),
      })),
    [groups],
  );

  const renderLeafButton = (item: AppNavLeaf) => (
    <button
      key={item.key}
      type="button"
      className="app-bottom-deck__popover-item"
      disabled={item.disabled}
      data-active={activeKey === item.key}
      onClick={() => {
        navigate(item.key);
        setOpenKey(null);
      }}
    >
      <span className="app-bottom-deck__popover-icon">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );

  const renderPopover = (group: AppNavGroup & { leaves: AppNavLeaf[] }) => (
    <div className="app-bottom-deck__popover" onClick={(event) => event.stopPropagation()}>
      <div className="app-bottom-deck__popover-label">{group.label}</div>
      {group.items.map((item) => {
        if (item.type === "item") return renderLeafButton(item);

        return (
          <div className="app-bottom-deck__submenu" key={item.key}>
            <div className="app-bottom-deck__submenu-label">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.children.map(renderLeafButton)}
          </div>
        );
      })}
    </div>
  );

  return (
    <nav className="app-bottom-deck" aria-label="Primary navigation">
      {deckGroups.map((group) => {
        const isActive =
          activeParentKeys.includes(group.key) ||
          group.leaves.some((item) => item.key === activeKey);

        return (
          <Popover
            key={group.key}
            trigger="click"
            placement="top"
            open={openKey === group.key}
            onOpenChange={(open) => setOpenKey(open ? group.key : null)}
            content={renderPopover(group)}
            overlayClassName="app-bottom-deck__overlay"
            arrow={false}
          >
            <Tooltip title={group.label} placement="top">
              <button
                type="button"
                className="app-bottom-deck__button"
                data-active={isActive}
                data-open={openKey === group.key}
                aria-label={group.label}
              >
                {group.icon}
              </button>
            </Tooltip>
          </Popover>
        );
      })}
    </nav>
  );
};

export default AppBottomDeck;
