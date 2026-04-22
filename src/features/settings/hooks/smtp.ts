import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSmtpAccount,
  deleteSmtpAccount,
  fetchSmtpAccounts,
  testSmtpAccount,
  updateSmtpAccount,
} from "@/api/api_calls/smtp";
import {
  CreateSmtpAccountPayload,
  UpdateSmtpAccountPayload,
} from "@/types/api/smtp";

export const useFetchSmtpAccounts = () =>
  useQuery({
    queryKey: ["smtp", "accounts"],
    queryFn: fetchSmtpAccounts,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useCreateSmtpAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["smtp", "create"],
    mutationFn: (payload: CreateSmtpAccountPayload) =>
      createSmtpAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp", "accounts"] });
    },
  });
};

export const useUpdateSmtpAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["smtp", "update"],
    mutationFn: ({ accountId, payload }: { accountId: string; payload: UpdateSmtpAccountPayload }) =>
      updateSmtpAccount(accountId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp", "accounts"] });
    },
  });
};

export const useDeleteSmtpAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["smtp", "delete"],
    mutationFn: (accountId: string) => deleteSmtpAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp", "accounts"] });
    },
  });
};

export const useTestSmtpAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["smtp", "test"],
    mutationFn: (accountId: string) => testSmtpAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["smtp", "accounts"] });
    },
  });
};
