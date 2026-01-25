import React from "react";
import { Area } from "@ant-design/plots";
import { Card, Empty } from "antd";
import { FormattedMessage } from "react-intl";

type WeeklyLeadsAreaChartProps = {
  labels?: string[];
  counts?: number[];
  countsByType?: {
    INSTAGRAM?: number[];
    LINKEDIN?: number[];
    MANUAL?: number[];
  };
  isLoading?: boolean;
};

const MAX_CHART_HEIGHT = 360;

const WeeklyLeadsAreaChart: React.FC<WeeklyLeadsAreaChartProps> = ({
  labels,
  counts,
  countsByType,
  isLoading = false,
}) => {
  // Early return if no labels or loading
  if (!labels || labels.length === 0 || isLoading) {
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
        <Empty
          description="No data found"
          style={{ height: MAX_CHART_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      </Card>
    );
  }

  const hasTypeData =
    (countsByType?.INSTAGRAM?.length ?? 0) > 0 ||
    (countsByType?.LINKEDIN?.length ?? 0) > 0 ||
    (countsByType?.MANUAL?.length ?? 0) > 0;

  // ✅ Keep type keys consistent with backend: INSTAGRAM / LINKEDIN / MANUAL
  const data = hasTypeData
    ? [
        ...(countsByType?.INSTAGRAM || [])?.map((value, i) => ({
          date: labels[i],
          leads: value ?? 0,
          type: "INSTAGRAM",
        })),
        ...(countsByType?.LINKEDIN || [])?.map((value, i) => ({
          date: labels[i],
          leads: value ?? 0,
          type: "LINKEDIN",
        })),
        ...(countsByType?.MANUAL || [])?.map((value, i) => ({
          date: labels[i],
          leads: value ?? 0,
          type: "MANUAL",
        })),
      ]
    : labels.map((date, index) => ({
        date,
        leads: counts?.[index] ?? 0,
        type: "TOTAL",
      }));

  // Check if there's any meaningful data (non-zero values)
  const hasNoData = data.every(item => item.leads === 0) || data.length === 0;

const config: any = {
  data,
  xField: "date",
  yField: "leads",
  seriesField: "type",
  smooth: true,
  autoFit: true,
  height: MAX_CHART_HEIGHT,

  // ✅ Keep area style simple (supported everywhere)
  areaStyle: { fillOpacity: 0.25 },

  // ✅ line + points can also be color-driven automatically by series color
  line: { size: 2 },

  legend: { position: "top" },

  tooltip: { shared: true, showMarkers: true },
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
      {hasNoData ? (
        <Empty
          description="No data found"
          style={{ height: MAX_CHART_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      ) : (
        <Area colorField="type" {...config} />
      )}
    </Card>
  );
};

export default WeeklyLeadsAreaChart;
