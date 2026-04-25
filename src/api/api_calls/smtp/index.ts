import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import {
  CreateSmtpAccountPayload,
  CreateSmtpAccountResponse,
  DeleteSmtpAccountResponse,
  FetchSmtpAccountResponse,
  FetchSmtpAccountsResponse,
  SmtpAccount,
  TestSmtpAccountResponse,
  UpdateSmtpAccountPayload,
  UpdateSmtpAccountResponse,
} from "@/types/api/smtp";

export async function fetchSmtpAccounts(): Promise<FetchSmtpAccountsResponse> {
  const { data } = await api.get(apiEndpoints.smtp.list);
  return data;
}

export async function fetchSmtpAccount(
  accountId: string,
): Promise<FetchSmtpAccountResponse> {
  const { data } = await api.get(apiEndpoints.smtp.getOne(accountId));
  return data;
}

export async function createSmtpAccount(
  payload: CreateSmtpAccountPayload,
): Promise<CreateSmtpAccountResponse> {
  const { data } = await api.post(apiEndpoints.smtp.create, payload);
  return data;
}

export async function updateSmtpAccount(
  accountId: string,
  payload: UpdateSmtpAccountPayload,
): Promise<UpdateSmtpAccountResponse> {
  const { data } = await api.patch(
    apiEndpoints.smtp.update(accountId),
    payload,
  );
  return data;
}

export async function deleteSmtpAccount(
  accountId: string,
): Promise<DeleteSmtpAccountResponse> {
  const { data } = await api.delete(apiEndpoints.smtp.delete(accountId));
  return data;
}

export async function testSmtpAccount(
  accountId: string,
): Promise<TestSmtpAccountResponse> {
  const { data } = await api.post(
    apiEndpoints.smtp.test(accountId),
    {},
  );
  return data;
}

export type {
  SmtpAccount,
  CreateSmtpAccountPayload,
  UpdateSmtpAccountPayload,
  FetchSmtpAccountsResponse,
  FetchSmtpAccountResponse,
  CreateSmtpAccountResponse,
  UpdateSmtpAccountResponse,
  DeleteSmtpAccountResponse,
  TestSmtpAccountResponse,
};
