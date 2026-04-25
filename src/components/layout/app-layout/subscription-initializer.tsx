"use client";

/**
 * Fires a single subscription fetch when the authenticated layout mounts.
 * Also acts as a guard: if the user has no active subscription / trial,
 * they are redirected to /plans so they can pick one.
 */
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSubscription } from "@/features/billings/hooks";

/** Routes where we must NOT redirect (user is trying to subscribe / manage billing). */
const EXEMPT_PREFIXES = ["/plans", "/billings", "/auth", "/onboarding"];

const SubscriptionInitializer: React.FC = () => {
  const { data: subscription, isLoading, isError } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for the query to settle
    if (isLoading) return;

    // Don't redirect on exempt pages
    if (EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) return;

    // Determine whether the user has usable access
    const noSubscription = isError || subscription == null;
    const lostAccess =
      subscription != null &&
      !subscription.is_access_granted &&
      (subscription.status === "canceled" ||
        subscription.status === "incomplete_expired" ||
        subscription.status === "unpaid");

    if (noSubscription || lostAccess) {
      router.replace("/plans");
    }
  }, [subscription, isLoading, isError, pathname, router]);

  return null;
};

export default SubscriptionInitializer;

