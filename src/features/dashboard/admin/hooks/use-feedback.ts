import { useQuery } from "@tanstack/react-query";

type FeedbackUser = {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
};

type Feedback = {
  _id: string;
  feedback: string;
  user_id: FeedbackUser | null;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type FeedbackResponse = {
  code: number;
  success: boolean;
  message: string;
  data: Feedback[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type FeedbackFilters = {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  status?: string;
  rating?: number;
};

const fetchFeedback = async (filters: FeedbackFilters): Promise<FeedbackResponse> => {
  const params = new URLSearchParams();
  params.append('page', filters.page.toString());
  params.append('limit', filters.limit.toString());
  
  if (filters.search) {
    params.append('search', filters.search);
  }

  const response = await fetch(`http://localhost:4000/api/feedback/get?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch feedback');
  }
  
  return response.json();
};

export const useFeedback = (filters: FeedbackFilters) => {
  return useQuery({
    queryKey: ['feedback', filters],
    queryFn: () => fetchFeedback(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export type { Feedback, FeedbackResponse, FeedbackFilters };
