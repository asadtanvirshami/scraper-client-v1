import { useQuery } from "@tanstack/react-query";
import {
  fetchEmails,
  type Email,
  type FetchEmailsParams,
  type FetchEmailsResponse,
} from "@/api/api_calls/emails";

export const useFetchEmails = (params: FetchEmailsParams) => {
  return useQuery({
    queryKey: ["emails", params],
    queryFn: () => fetchEmails(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params.user_id,
  });
};

export type { Email, FetchEmailsResponse as EmailResponse, FetchEmailsParams };
