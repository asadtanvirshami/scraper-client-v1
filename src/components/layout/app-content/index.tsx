"use client";

import { Content } from "antd/es/layout/layout";
import React from "react";

const AppContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <Content  style={{ margin: "24px 16px 0" }}>
      <div className="min-h-screen max-h-full">{children}</div>
    </Content>
  );
};

export default AppContent;
