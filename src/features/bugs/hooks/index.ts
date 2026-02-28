import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import {
  CreateBug,
  UpdateBug,
  DeleteBug,
  GetBugs,
} from "@/api/api_calls/support";
import { CreateBugPayload, UpdateBugPayload, BugType } from "@/types/api/bug";

export type BugsQueryState = {
  page: number;
  limit: number;
  search?: string;
  user_id?: string;
};

const INITIAL_QUERY: BugsQueryState = {
  page: 1,
  limit: 10,
  search: "",
  user_id: "",
};

/**
 * ✅ Hook to manage bugs listing with pagination and filtering
 */
export const useBugsList = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<BugsQueryState>(INITIAL_QUERY);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bugs", query],
    queryFn: async () => {
      const result = await GetBugs({
        offset: query.page,
        limit: query.limit,
        search: query.search,
        user_id: query.user_id,
      });
      return result;
    },
    staleTime: 30000, // 30 seconds
  });

  const bugs = (response?.data || []) as BugType[];
  const total = (response?.pagination.total || 0) as number;

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["bugs"] });
  }, [queryClient]);

  const updateQuery = useCallback((updates: Partial<BugsQueryState>) => {
    setQuery((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetQuery = useCallback(() => {
    setQuery(INITIAL_QUERY);
  }, []);

  return {
    bugs,
    total,
    isLoading,
    error,
    query,
    setQuery: updateQuery,
    resetQuery,
    refetch,
  };
};

/**
 * ✅ Hook to create a bug
 */
export const useCreateBug = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["support", "bug", "create"],
    mutationFn: (input: CreateBugPayload) => CreateBug(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugs"] });
    },
  });
};

/**
 * ✅ Hook to update a bug
 */
export const useUpdateBug = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["support", "bug", "update"],
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBugPayload }) =>
      UpdateBug(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugs"] });
    },
  });
};

/**
 * ✅ Hook to delete a bug
 */
export const useDeleteBug = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["support", "bug", "delete"],
    mutationFn: (id: string) => DeleteBug(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bugs"] });
    },
  });
};
