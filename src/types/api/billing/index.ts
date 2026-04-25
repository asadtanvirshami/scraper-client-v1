// src/types/api/billing/index.ts

export interface Plan {
  _id: string;
  name: "free_trial" | "basic" | "standard" | "premium";
  display_name: string;
  price_cents: number;
  interval: "month" | "year" | "one_time" | "trial";
  credits_per_cycle: number;
  /** -1 = unlimited */
  max_smtp_domains: number;
  /** -1 = unlimited */
  max_campaigns: number;
  trial_days: number;
  features: string[];
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
