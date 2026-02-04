import { FetchAllLeadsList, FetchAllLeadsSummary } from "@/api/api_calls/leads";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useFetchLeadsSummary = (params?: LeadsSummaryParams) => {
  const query = useQuery({
    queryKey: ["leads", "summary", params],
    queryFn: () => FetchAllLeadsSummary(params as any ?? {}),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
};

export const useFetchLeadsList = (params?: LeadsListParams) => {
  const query = useQuery({
    queryKey: ["leads", "list", params],
    queryFn: () => FetchAllLeadsList(params as any ?? {}),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
  };
};
