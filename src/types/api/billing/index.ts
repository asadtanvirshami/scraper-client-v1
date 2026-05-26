// src/types/api/billing/index.ts

export type BillingInterval = "month" | "year";

export interface Plan {
  _id: string;
  name: "free_trial" | "basic" | "standard" | "premium";
  display_name: string;
  price_cents: number;
  price_cents_annual: number;
  has_annual_price: boolean;
  interval: "month" | "year" | "one_time" | "trial";
  credits_per_cycle: number;
  /** -1 = unlimited */
  max_smtp_domains: number;
  /** -1 = unlimited */
  max_campaigns: number;
  trial_days: number;
  features: string[];
  features_extra: string[];
}

export interface Subscription {
  _id: string;
  user_id: string;
  plan_id: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "incomplete"
    | "incomplete_expired"
    | "paused";
  current_period_start: string;
  current_period_end: string;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  credits_total: number;
  credits_used: number;
  credits_remaining: number;
  is_access_granted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

export interface PortalSessionResponse {
  portal_url: string;
}

export interface PlansResponse {
  code: number;
  success: boolean;
  data: Plan[];
}

export interface SubscriptionResponse {
  code: number;
  success: boolean;
  data: Subscription;
}

export interface CheckoutResponse {
  code: number;
  success: boolean;
  data: CheckoutSessionResponse;
}

export interface PortalResponse {
  code: number;
  success: boolean;
  data: PortalSessionResponse;
}

export interface ChangePlanResponse {
  code: number;
  success: boolean;
  message: string;
  data: Subscription;
}

// ─── Admin billing types ──────────────────────────────────────────────────────

export interface AdminSubscriptionRow {
  _id: string;
  user_id: {
    _id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    stripe_customer_id?: string;
  };
  plan_id: Pick<Plan, "_id" | "name" | "display_name" | "price_cents" | "price_cents_annual">;
  status: Subscription["status"];
  stripe_subscription_id: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface StripeCharge {
  id: string;
  amount: number;
  amount_refunded: number;
  currency: string;
  status: string;
  refunded: boolean;
  customer: string;
  description: string | null;
  created: number;
  receipt_url: string | null;
}

export interface StripeCoupon {
  id: string;
  name: string | null;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
  duration: "once" | "repeating" | "forever";
  duration_in_months: number | null;
  times_redeemed: number;
  valid: boolean;
}

export interface StripePromoCode {
  id: string;
  code: string;
  active: boolean;
  times_redeemed: number;
  max_redemptions: number | null;
  expires_at: number | null;
  coupon: StripeCoupon;
}

export interface AdminSubscriptionsResponse {
  code: number;
  success: boolean;
  data: AdminSubscriptionRow[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface AdminChargesResponse {
  code: number;
  success: boolean;
  data: StripeCharge[];
  has_more: boolean;
}

export interface AdminPromoCodesResponse {
  code: number;
  success: boolean;
  data: StripePromoCode[];
  has_more: boolean;
}

export interface CreatePromoCodePayload {
  code: string;
  percent_off?: number;
  amount_off?: number;
  currency?: string;
  duration: "once" | "repeating" | "forever";
  duration_in_months?: number;
  max_redemptions?: number;
  expires_at?: string;
  name?: string;
}

