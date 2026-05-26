"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { message } from "antd";
import {
  fetchPlans,
  fetchSubscription,
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  changePlan,
  startFreeTrial,
} from "@/api/api_calls/billing";
import { setSubscription, setPlans } from "@/redux/slices/subscription/subscription-slice";
import { useAppSelector } from "@/redux/hook";

// ─── Queries ──────────────────────────────────────────────────────────────────

export const usePlans = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["billing-plans"],
    queryFn: async () => {
      const res = await fetchPlans();
      if (res.success) dispatch(setPlans(res.data));
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // 10 min
  });
};

export const useSubscription = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetchSubscription();
      dispatch(setSubscription(res.success ? res.data : null));
      return res.data;
    },
    staleTime: 60 * 1000, // 1 min
    retry: false,
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (res) => {
      if (res.data?.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = res.data.checkout_url;
      }
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to start checkout");
    },
  });
};

export const useCreatePortal = () => {
  return useMutation({
    mutationFn: createPortalSession,
    onSuccess: (res) => {
      if (res.data?.portal_url) {
        window.location.href = res.data.portal_url;
      }
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to open billing portal");
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (res) => {
      message.success("Subscription will be cancelled at the end of the billing period");
      dispatch(setSubscription(res.data));
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to cancel subscription");
    },
  });
};

export const useChangePlan = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: ({ planName, interval }: { planName: string; interval?: "month" | "year" }) =>
      changePlan(planName, interval),
    onSuccess: (res) => {
      message.success(res.message || "Plan changed successfully");
      dispatch(setSubscription(res.data));
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to change plan";
      message.error(msg);
    },
  });
};

// ─── Selector hook ────────────────────────────────────────────────────────────

export const useStartFreeTrial = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: startFreeTrial,
    onSuccess: (res) => {
      message.success("Free trial started! Enjoy 14 days of full access.");
      dispatch(setSubscription(res.data));
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to start free trial");
    },
  });
};

/**
 * Returns the cached subscription from Redux store (instantly available,
 * no loading spinner needed in most cases).
 */
export const useSubscriptionState = () => {
  return useAppSelector((s) => s.subscription);
};
