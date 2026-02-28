import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import {
  CreateFeedback,
  UpdateFeedback,
  DeleteFeedback,
  GetFeedbacks,
} from "@/api/api_calls/support";
import { CreateFeedbackPayload, FeedbackType } from "@/types/api/bug";

export type FeedbacksQueryState = {
  page: number;
  limit: number;
  search?: string;
  user_id?: string;
};

const INITIAL_QUERY: FeedbacksQueryState = {
  page: 1,
  limit: 10,
  search: "",
  user_id: "",
};

/**
 * ✅ Hook to manage feedbacks listing with pagination and filtering
 */
export const useFeedbacksList = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<FeedbacksQueryState>(INITIAL_QUERY);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feedbacks", query],
    queryFn: async () => {
      const result = await GetFeedbacks({
        offset: query.page,
        limit: query.limit,
        search: query.search,
        user_id: query.user_id,
      });
      return result;
    },
    staleTime: 30000, // 30 seconds
  });

  const feedbacks = (response?.data || []) as FeedbackType[];
  const total = (response.pagination.total || 0) as number;

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
  }, [queryClient]);

  const updateQuery = useCallback((updates: Partial<FeedbacksQueryState>) => {
    setQuery((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetQuery = useCallback(() => {
    setQuery(INITIAL_QUERY);
  }, []);

  return {
    feedbacks,
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
 * ✅ Hook to create a feedback
 */
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["support", "feedback", "create"],
    mutationFn: (input: CreateFeedbackPayload) => CreateFeedback(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
};

/**
 * ✅ Hook to update a feedback
 */
export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["support", "feedback", "update"],
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateFeedbackPayload>;
    }) => UpdateFeedback(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
};

/**
 * ✅ Hook to delete a feedback
 */
export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["support", "feedback", "delete"],
    mutationFn: (id: string) => DeleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
};

// Export feedback modal timer hook
export { useFeedbackModalTimer } from "./use-feedback-modal-timer";
