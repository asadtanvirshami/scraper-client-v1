"use client";

import React, { useEffect, useState } from "react";
import { Button, Result, Spin, Typography } from "antd";
import { CheckCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { fetchSubscription, syncCheckoutSession } from "@/api/api_calls/billing";
import { setSubscription } from "@/redux/slices/subscription/subscription-slice";

const { Text } = Typography;

type State = "activating" | "success" | "timeout";

/** A subscription is considered "live" when it has a Stripe ID and an access-granting status */
const isLive = (sub: any) =>
  sub?.stripe_subscription_id &&
  ["active", "trialing", "past_due"].includes(sub?.status);

export default function PlansSuccessPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const [state, setState] = useState<State>("activating");
  const [planName, setPlanName] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const sessionId = searchParams.get("session_id");

    const succeed = (sub: any) => {
      if (cancelled) return;
      dispatch(setSubscription(sub));
      queryClient.setQueryData(["subscription"], sub);
      setPlanName(sub?.plan_id?.display_name ?? "");
      setState("success");
      setTimeout(() => router.replace("/billings"), 3000);
    };

    const poll = async (attempt = 0) => {
      if (cancelled) return;
      try {
        const res = await fetchSubscription();
        if (res.success && isLive(res.data)) {
          succeed(res.data);
        } else if (attempt < 8) {
          setTimeout(() => poll(attempt + 1), 2000);
        } else {
          if (!cancelled) {
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
            setState("timeout");
          }
        }
      } catch {
        if (attempt < 3) setTimeout(() => poll(attempt + 1), 2000);
        else if (!cancelled) setState("timeout");
      }
    };

    const run = async () => {
      // If the success URL carried a session_id, force-sync first so we don't
      // have to wait for the webhook (critical for local dev without Stripe CLI).
      if (sessionId) {
        try {
          const res = await syncCheckoutSession(sessionId);
          if (res.success && isLive(res.data)) {
            succeed(res.data);
            return;
          }
        } catch {
          // sync failed – fall through to polling
        }
      }
      // Fall back to polling (webhook may already have fired)
      setTimeout(() => poll(), 1000);
    };

    run();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "activating") {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: "#10b981" }} spin />} />
        <div className="text-center">
          <Text strong style={{ fontSize: 20, display: "block" }}>
            Activating your plan…
          </Text>
          <Text type="secondary">
            Please wait while we confirm your payment with Stripe.
          </Text>
        </div>
      </div>
    );
  }

  if (state === "timeout") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Result
          status="warning"
          title="Payment received — syncing your plan"
          subTitle="Stripe confirmed your payment. Your plan will activate shortly. Check your billing page in a moment."
          extra={[
            <Button type="primary" key="billing" onClick={() => router.replace("/billings")}>
              Go to Billing
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Result
        icon={<CheckCircleFilled style={{ color: "#10b981", fontSize: 72 }} />}
        status="success"
        title={planName ? `Welcome to ${planName}! 🎉` : "Plan activated! 🎉"}
        subTitle="Your subscription is now active. Redirecting you to billing…"
        extra={[
          <Button type="primary" key="billing" onClick={() => router.replace("/billings")}>
            Go to Billing
          </Button>,
        ]}
      />
    </div>
  );
}
