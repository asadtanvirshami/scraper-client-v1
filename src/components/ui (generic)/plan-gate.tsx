"use client";

import React from "react";
import { Button, Result } from "antd";
import { LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useSubscriptionState } from "@/features/billings/hooks";
import type { Subscription } from "@/types/api/billing";

type FeatureKey = "campaigns" | "smtp" | "scraping" | "active_subscription";

interface PlanGateProps {
  /** The feature to gate */
  feature: FeatureKey;
  /** Custom fallback UI. If not provided, a default locked screen is shown */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Checks whether the user's active subscription grants access to `feature`.
 * If not, renders the fallback or a default locked UI.
 */
const PlanGate: React.FC<PlanGateProps> = ({ feature, fallback, children }) => {
  const { subscription } = useSubscriptionState();

  const isGranted = checkFeatureAccess(feature, subscription);

  if (isGranted) return <>{children}</>;

  return (
    <>
      {fallback ?? (
        <Result
          icon={<LockOutlined style={{ color: "#e11d48" }} />}
          title="Feature Locked"
          subTitle={getLockedMessage(feature, subscription)}
          extra={
            <Link href="/billings">
              <Button type="primary" style={{ background: "#e11d48", borderColor: "#e11d48" }}>
                View Plans
              </Button>
            </Link>
          }
        />
      )}
    </>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function checkFeatureAccess(feature: FeatureKey, sub: Subscription | null): boolean {
  if (!sub) return false;

  const granted = sub.is_access_granted;
  if (!granted) return false;

  const plan = sub.plan_id;
  if (!plan) return false;

  switch (feature) {
    case "active_subscription":
      return true;
    case "scraping":
      return sub.credits_total - sub.credits_used > 0;
    case "campaigns":
      // Unlimited: -1; otherwise > 0 means plan allows at least one
      return plan.max_campaigns !== 0;
    case "smtp":
      return plan.max_smtp_domains !== 0;
    default:
      return true;
  }
}

function getLockedMessage(feature: FeatureKey, sub: Subscription | null): string {
  if (!sub) return "You need an active subscription to access this feature.";

  if (!sub.is_access_granted) {
    if (sub.status === "trialing") return "Your free trial has expired. Upgrade to continue.";
    if (sub.status === "canceled") return "Your subscription has been cancelled. Re-subscribe to regain access.";
    return "Your subscription is inactive. Please renew to access this feature.";
  }

  switch (feature) {
    case "scraping":
      return "You have used all your scraping credits for this billing cycle. Upgrade your plan for more credits.";
    case "campaigns":
      return "Your current plan does not include campaign creation. Upgrade to unlock.";
    case "smtp":
      return "Your current plan does not include SMTP domains. Upgrade to unlock.";
    default:
      return "Upgrade your plan to access this feature.";
  }
}

export default PlanGate;
