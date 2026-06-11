"use client";

import React from "react";
import { Divider, Progress, Tag, Tooltip } from "antd";
import { ThunderboltFilled } from "@ant-design/icons";
import Link from "next/link";
import { useSubscriptionState } from "@/features/billings/hooks";

const PLAN_COLORS: Record<string, string> = {
  free_trial: "#6366f1",
  basic: "#0ea5e9",
  standard: "#10b981",
  premium: "#f59e0b",
};

const CreditsBadge: React.FC = () => {
  const { subscription } = useSubscriptionState();

  if (!subscription) return null;

  const { credits_used = 0, credits_total = 0, plan_id } = subscription;
  const remaining = Math.max(0, credits_total - credits_used);
  const pct = credits_total > 0 ? Math.min(100, (credits_used / credits_total) * 100) : 0;
  const strokeColor = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";
  const planName = plan_id?.name ?? "free_trial";
  const planColor = PLAN_COLORS[planName] ?? "#6366f1";
  const planLabel = plan_id?.display_name ?? "Free Trial";

  return (
    <Tooltip
      title={
        <span>
          Plan: <strong>{planLabel}</strong>
          <br />
          {remaining.toLocaleString()} credits remaining
          <br />
          {credits_used.toLocaleString()} / {credits_total.toLocaleString()} used
        </span>
      }
    >
      <Link href="/billings" className="flex items-center gap-2 cursor-pointer no-underline">
        {/* Plan badge */}
        <Tag
          style={{
            background: planColor,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 7px",
            lineHeight: "18px",
            margin: 0,
          }}
        >
          {planLabel}
        </Tag>

        <Divider type="vertical" style={{ margin: 0, height: 16 }} />

        {/* Credits */}
        <div className="flex items-center gap-1">
          <ThunderboltFilled style={{ color: strokeColor, fontSize: 13 }} />
          <Progress
            type="circle"
            percent={Math.round(pct)}
            size={26}
            strokeColor={strokeColor}
            trailColor="#e5e7eb"
            showInfo={false}
          />
          <span
            className="text-xs font-medium"
            style={{ color: strokeColor, minWidth: 22, lineHeight: 1 }}
          >
            {remaining > 999 ? `${(remaining / 1000).toFixed(1)}k` : remaining}
          </span>
        </div>
      </Link>
    </Tooltip>
  );
};

export default CreditsBadge;
