"use client";

import React, { useState, useCallback } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Input,
  Modal,
  Progress,
  Row,
  Segmented,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
  theme,
} from "antd";
import {
  CheckCircleFilled,
  CrownFilled,
  ExclamationCircleOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  ThunderboltFilled,
  CreditCardOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
  BulbOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useIntl } from "react-intl";
import {
  usePlans,
  useSubscription,
  useCreateCheckout,
  useCreatePortal,
  useCancelSubscription,
  useChangePlan,
  useStartFreeTrial,
} from "./hooks";
import { setSubscription } from "@/redux/slices/subscription/subscription-slice";
import type { BillingInterval, Plan, Subscription } from "@/types/api/billing";
import { useUserInfo } from "@/helpers/use-user";

const { Title, Text, Paragraph } = Typography;

// ─── Constants ─────────────────────────────────────────────────────────────────

const PLAN_ORDER: Record<string, number> = { free_trial: 0, basic: 1, standard: 2, premium: 3 };

const PLAN_GRADIENT: Record<string, string> = {
  free_trial:  "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
  basic:     "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
  standard:  "linear-gradient(135deg, #059669 0%, #34d399 100%)",
  premium:   "linear-gradient(135deg, #d97706 0%, #fbbf24 100%)",
};

const PLAN_COLOR: Record<string, string> = {
  free_trial:  "#7c3aed",
  basic:     "#0284c7",
  standard:  "#059669",
  premium:   "#d97706",
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free_trial:  <GiftOutlined />,
  basic:     <ThunderboltFilled />,
  standard:  <RocketOutlined />,
  premium:   <CrownFilled />,
};

const PLAN_BADGE: Record<string, string | null> = {
  free_trial:  "14 DAYS FREE",
  basic:     null,
  standard:  "MOST POPULAR",
  premium:   "MORE VALUE",
};

/** Format EUR cents to display string: €97 */
const formatEUR = (cents: number | undefined | null) => {
  if (!cents || isNaN(cents) || cents === 0) return "€0";
  return `€${(cents / 100).toFixed(0)}`;
};

const STATUS_TAG_COLOR: Record<string, string> = {
  trialing:           "purple",
  active:             "success",
  past_due:           "warning",
  canceled:           "error",
  paused:             "default",
  incomplete:         "warning",
  incomplete_expired: "error",
  unpaid:             "error",
};

const STATUS_LABEL: Record<string, string> = {
  trialing:           "Free Trial",
  active:             "Active",
  past_due:           "Past Due",
  canceled:           "Canceled",
  paused:             "Paused",
  incomplete:         "Incomplete",
  incomplete_expired: "Expired",
  unpaid:             "Unpaid",
};

const getPlanDisplayName = (
  formatMessage: ReturnType<typeof useIntl>["formatMessage"],
  planName: Plan["name"] | undefined,
  fallback: string | undefined,
) => {
  if (!planName) return fallback ?? "—";

  return formatMessage(
    {
      id: `billing.plans.${planName}.name`,
      defaultMessage: fallback ?? planName,
    },
  );
};

const getPlanBadge = (
  formatMessage: ReturnType<typeof useIntl>["formatMessage"],
  planName: Plan["name"],
) => {
  if (planName === "free_trial" || planName === "standard" || planName === "premium") {
    return formatMessage({
      id: `billing.plans.${planName}.badge`,
      defaultMessage: PLAN_BADGE[planName] ?? "",
    });
  }

  return null;
};

const getPlanFeatures = (
  formatMessage: ReturnType<typeof useIntl>["formatMessage"],
  planName: Plan["name"],
) => {
  const featureKeys = ["credits", "smtp", "campaigns", "support"] as const;

  return featureKeys.map((featureKey) =>
    formatMessage({
      id: `billing.plans.${planName}.features.${featureKey}`,
      defaultMessage: "",
    })
  );
};

const getSubscriptionStatusLabel = (
  formatMessage: ReturnType<typeof useIntl>["formatMessage"],
  status: string,
) =>
  formatMessage({
    id: `billing.status.${status}`,
    defaultMessage: STATUS_LABEL[status] ?? status,
  });

// ─── Credits Bar ───────────────────────────────────────────────────────────────

const CreditsBar: React.FC<{ subscription: Subscription }> = ({ subscription }) => {
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();
  const { credits_used = 0, credits_total = 0 } = subscription;
  const remaining = Math.max(0, credits_total - credits_used);
  const pct = credits_total > 0 ? Math.min(100, (credits_used / credits_total) * 100) : 0;
  const strokeColor = pct >= 90 ? token.colorError : pct >= 70 ? token.colorWarning : token.colorSuccess;
  const isUnlimited = credits_total >= 9_999_999;

  return (
    <div style={{ padding: "14px 16px", borderRadius: 10, background: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Space size={6}>
          <DatabaseOutlined style={{ color: token.colorPrimary }} />
          <Text strong style={{ fontSize: 13 }}>
            {formatMessage({
              id: "billing.scraping_credits",
              defaultMessage: "Scraping Credits",
            })}
          </Text>
        </Space>
        <Tooltip
          title={formatMessage({
            id: "billing.credit_tooltip",
            defaultMessage: "1 credit = 1 lead scraped",
          })}
        >
          <InfoCircleOutlined style={{ color: token.colorTextTertiary, cursor: "pointer" }} />
        </Tooltip>
      </div>
      {isUnlimited ? (
        <Text style={{ color: token.colorSuccess, fontWeight: 600 }}>
          {formatMessage({
            id: "billing.unlimited_credits",
            defaultMessage: "∞ Unlimited credits",
          })}
        </Text>
      ) : (
        <>
          <Progress percent={Math.round(pct)} strokeColor={strokeColor} trailColor={token.colorFillSecondary} showInfo={false} style={{ marginBottom: 6 }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
              {formatMessage(
                {
                  id: "billing.used_of_total",
                  defaultMessage: "{used} used of {total}",
                },
                {
                  used: credits_used.toLocaleString(),
                  total: credits_total.toLocaleString(),
                },
              )}
            </Text>
            <Space size={6}>
              {pct >= 90 && (
                <Tag color="error" style={{ fontSize: 11, margin: 0 }}>
                  {formatMessage({
                    id: "billing.running_low",
                    defaultMessage: "Running low",
                  })}
                </Tag>
              )}
              <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                {formatMessage(
                  {
                    id: "billing.left",
                    defaultMessage: "{count} left",
                  },
                  { count: remaining.toLocaleString() },
                )}
              </Text>
            </Space>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Subscription Panel ────────────────────────────────────────────────────────

const SubscriptionPanel: React.FC<{
  subscription: Subscription | undefined;
  currentPlan: Plan | undefined;
  isTrial: boolean;
  isCancelPending: boolean;
  hasStripeSubscription: boolean;
  isPortalLoading: boolean;
  onOpenPortal: () => void;
  onCancelSubscription: () => void;
}> = ({ subscription, currentPlan, isTrial, isCancelPending, hasStripeSubscription, isPortalLoading, onOpenPortal, onCancelSubscription }) => {
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();
  const planColor = PLAN_COLOR[currentPlan?.name ?? ""] ?? token.colorPrimary;
  const planGradient = PLAN_GRADIENT[currentPlan?.name ?? ""] ?? `linear-gradient(135deg, ${planColor} 0%, ${planColor}99 100%)`;
  const isUnlimited = (currentPlan?.credits_per_cycle ?? 0) >= 9_999_999;

  return (
    <Card style={{ borderRadius: 16, border: `1px solid ${token.colorBorderSecondary}`, overflow: "hidden", background: token.colorBgContainer }} bodyStyle={{ padding: 0 }}>
      <div style={{ background: planGradient, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -30, right: 20, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, display: "block", marginBottom: 4 }}>
              {formatMessage({
                id: "billing.current_plan",
                defaultMessage: "Current Plan",
              })}
            </Text>
            <Title level={3} style={{ color: "#fff", margin: 0 }}>
              {currentPlan
                ? getPlanDisplayName(formatMessage, currentPlan.name, currentPlan.display_name)
                : formatMessage({
                    id: "billing.no_plan",
                    defaultMessage: "No Plan",
                  })}
            </Title>
          </div>
          <div style={{ textAlign: "right" }}>
            {subscription?.status && (
              <Tag color={subscription.status === "active" || subscription.status === "trialing" ? "success" : "error"} style={{ borderRadius: 20, fontWeight: 600, border: "none" }}>
                {getSubscriptionStatusLabel(formatMessage, subscription.status)}
              </Tag>
            )}
            {currentPlan?.price_cents && currentPlan.price_cents > 0 && (
              <div style={{ color: "#fff", marginTop: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 700 }}>{formatEUR(currentPlan.price_cents)}</span>
                <span style={{ fontSize: 12, opacity: 0.75 }}>/mo</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {subscription ? (
          <Space direction="vertical" style={{ width: "100%" }} size={14}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <CalendarOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
              <Text style={{ color: token.colorTextSecondary, fontSize: 13 }}>
                {format(new Date(subscription.current_period_start), "MMM d")}
                {" → "}
                {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
              </Text>
            </div>

            {isTrial && subscription.trial_end && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <WarningOutlined style={{ color: token.colorWarning, fontSize: 14 }} />
                <Text style={{ color: token.colorWarning, fontSize: 13 }}>
                  {formatMessage(
                    {
                      id: "billing.trial_ends_on",
                      defaultMessage: "Trial ends {date}",
                    },
                    { date: format(new Date(subscription.trial_end), "MMM d, yyyy") },
                  )}
                </Text>
              </div>
            )}

            {isCancelPending && subscription.current_period_end && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <CloseCircleOutlined style={{ color: token.colorError, fontSize: 14 }} />
                <Text style={{ color: token.colorError, fontSize: 13 }}>
                  {formatMessage(
                    {
                      id: "billing.cancels_on",
                      defaultMessage: "Cancels {date}",
                    },
                    { date: format(new Date(subscription.current_period_end), "MMM d, yyyy") },
                  )}
                </Text>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, padding: "14px 0", borderTop: `1px solid ${token.colorBorderSecondary}`, borderBottom: `1px solid ${token.colorBorderSecondary}` }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: 700, color: token.colorText, display: "block" }}>
                  {isUnlimited ? "∞" : (currentPlan?.max_smtp_domains === -1 ? "∞" : currentPlan?.max_smtp_domains ?? "—")}
                </Text>
                <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>
                  {formatMessage({
                    id: "billing.email_accounts",
                    defaultMessage: "Email Accounts",
                  })}
                </Text>
              </div>
              <div style={{ width: 1, background: token.colorBorderSecondary }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: 700, color: token.colorText, display: "block" }}>
                  {currentPlan?.max_campaigns === -1 ? "∞" : currentPlan?.max_campaigns ?? "—"}
                </Text>
                <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>
                  {formatMessage({
                    id: "billing.campaigns",
                    defaultMessage: "Campaigns",
                  })}
                </Text>
              </div>
              <div style={{ width: 1, background: token.colorBorderSecondary }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: 700, color: token.colorText, display: "block" }}>
                  {isUnlimited ? "∞" : currentPlan?.credits_per_cycle != null
                    ? currentPlan.credits_per_cycle >= 1000
                      ? `${(currentPlan.credits_per_cycle / 1000).toFixed(0)}k`
                      : currentPlan.credits_per_cycle
                    : "—"}
                </Text>
                <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>
                  {formatMessage({
                    id: "billing.credits_per_month",
                    defaultMessage: "Credits/mo",
                  })}
                </Text>
              </div>
            </div>

            <CreditsBar subscription={subscription} />

            <Space direction="vertical" style={{ width: "100%" }} size={8}>
              {hasStripeSubscription && (
                <Button block icon={<CreditCardOutlined />} onClick={onOpenPortal} loading={isPortalLoading} style={{ borderRadius: 8 }}>
                  {formatMessage({
                    id: "billing.manage_billing_invoices",
                    defaultMessage: "Manage Billing & Invoices",
                  })}
                </Button>
              )}
              {hasStripeSubscription && !isCancelPending && (
                <Button block danger icon={<CloseCircleOutlined />} onClick={onCancelSubscription} style={{ borderRadius: 8 }}>
                  {formatMessage({
                    id: "billing.cancel_subscription",
                    defaultMessage: "Cancel Subscription",
                  })}
                </Button>
              )}
            </Space>
          </Space>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <BulbOutlined style={{ fontSize: 32, color: token.colorTextQuaternary, marginBottom: 8 }} />
            <div>
              <Text style={{ color: token.colorTextSecondary }}>
                {formatMessage({
                  id: "billing.no_active_subscription",
                  defaultMessage: "No active subscription",
                })}
              </Text>
            </div>
            <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>
              {formatMessage({
                id: "billing.choose_plan",
                defaultMessage: "Choose a Plan",
              })}
            </Text>
          </div>
        )}
      </div>
    </Card>
  );
};

// ─── Plan Card ─────────────────────────────────────────────────────────────────

const PlanCard: React.FC<{
  plan: Plan;
  interval: BillingInterval;
  isCurrentPlan: boolean;
  currentPlanName?: string;
  isTrial: boolean;
  hasStripeSubscription: boolean;
  hasAnySubscription: boolean;
  onUpgrade: (plan: Plan) => void;
  onDowngrade: (plan: Plan) => void;
  onSubscribe: (plan: Plan) => void;
  onCancelSubscription: () => void;
  isSubscribeLoading: boolean;
  isCancelLoading: boolean;
}> = ({ plan, interval, isCurrentPlan, currentPlanName, isTrial, hasStripeSubscription, hasAnySubscription, onUpgrade, onDowngrade, onSubscribe, onCancelSubscription, isSubscribeLoading, isCancelLoading }) => {
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();
  const currentOrder = PLAN_ORDER[currentPlanName ?? ""] ?? -1;
  const planOrder = PLAN_ORDER[plan.name] ?? 0;
  const isHigher = planOrder > currentOrder;
  const isLower = !isCurrentPlan && planOrder < currentOrder;
  const accentColor = PLAN_COLOR[plan.name] ?? token.colorPrimary;
  const gradient = PLAN_GRADIENT[plan.name] ?? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)`;
  const isFreeTrial = plan.name === "free_trial";
  const badge = getPlanBadge(formatMessage, plan.name);
  const translatedPlanName = getPlanDisplayName(formatMessage, plan.name, plan.display_name);
  const translatedFeatures = getPlanFeatures(formatMessage, plan.name);

  // Pricing logic
  const monthlyPrice = plan.price_cents;
  const annualTotal = plan.price_cents_annual;
  const annualMonthly = annualTotal > 0 ? Math.round(annualTotal / 12) : Math.round(monthlyPrice * 12 * 0.9);
  const savings = monthlyPrice * 12 - annualTotal;
  const showAnnual = interval === "year" && !isFreeTrial && annualTotal > 0;
  const displayPrice = showAnnual ? annualMonthly : monthlyPrice;

  const renderAction = () => {
    if (isFreeTrial) {
      if (isTrial && isCurrentPlan) {
        return (
          <Button block disabled style={{ borderRadius: 8 }}>
            {formatMessage({
              id: "billing.active_trial",
              defaultMessage: "Active Trial",
            })}
          </Button>
        );
      }
      if (!hasAnySubscription) {
        return (
          <Button block style={{ borderRadius: 8, borderColor: accentColor, color: accentColor, background: "transparent" }} onClick={() => onSubscribe(plan)}>
            {formatMessage({
              id: "billing.start_free_trial",
              defaultMessage: "Start Free Trial",
            })}
          </Button>
        );
      }
      return null;
    }
    if (isCurrentPlan && hasStripeSubscription && !isTrial) {
      return (
        <Button block danger style={{ borderRadius: 8 }} loading={isCancelLoading} onClick={onCancelSubscription}>
          {formatMessage({
            id: "billing.cancel_subscription",
            defaultMessage: "Cancel Subscription",
          })}
        </Button>
      );
    }
    if (!hasStripeSubscription) {
      return (
        <Button block type="primary" style={{ borderRadius: 8, background: gradient, border: "none", fontWeight: 600 }} loading={isSubscribeLoading} onClick={() => onSubscribe(plan)} icon={<ArrowRightOutlined />}>
          {formatMessage({
            id: "billing.subscribe_now",
            defaultMessage: "Subscribe Now",
          })}
        </Button>
      );
    }
    if (isHigher) {
      return (
        <Button block type="primary" style={{ borderRadius: 8, background: accentColor, borderColor: accentColor, fontWeight: 600 }} loading={isSubscribeLoading} onClick={() => onUpgrade(plan)} icon={<ArrowRightOutlined />}>
          {formatMessage({
            id: "billing.upgrade",
            defaultMessage: "Upgrade",
          })}
        </Button>
      );
    }
    if (isLower) {
      return (
        <Button block loading={isSubscribeLoading} style={{ borderRadius: 8 }} onClick={() => onDowngrade(plan)}>
          {formatMessage({
            id: "billing.downgrade",
            defaultMessage: "Downgrade",
          })}
        </Button>
      );
    }
    return null;
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        border: isCurrentPlan
          ? `2px solid ${accentColor}`
          : plan.name === "premium"
            ? `2px solid ${accentColor}40`
            : `1px solid ${token.colorBorderSecondary}`,
        position: "relative",
        overflow: "hidden",
        height: "100%",
        transition: "box-shadow 0.2s",
        boxShadow: isCurrentPlan
          ? `0 0 0 1px ${accentColor}30, 0 4px 24px ${accentColor}20`
          : plan.name === "premium"
            ? `0 4px 24px ${accentColor}15`
            : "none",
        background: token.colorBgContainer,
      }}
      bodyStyle={{ padding: 0 }}
      hoverable
    >
      <div style={{ height: 4, background: gradient }} />

      {badge && (
        <div style={{ position: "absolute", top: 4, right: 0, background: gradient, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderTopLeftRadius: 6, borderBottomLeftRadius: 6, letterSpacing: "0.05em" }}>
          {badge}
        </div>
      )}

      {isCurrentPlan && (
        <div style={{ position: "absolute", top: 16, left: 16, background: accentColor, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12, letterSpacing: "0.05em" }}>
          {formatMessage({
            id: "billing.your_plan",
            defaultMessage: "YOUR PLAN",
          })}
        </div>
      )}

      <div style={{ padding: "20px 20px 24px", paddingTop: isCurrentPlan ? 34 : 20 }}>
        {/* Plan name + icon */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, flexShrink: 0 }}>
            {PLAN_ICONS[plan.name]}
          </div>
          <div>
            <Text style={{ fontWeight: 700, fontSize: 15, color: token.colorText, display: "block" }}>{translatedPlanName}</Text>
            {isFreeTrial && (
              <Text style={{ fontSize: 11, color: token.colorTextTertiary }}>
                {formatMessage({
                  id: "billing.no_card_required",
                  defaultMessage: "No card required",
                })}
              </Text>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: accentColor, lineHeight: 1 }}>
            {isFreeTrial
              ? formatMessage({
                  id: "billing.free",
                  defaultMessage: "Free",
                })
              : formatEUR(displayPrice)}
          </span>
          {!isFreeTrial && displayPrice > 0 && (
            <span style={{ fontSize: 14, color: token.colorTextSecondary }}> /mo</span>
          )}
        </div>

        {/* Annual savings badge */}
        {showAnnual && savings > 0 && (
          <div style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: token.colorTextTertiary, textDecoration: "line-through" }}>
              {formatEUR(monthlyPrice)}/mo
            </Text>
            <Tag color="success" style={{ marginLeft: 8, fontSize: 11, fontWeight: 700 }}>
              {formatMessage(
                {
                  id: "billing.save_per_year",
                  defaultMessage: "Save {amount}/yr",
                },
                { amount: formatEUR(savings) },
              )}
            </Tag>
          </div>
        )}
        {!showAnnual && !isFreeTrial && (
          <div style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: token.colorTextTertiary }}>
              {formatMessage({
                id: "billing.billed_monthly",
                defaultMessage: "Billed monthly",
              })}
            </Text>
          </div>
        )}
        {showAnnual && savings > 0 && (
          <div style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
              {formatMessage(
                {
                  id: "billing.billed_yearly",
                  defaultMessage: "Billed {price}/year",
                },
                { price: formatEUR(annualTotal) },
              )}
            </Text>
          </div>
        )}

        <Divider style={{ margin: "0 0 16px", borderColor: token.colorBorderSecondary }} />

        {/* Core features */}
        <Space direction="vertical" size={8} style={{ width: "100%", marginBottom: 16 }}>
          {translatedFeatures.map((f: string, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 14, flexShrink: 0 }} />
              <Text style={{ fontSize: 13, color: token.colorText }}>{f}</Text>
            </div>
          ))}
        </Space>

        {/* Extra features */}
        {(plan.features_extra ?? []).length > 0 && (
          <>
            <Divider style={{ margin: "0 0 12px", borderColor: token.colorBorderSecondary }} dashed />
            <Space direction="vertical" size={6} style={{ width: "100%", marginBottom: 20 }}>
              {(plan.features_extra ?? []).map((f: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircleFilled style={{ color: accentColor, fontSize: 13, flexShrink: 0 }} />
                  <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>{f}</Text>
                </div>
              ))}
            </Space>
          </>
        )}

        {renderAction()}
      </div>
    </Card>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const BillingPage: React.FC = () => {
  useUserInfo();
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();

  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const { data: subscription, isLoading: subLoading } = useSubscription();

  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const router = useRouter();

  const createCheckout = useCreateCheckout();
  const createPortal = useCreatePortal();
  const cancelSub = useCancelSubscription();
  const changePlanMut = useChangePlan();
  const startTrial = useStartFreeTrial();

  const [interval, setInterval] = useState<BillingInterval>("month");
  const [couponCode, setCouponCode] = useState("");
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmChange, setConfirmChange] = useState<{ plan: Plan; type: "upgrade" | "downgrade" } | null>(null);

  const isLoading = plansLoading || subLoading;
  const currentPlan = subscription?.plan_id;
  const isTrial = subscription?.status === "trialing";
  const hasStripeSubscription = Boolean(subscription?.stripe_subscription_id);
  const hasAnySubscription = subscription != null;
  const isAccessGranted = subscription?.is_access_granted ?? false;
  const isCancelPending = subscription?.cancel_at_period_end ?? false;

  const appBaseUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL ?? "";

  const handleSubscribe = useCallback(
    (plan: Plan) => {
      if (plan.name === "free_trial") { startTrial.mutate(undefined, { onSuccess: () => router.replace("/dashboard") }); }
      else { setCheckoutPlan(plan); }
    },
    [startTrial, router]
  );

  const handleConfirmCheckout = useCallback(() => {
    if (!checkoutPlan) return;
    createCheckout.mutate(
      {
        plan_name: checkoutPlan.name,
        success_url: `${appBaseUrl}/plans/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appBaseUrl}/plans/cancel`,
        coupon_code: couponCode.trim() || undefined,
        interval,
      },
      { onSuccess: () => { setCheckoutPlan(null); setCouponCode(""); } }
    );
  }, [checkoutPlan, couponCode, interval, createCheckout, appBaseUrl]);

  const handleUpgrade = useCallback(
    (plan: Plan) => hasStripeSubscription ? setConfirmChange({ plan, type: "upgrade" }) : handleSubscribe(plan),
    [hasStripeSubscription, handleSubscribe]
  );

  const handleDowngrade = useCallback((plan: Plan) => setConfirmChange({ plan, type: "downgrade" }), []);

  const handleConfirmChangePlan = useCallback(() => {
    if (!confirmChange) return;
    changePlanMut.mutate(
      { planName: confirmChange.plan.name, interval },
      {
        onSuccess: (res) => {
          dispatch(setSubscription(res.data));
          queryClient.invalidateQueries({ queryKey: ["subscription"] });
          setConfirmChange(null);
        },
      }
    );
  }, [confirmChange, interval, changePlanMut, dispatch, queryClient]);

  const handleCancelSubscription = useCallback(() => {
    cancelSub.mutate(undefined, {
      onSuccess: (res) => {
        dispatch(setSubscription(res.data));
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        setConfirmCancel(false);
      },
    });
  }, [cancelSub, dispatch, queryClient]);

  const handleOpenPortal = useCallback(() => {
    createPortal.mutate({ return_url: `${appBaseUrl}/plans` });
  }, [createPortal, appBaseUrl]);

  const displayPlans = plans
    .filter((p) => p.name === "free_trial" || (p.price_cents != null && !isNaN(p.price_cents)))
    .sort((a, b) => (PLAN_ORDER[a.name] ?? 99) - (PLAN_ORDER[b.name] ?? 99));

  // Annual price for checkout modal
  const checkoutPrice = checkoutPlan
    ? interval === "year" && checkoutPlan.price_cents_annual
      ? checkoutPlan.price_cents_annual
      : checkoutPlan.price_cents
    : 0;
  const checkoutSavings = checkoutPlan
    ? checkoutPlan.price_cents * 12 - (checkoutPlan.price_cents_annual || 0)
    : 0;

  return (
    <div style={{ padding: "24px", maxWidth: 1280, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <Title level={3} style={{ margin: 0, color: token.colorText }}>
              {formatMessage({
                id: "billing.title",
                defaultMessage: "Billing & Subscription",
              })}
            </Title>
            <Text style={{ color: token.colorTextSecondary, marginTop: 4, display: "block" }}>
              {formatMessage({
                id: "billing.subtitle",
                defaultMessage: "Manage your plan, credits, and payment details",
              })}
            </Text>
          </div>
          {hasStripeSubscription && (
            <Button icon={<CreditCardOutlined />} onClick={handleOpenPortal} loading={createPortal.isPending} style={{ borderRadius: 8 }}>
              {formatMessage({
                id: "billing.portal",
                defaultMessage: "Billing Portal",
              })}
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      <Space direction="vertical" style={{ width: "100%", marginBottom: 24 }} size={12}>
        {!isAccessGranted && !isLoading && (
          <Alert
            type="error" showIcon icon={<ExclamationCircleOutlined />}
            message={
              <span>
                <strong>
                  {formatMessage({
                    id: "billing.inactive_title",
                    defaultMessage: "Subscription inactive",
                  })}
                </strong>
                {" - "}
                {formatMessage({
                  id: "billing.inactive_message",
                  defaultMessage: "Scraping and campaign features are locked.",
                })}
              </span>
            }
            action={
              <Button size="small" type="primary" danger onClick={() => handleSubscribe(plans.find((p) => p.name === "basic") as Plan)}>
                {formatMessage({
                  id: "billing.subscribe",
                  defaultMessage: "Subscribe",
                })}
              </Button>
            }
            style={{ borderRadius: 10 }}
          />
        )}
        {isTrial && isAccessGranted && subscription?.trial_end && (
          <Alert
            type="info"
            showIcon
            message={formatMessage(
              {
                id: "billing.trial_end_alert",
                defaultMessage: "Your 14-day free trial ends {date}. Upgrade to keep full access.",
              },
              { date: format(new Date(subscription.trial_end), "MMM d, yyyy") },
            )}
            style={{ borderRadius: 10 }}
          />
        )}
        {isCancelPending && subscription?.current_period_end && (
          <Alert
            type="warning"
            showIcon
            message={formatMessage(
              {
                id: "billing.cancel_pending_alert",
                defaultMessage: "Subscription will cancel on {date}. Reactivate via the billing portal.",
              },
              { date: format(new Date(subscription.current_period_end), "MMM d, yyyy") },
            )}
            style={{ borderRadius: 10 }}
          />
        )}
      </Space>

      {/* Content */}
      {isLoading ? (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}><Skeleton active paragraph={{ rows: 8 }} /></Col>
          <Col xs={24} lg={16}>
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4].map((i) => (<Col xs={24} sm={12} key={i}><Skeleton active paragraph={{ rows: 5 }} /></Col>))}
            </Row>
          </Col>
        </Row>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <SubscriptionPanel
              subscription={subscription}
              currentPlan={currentPlan}
              isTrial={isTrial}
              isCancelPending={isCancelPending}
              hasStripeSubscription={hasStripeSubscription}
              isPortalLoading={createPortal.isPending}
              onOpenPortal={handleOpenPortal}
              onCancelSubscription={() => setConfirmCancel(true)}
            />
          </Col>
          <Col xs={24} lg={16}>
            {/* Plan heading + billing toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <Text strong style={{ fontSize: 16, color: token.colorText }}>
                  {formatMessage({
                    id: "billing.choose_plan",
                    defaultMessage: "Choose a Plan",
                  })}
                </Text>
                <Text style={{ color: token.colorTextSecondary, marginLeft: 8, fontSize: 13 }}>
                  {formatMessage({
                    id: "billing.free_trial_note",
                    defaultMessage: "All plans include a 14-day free trial",
                  })}
                </Text>
              </div>

              {/* Monthly / Annual toggle */}
              <Space size={8} align="center">
                <Segmented
                  value={interval}
                  onChange={(v) => setInterval(v as BillingInterval)}
                  options={[
                    {
                      label: formatMessage({
                        id: "billing.monthly",
                        defaultMessage: "Monthly",
                      }),
                      value: "month",
                    },
                    {
                      label: (
                        <Space size={4}>
                          <span>
                            {formatMessage({
                              id: "billing.annual",
                              defaultMessage: "Annual",
                            })}
                          </span>
                          <Tag color="success" style={{ margin: 0, fontSize: 10, fontWeight: 700, lineHeight: "16px" }}>-10%</Tag>
                        </Space>
                      ),
                      value: "year",
                    },
                  ]}
                  style={{ borderRadius: 8 }}
                />
              </Space>
            </div>

            <Row gutter={[16, 16]}>
              {displayPlans.map((plan) => (
                <Col xs={24} sm={12} md={displayPlans.length > 3 ? 12 : 8} key={plan._id}>
                  <PlanCard
                    plan={plan}
                    interval={interval}
                    isCurrentPlan={currentPlan?.name === plan.name}
                    currentPlanName={currentPlan?.name}
                    isTrial={isTrial}
                    hasStripeSubscription={hasStripeSubscription}
                    hasAnySubscription={hasAnySubscription}
                    onUpgrade={handleUpgrade}
                    onDowngrade={handleDowngrade}
                    onSubscribe={handleSubscribe}
                    onCancelSubscription={() => setConfirmCancel(true)}
                    isSubscribeLoading={changePlanMut.isPending || createCheckout.isPending || startTrial.isPending}
                    isCancelLoading={cancelSub.isPending}
                  />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}

      {/* Checkout Modal */}
      <Modal
        open={!!checkoutPlan}
        title={
          <Space>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: PLAN_GRADIENT[checkoutPlan?.name ?? ""] ?? token.colorPrimary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              {PLAN_ICONS[checkoutPlan?.name ?? ""]}
            </div>
            <span>
              {formatMessage(
                {
                  id: "billing.subscribe_to_plan",
                  defaultMessage: "Subscribe to {plan}",
                },
                {
                  plan: getPlanDisplayName(formatMessage, checkoutPlan?.name, checkoutPlan?.display_name),
                },
              )}
            </span>
          </Space>
        }
        onCancel={() => { setCheckoutPlan(null); setCouponCode(""); }}
        footer={[
          <Button key="back" onClick={() => { setCheckoutPlan(null); setCouponCode(""); }}>
            {formatMessage({
              id: "commons.cancel",
              defaultMessage: "Cancel",
            })}
          </Button>,
          <Button key="go" type="primary" loading={createCheckout.isPending} onClick={handleConfirmCheckout} style={{ background: PLAN_GRADIENT[checkoutPlan?.name ?? ""], border: "none" }} icon={<ArrowRightOutlined />}>
            {formatMessage({
              id: "billing.proceed_checkout",
              defaultMessage: "Proceed to Checkout",
            })}
          </Button>,
        ]}
        style={{ top: 80 }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={20}>
          <div style={{ padding: 16, borderRadius: 12, background: token.colorFillAlter, border: `1px solid ${token.colorBorderSecondary}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: token.colorTextSecondary }}>
                {formatMessage({
                  id: "billing.plan_label",
                  defaultMessage: "Plan",
                })}
              </Text>
              <Text strong>{getPlanDisplayName(formatMessage, checkoutPlan?.name, checkoutPlan?.display_name)}</Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: token.colorTextSecondary }}>
                {formatMessage({
                  id: "billing.billing_label",
                  defaultMessage: "Billing",
                })}
              </Text>
              <Text strong>
                {interval === "year"
                  ? formatMessage({
                      id: "billing.annual_with_discount",
                      defaultMessage: "Annual (10% off)",
                    })
                  : formatMessage({
                      id: "billing.monthly",
                      defaultMessage: "Monthly",
                    })}
              </Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: token.colorTextSecondary }}>
                {formatMessage({
                  id: "billing.price_label",
                  defaultMessage: "Price",
                })}
              </Text>
              <Text strong style={{ color: PLAN_COLOR[checkoutPlan?.name ?? ""] }}>
                {interval === "year" && checkoutPlan?.price_cents_annual
                  ? `${formatEUR(checkoutPlan.price_cents_annual)}/yr`
                  : `${formatEUR(checkoutPlan?.price_cents ?? 0)}/mo`}
              </Text>
            </div>
            {interval === "year" && checkoutSavings > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text style={{ color: token.colorTextSecondary }}>
                  {formatMessage({
                    id: "billing.you_save",
                    defaultMessage: "You save",
                  })}
                </Text>
                <Text strong style={{ color: token.colorSuccess }}>{formatEUR(checkoutSavings)}/year</Text>
              </div>
            )}
          </div>
          <div>
            <Text strong style={{ display: "block", marginBottom: 8, color: token.colorText }}>
              {formatMessage({
                id: "billing.coupon_code_optional",
                defaultMessage: "Coupon code (optional)",
              })}
            </Text>
            <Input.Search
              placeholder={formatMessage({
                id: "billing.coupon_placeholder",
                defaultMessage: "e.g. SUMMER25",
              })}
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              enterButton={formatMessage({
                id: "billing.apply",
                defaultMessage: "Apply",
              })}
              onSearch={(v) => setCouponCode(v.toUpperCase())}
              allowClear
            />
            <Text style={{ fontSize: 12, color: token.colorTextTertiary, marginTop: 6, display: "block" }}>
              {formatMessage({
                id: "billing.coupon_help",
                defaultMessage: "Coupon codes are validated on the Stripe checkout page.",
              })}
            </Text>
          </div>
        </Space>
      </Modal>

      {/* Upgrade / Downgrade Confirmation */}
      <Modal
        open={!!confirmChange}
        title={
          confirmChange?.type === "upgrade"
            ? formatMessage(
                {
                  id: "billing.upgrade_to",
                  defaultMessage: "Upgrade to {plan}",
                },
                {
                  plan: getPlanDisplayName(formatMessage, confirmChange?.plan.name, confirmChange?.plan.display_name),
                },
              )
            : formatMessage(
                {
                  id: "billing.downgrade_to",
                  defaultMessage: "Downgrade to {plan}",
                },
                {
                  plan: getPlanDisplayName(formatMessage, confirmChange?.plan.name, confirmChange?.plan.display_name),
                },
              )
        }
        onCancel={() => setConfirmChange(null)}
        footer={[
          <Button key="no" onClick={() => setConfirmChange(null)}>
            {formatMessage({
              id: "commons.cancel",
              defaultMessage: "Cancel",
            })}
          </Button>,
          <Button key="yes" type={confirmChange?.type === "upgrade" ? "primary" : "default"} danger={confirmChange?.type === "downgrade"} loading={changePlanMut.isPending} onClick={handleConfirmChangePlan}>
            {confirmChange?.type === "upgrade"
              ? formatMessage({
                  id: "billing.confirm_upgrade",
                  defaultMessage: "Confirm Upgrade",
                })
              : formatMessage({
                  id: "billing.confirm_downgrade",
                  defaultMessage: "Confirm Downgrade",
                })}
          </Button>,
        ]}
        style={{ top: 80 }}
      >
        {confirmChange?.type === "upgrade" ? (
          <Paragraph style={{ color: token.colorTextSecondary }}>
            {formatMessage(
              {
                id: "billing.upgrade_notice",
                defaultMessage:
                  "You will be upgraded to {plan} immediately. Prorated charges will appear on your next invoice.",
              },
              {
                plan: getPlanDisplayName(formatMessage, confirmChange?.plan.name, confirmChange?.plan.display_name),
              },
            )}
          </Paragraph>
        ) : (
          <Paragraph style={{ color: token.colorTextSecondary }}>
            {formatMessage(
              {
                id: "billing.downgrade_notice",
                defaultMessage:
                  "You will be downgraded to {plan} at the end of your current billing period. You retain your current plan access until then.",
              },
              {
                plan: getPlanDisplayName(formatMessage, confirmChange?.plan.name, confirmChange?.plan.display_name),
              },
            )}
          </Paragraph>
        )}
      </Modal>

      {/* Cancel Confirmation */}
      <Modal
        open={confirmCancel}
        title={
          <Space>
            <CloseCircleOutlined style={{ color: token.colorError }} />
            {formatMessage({
              id: "billing.cancel_confirmation_title",
              defaultMessage: "Cancel Subscription",
            })}
          </Space>
        }
        onCancel={() => setConfirmCancel(false)}
        footer={[
          <Button key="keep" onClick={() => setConfirmCancel(false)}>
            {formatMessage({
              id: "billing.keep_subscription",
              defaultMessage: "Keep Subscription",
            })}
          </Button>,
          <Button key="cancel" danger loading={cancelSub.isPending} onClick={handleCancelSubscription}>
            {formatMessage({
              id: "billing.yes_cancel",
              defaultMessage: "Yes, Cancel",
            })}
          </Button>,
        ]}
        style={{ top: 80 }}
      >
        <Paragraph style={{ color: token.colorTextSecondary }}>
          {formatMessage({
            id: "billing.cancel_confirmation_body",
            defaultMessage:
              "Are you sure you want to cancel? You will retain access until the end of your current billing period and will not be charged again.",
          })}
        </Paragraph>
      </Modal>
    </div>
  );
};

export default BillingPage;
