import { useQuery } from "@tanstack/react-query";

type User = {
  _id: string;
  email: string;
  role?: string;
  first_name?: string;
  last_name?: string;
  createdAt: string;
  is_blocked?: boolean;
  is_deleted?: boolean;
};

type UsersResponse = {
  code: number;
  success: boolean;
  message: string;
  data: {
    totalCount: number;
    limit: number;
    offset: number;
    users: User[];
  };
};

type UserFilters = {
  page: number;
  limit: number;
  search?: string;
  is_blocked?: boolean | undefined;
  is_deleted?: boolean | undefined;
};

const fetchUsers = async (filters: UserFilters): Promise<UsersResponse> => {
  const params = new URLSearchParams();
  params.append('page', filters.page.toString());
  params.append('limit', filters.limit.toString());
  
  if (filters.search) {
    params.append('search', filters.search);
  }

  const response = await fetch(`http://localhost:4000/api/auth/get-user?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return response.json();
};

export const useUsers = (filters: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export type { User, UsersResponse, UserFilters };
