import { useQuery } from "@tanstack/react-query";

type Email = {
  _id: string;
  user_id: string;
  email: string;
  verified: boolean;
  otp: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

type EmailResponse = {
  code: number;
  success: boolean;
  message: string;
  data: Email[];
};

type FetchEmailsParams = {
  user_id: string;
  page?: number;
  limit?: number;
  subject?: string;
};

const fetchEmails = async (params: FetchEmailsParams): Promise<EmailResponse> => {
  const queryParams = new URLSearchParams();
  queryParams.append('user_id', params.user_id);
  
  if (params.page) {
    queryParams.append('page', params.page.toString());
  }
  
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  
  if (params.subject) {
    queryParams.append('subject', params.subject);
  }

  const response = await fetch(`http://localhost:4000/api/email/get?${queryParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch emails');
  }
  
  return response.json();
};

export const useFetchEmails = (params: FetchEmailsParams) => {
  return useQuery({
    queryKey: ['emails', params],
    queryFn: () => fetchEmails(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!params.user_id,
  });
};

export type { Email, EmailResponse, FetchEmailsParams };
