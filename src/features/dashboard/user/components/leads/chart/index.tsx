import React from "react";
import { Area } from "@ant-design/plots";
import { Card } from "antd";
import { FormattedMessage } from "react-intl";

type WeeklyLeadsAreaChartProps = {
  labels: string[];
  counts: number[];
  isLoading?: boolean;
};

const WeeklyLeadsAreaChart: React.FC<WeeklyLeadsAreaChartProps> = ({
  labels,
  counts,
  isLoading = false,
}) => {
  const data = labels.map((date, index) => ({
    date,
    leads: counts[index] ?? 0,
  }));

  const config = {
    data,
    xField: "date",
    yField: "leads",
    smooth: true,
    autoFit: true,
    animation: true,
    padding: [24, 24, 32, 40],
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    yAxis: {
      min: 0,
      nice: true,
    },
    areaStyle: {
      fill: "l(270) 0:#e6f4ff 0.5:#69b1ff 1:#1677ff",
    },
    line: {
      color: "#1677ff",
      size: 2,
    },
    point: {
      size: 3,
      shape: "circle",
      style: {
        fill: "#1677ff",
        stroke: "#fff",
        lineWidth: 1,
      },
    },
    tooltip: {
      showMarkers: true,
    },
  };

  return (
    <Card
      title={
        <FormattedMessage
          id="dashboard.charts.weekly_leads"
          defaultMessage="Leads added (last 7 days)"
        />
      }
      loading={isLoading}
    >
      <Area {...config} />
    </Card>
  );
};

export default WeeklyLeadsAreaChart;
