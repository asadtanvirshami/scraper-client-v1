"use client";

import React, { useMemo } from "react";
import { Card, Skeleton, theme } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useIntl } from "react-intl";

type Props = {
  isLoading?: boolean;
  labels: string[];
  counts: number[];
};

const UsersCreatedBarChart: React.FC<Props> = ({ isLoading, labels, counts }) => {
  const intl = useIntl();
  const { token } = theme.useToken();

  const data = useMemo(
    () =>
      (labels ?? []).map((label, i) => ({
        label,
        count: counts?.[i] ?? 0,
      })),
    [labels, counts],
  );

  return (
    <Card
      title={intl.formatMessage({
        id: "admin.charts.users_created.title",
        defaultMessage: "Users created",
      })}
      style={{
        borderRadius: 16,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowSecondary,
      }}
    >
      {isLoading ? (
        <Skeleton active />
      ) : (
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={token.colorPrimary} />
                  <stop offset="100%" stopColor={token.colorPrimaryHover} />
                </linearGradient>
              </defs>

              <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />

              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />

              <Bar
                dataKey="count"
                fill="url(#usersGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default UsersCreatedBarChart;
