import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";

export type FeedbacksQueryState = {
  page: number;
  limit: number;
  search?: string;
  user_id?: string;
};

export type FeedbackType = {
  _id: string;
  feedback: string;
  user_id: string | {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type FeedbackResponse = {
  code: number;
  success: boolean;
  message: string;
  data: FeedbackType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
      const queryParams = new URLSearchParams();
      queryParams.append('page', query.page.toString());
      queryParams.append('limit', query.limit.toString());
      
      if (query.search) {
        queryParams.append('search', query.search);
      }
      
      if (query.user_id) {
        queryParams.append('user_id', query.user_id);
      }

      const response = await fetch(`http://localhost:4000/api/feedback/get?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks');
      }
      
      return response.json() as Promise<FeedbackResponse>;
    },
    staleTime: 30000, // 30 seconds
  });

  const feedbacks = response?.data || [];
  const total = response?.pagination?.total || 0;

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
    mutationFn: async (input: { feedback: string; user_id?: string }) => {
      const response = await fetch('http://localhost:4000/api/feedback/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create feedback');
      }
      
      return response.json();
    },
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
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<FeedbackType>;
    }) => {
      const response = await fetch(`http://localhost:4000/api/feedback/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update feedback');
      }
      
      return response.json();
    },
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
    mutationFn: async (id: string) => {
      const response = await fetch(`http://localhost:4000/api/feedback/delete/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
};

// Export feedback modal timer hook
export { useFeedbackModalTimer } from "./use-feedback-modal-timer";
