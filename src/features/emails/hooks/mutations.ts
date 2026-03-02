import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

type CreateEmailParams = {
  user_id: string;
  email: string;
};

type VerifyEmailParams = {
  otp: string;
  email: string;
};

type UpdateEmailParams = {
  email_id: string;
  subject?: string;
  content?: string;
  to?: string[];
};

type DeleteEmailsParams = string[];

const createEmail = async (params: CreateEmailParams) => {
  const response = await fetch('http://localhost:4000/api/email/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to create email');
  }

  return response.json();
};

const verifyEmail = async (params: VerifyEmailParams) => {
  const response = await fetch('http://localhost:4000/api/email/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to verify email');
  }

  return response.json();
};

const updateEmail = async (params: UpdateEmailParams) => {
  const response = await fetch('/api/emails/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to update email');
  }

  return response.json();
};

const bulkDeleteEmails = async (ids: DeleteEmailsParams) => {
  const response = await fetch('/api/emails/bulk-delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete emails');
  }

  return response.json();
};

export const useCreateEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createEmail,
    onSuccess: () => {
      message.success('Email added successfully');
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    onError: () => {
      message.error('Failed to add email');
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
    onError: () => {
      message.error('Failed to verify email');
    },
  });
};

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateEmail,
    onSuccess: () => {
      message.success('Email updated successfully');
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    onError: () => {
      message.error('Failed to update email');
    },
  });
};

export const useBulkDeleteEmails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bulkDeleteEmails,
    onSuccess: () => {
      message.success('Emails deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['emails'] });
    },
    onError: () => {
      message.error('Failed to delete emails');
    },
  });
};

export type { CreateEmailParams, VerifyEmailParams, UpdateEmailParams, DeleteEmailsParams };
