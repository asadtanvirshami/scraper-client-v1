import { useQuery } from "@tanstack/react-query";

type BugUser = {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
};

type BugReport = {
  _id: string;
  bug: string;
  user_id: BugUser | null;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type BugResponse = {
  code: number;
  success: boolean;
  message: string;
  data: BugReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type BugFilters = {
  page: number;
  limit: number;
  search?: string;
  priority?: string;
  status?: string;
  category?: string;
};

const fetchBugReports = async (filters: BugFilters): Promise<BugResponse> => {
  const params = new URLSearchParams();
  params.append('page', filters.page.toString());
  params.append('limit', filters.limit.toString());
  
  if (filters.search) {
    params.append('search', filters.search);
  }

  const response = await fetch(`http://localhost:4000/api/bug/get?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch bug reports');
  }
  
  return response.json();
};

export const useBugReports = (filters: BugFilters) => {
  return useQuery({
    queryKey: ['bugReports', filters],
    queryFn: () => fetchBugReports(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export type { BugReport, BugResponse, BugFilters };
