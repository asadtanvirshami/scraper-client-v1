// src/api/api_calls/billing/index.ts

import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import type {
  PlansResponse,
  SubscriptionResponse,
  CheckoutResponse,
  PortalResponse,
  ChangePlanResponse,
  BillingInterval,
  AdminSubscriptionsResponse,
  AdminChargesResponse,
  AdminPromoCodesResponse,
  CreatePromoCodePayload,
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
  interval?: BillingInterval;
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
export async function changePlan(plan_name: string, interval?: BillingInterval): Promise<ChangePlanResponse> {
  const { data } = await api.post(apiEndpoints.billing.changePlan, { plan_name, interval });
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

// ─── Admin billing API calls ──────────────────────────────────────────────────

export async function adminFetchSubscriptions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<AdminSubscriptionsResponse> {
  const { data } = await api.get(apiEndpoints.adminBilling.subscriptions, { params });
  return data;
}

export async function adminCancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post(apiEndpoints.adminBilling.cancelSubscription(userId));
  return data;
}

export async function adminFetchCharges(params?: {
  customer_id?: string;
  limit?: number;
  starting_after?: string;
}): Promise<AdminChargesResponse> {
  const { data } = await api.get(apiEndpoints.adminBilling.charges, { params });
  return data;
}

export async function adminIssueRefund(payload: {
  charge_id: string;
  amount?: number;
  reason?: string;
}): Promise<{ success: boolean; message: string; data: unknown }> {
  const { data } = await api.post(apiEndpoints.adminBilling.refund, payload);
  return data;
}

export async function adminFetchPromoCodes(params?: {
  active?: boolean;
  limit?: number;
}): Promise<AdminPromoCodesResponse> {
  const { data } = await api.get(apiEndpoints.adminBilling.promoCodes, { params });
  return data;
}

export async function adminCreatePromoCode(
  payload: CreatePromoCodePayload
): Promise<{ success: boolean; message: string; data: unknown }> {
  const { data } = await api.post(apiEndpoints.adminBilling.promoCodes, payload);
  return data;
}

export async function adminDeactivatePromoCode(
  promoCodeId: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.patch(apiEndpoints.adminBilling.deactivatePromoCode(promoCodeId));
  return data;
}

