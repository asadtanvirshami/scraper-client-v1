import { fetchDashboard } from "@/api/api_calls/dashboard";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export type DashboardParams = {
  user_id: string;
  days?: number;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
};

export const useFetchDashboard = (params?: DashboardParams,) => {
  const userId = params?.user_id || "";
  const days = params?.days ?? null;
  const dateFrom = params?.dateFrom ?? null;
  const dateTo = params?.dateTo ?? null;

  const query = useQuery({
    queryKey: ["dashboard", userId, days, dateFrom, dateTo],
    queryFn: () => fetchDashboard({
      user_id: userId,
      ...(days ? { days } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    }),
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,     // first load only
    isFetching: query.isFetching,   // background / range changes
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
