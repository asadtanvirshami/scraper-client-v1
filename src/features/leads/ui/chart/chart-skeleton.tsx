"use client";

import React from "react";
import { Card, Skeleton } from "antd";

type ChartSkeletonProps = {
  title?: React.ReactNode;
};

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ title }) => {
  return (
    <Card
      title={title}
      style={{
        borderRadius: 12,
        border: "1px solid rgba(15, 23, 42, 0.10)",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
      }}
      bodyStyle={{ padding: 16 }}
    >
      <Skeleton active paragraph={{ rows: 10 }} />
    </Card>
  );
};

export default ChartSkeleton;
