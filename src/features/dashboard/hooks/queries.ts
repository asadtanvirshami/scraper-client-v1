import { fetchDashboard } from "@/api/api_calls/dashboard";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

export type DashboardParams = {
  days?: number;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string;   // YYYY-MM-DD
};

export const useFetchDashboard = (params?: DashboardParams) => {
  const query = useQuery({
    queryKey: ["dashboard", params], // ✅ refetch when params change
    queryFn: () => fetchDashboard(params ?? {}),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData, // ✅ keeps layout stable
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
