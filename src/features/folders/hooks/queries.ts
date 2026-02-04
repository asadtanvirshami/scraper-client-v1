import { fetchFolders } from "@/api/api_calls/folders";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
export const useFetchFolders = (params?: any) => {
  const query = useQuery({
    queryKey: ["folders", "list", params],
    queryFn: () => fetchFolders(params ?? {}),
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
