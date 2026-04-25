import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { bulkDeleteEmail, deleteEmail, createEmail, verifyEmail } from "@/api/api_calls/emails";

export type CreateEmailParams = {
  user_id: string;
  email: string;
};

export type VerifyEmailParams = {
  otp: string;
  email: string;
};

export type UpdateEmailParams = {
  email_id: string;
  subject?: string;
  content?: string;
  to?: string[];
};

export type DeleteEmailsParams = string[];
export type DeleteEmailParams = string;

export const useCreateEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEmail,
    onSuccess: () => {
      message.success('Email added successfully');
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to add email');
    },
  });
};

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      if (data.success) {
        message.success('Email verified successfully');
        queryClient.invalidateQueries({ queryKey: ['emails'] });
      } else {
        message.error(data.message || 'Email verification failed');
      }
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to verify email');
    },
  });
};

export const useBulkDeleteEmails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: DeleteEmailsParams) => bulkDeleteEmail(ids),
    onSuccess: () => {
      message.success('Emails deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to delete emails');
    },
  });
};

export const useDeleteEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emailId: DeleteEmailParams) => deleteEmail(emailId),
    onSuccess: () => {
      message.success('Email deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to delete email');
    },
  });
};

