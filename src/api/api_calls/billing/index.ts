// src/api/api_calls/billing/index.ts

import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import type {
  PlansResponse,
  SubscriptionResponse,
  CheckoutResponse,
  PortalResponse,
  ChangePlanResponse,
} from "@/types/api/billing";

/** Fetch all active plans (public) */
export async function fetchPlans(): Promise<PlansResponse> {
  const { data } = await api.get(apiEndpoints.billing.plans);
  return data;
}

/** Fetch current user's active subscription */
export async function fetchSubscription(): Promise<SubscriptionResponse> {
  const { data } = await api.get(apiEndpoints.billing.subscription);
  return data;
}

/** Create a Stripe Checkout session */
export async function createCheckoutSession(payload: {
  plan_name: string;
  success_url: string;
  cancel_url: string;
  coupon_code?: string;
}): Promise<CheckoutResponse> {
  const { data } = await api.post(apiEndpoints.billing.checkout, payload);
  return data;
}

/** Create a Stripe Customer Portal session */
export async function createPortalSession(payload: {
  return_url: string;
}): Promise<PortalResponse> {
  const { data } = await api.post(apiEndpoints.billing.portal, payload);
  return data;
}

/** Cancel subscription at period end */
export async function cancelSubscription(): Promise<SubscriptionResponse> {
  const { data } = await api.post(apiEndpoints.billing.cancel, {});
  return data;
}

/** Change plan (upgrade or downgrade) */
export async function changePlan(plan_name: string): Promise<ChangePlanResponse> {
  const { data } = await api.post(apiEndpoints.billing.changePlan, { plan_name });
  return data;
}

/** Start the 14-day free trial (no Stripe required) */
export async function startFreeTrial(): Promise<SubscriptionResponse> {
  const { data } = await api.post(apiEndpoints.billing.freeTrial, {});
  return data;
}

/** Sync subscription from a completed Stripe checkout session */
export async function syncCheckoutSession(session_id: string): Promise<SubscriptionResponse> {
  const { data } = await api.post(apiEndpoints.billing.syncSession, { session_id });
  return data;
}
