import { fetchDashboard } from "@/api/api_calls/dashboard";
import { useQuery } from "@tanstack/react-query";

export const useFetchDashboard = () => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};
