"use client";

import React from "react";
import { Space, theme } from "antd";

type TableHeaderTitleProps = {
  icon: React.ReactNode;
  title: React.ReactNode;
};

const TableHeaderTitle: React.FC<TableHeaderTitleProps> = ({ icon, title }) => {
  const { token } = theme.useToken();

  return (
    <Space style={{ alignItems: "center" }}>
      <span style={{ fontSize: 16, lineHeight: 1, color: token.colorPrimary }}>
        {icon}
      </span>
      <span>{title}</span>
    </Space>
  );
};

export default TableHeaderTitle;
