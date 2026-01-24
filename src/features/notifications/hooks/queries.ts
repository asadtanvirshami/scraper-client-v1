"use client";

import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import initNotifications from "@/services/notification/init-notification";
import type { PaginatedResponse } from "../type";

import { fetchNotifications } from "@/api/api_calls/notifications"; // ✅ use your API calls

export function useNotifications(userId: string, enabled = false) {
  const dispatch = useAppDispatch();
  const { items, unread, ids, isLoading } = useAppSelector((s) => s.notification);

  useEffect(() => {
    if (enabled) {
      initNotifications(dispatch, userId);
    }
  }, [dispatch, userId, enabled]);

  return { items, unread, ids, isLoading };
}

export const useNotificationsInfinite = (userId?: string) => {
  return useInfiniteQuery<
    PaginatedResponse, // TQueryFnData
    Error, // TError
    PaginatedResponse, // TData
    [string, string?], // TQueryKey
    number // TPageParam
  >({
    queryKey: ["notifications", userId],
    initialPageParam: 0,
    enabled: !!userId,

    queryFn: async ({ pageParam }) => {
      // ✅ uses your API request file + endpoint config
      const res = await fetchNotifications(pageParam, 10);
      return res as unknown as PaginatedResponse;
    },

    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + (p.data?.length || 0), 0);
      if (loaded >= lastPage.totalCount) return undefined;
      return loaded; // next offset
    },
  });
};
