"use client";

import { Content } from "antd/es/layout/layout";
import React from "react";
import type { NavMode } from "@/components/layout/navigation/app-navigation";

const AppContent = ({
  children,
  navMode,
}: {
  children: React.ReactNode;
  navMode: NavMode;
}) => {
  return (
    <Content className="app-content" data-nav-mode={navMode}>
      <div className="app-content__inner">{children}</div>
    </Content>
  );
};

export default AppContent;
