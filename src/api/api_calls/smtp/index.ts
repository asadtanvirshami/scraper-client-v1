import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { getAccessToken } from "@/lib/cookies";
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

const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchSmtpAccounts(): Promise<FetchSmtpAccountsResponse> {
  const { data } = await api.get(apiEndpoints.smtp.list, {
    headers: authHeaders(),
  });
  return data;
}

export async function fetchSmtpAccount(
  accountId: string,
): Promise<FetchSmtpAccountResponse> {
  const { data } = await api.get(apiEndpoints.smtp.getOne(accountId), {
    headers: authHeaders(),
  });
  return data;
}

export async function createSmtpAccount(
  payload: CreateSmtpAccountPayload,
): Promise<CreateSmtpAccountResponse> {
  const { data } = await api.post(apiEndpoints.smtp.create, payload, {
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
  });
  return data;
}

export async function updateSmtpAccount(
  accountId: string,
  payload: UpdateSmtpAccountPayload,
): Promise<UpdateSmtpAccountResponse> {
  const { data } = await api.patch(
    apiEndpoints.smtp.update(accountId),
    payload,
    {
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
    },
  );
  return data;
}

export async function deleteSmtpAccount(
  accountId: string,
): Promise<DeleteSmtpAccountResponse> {
  const { data } = await api.delete(apiEndpoints.smtp.delete(accountId), {
    headers: authHeaders(),
  });
  return data;
}

export async function testSmtpAccount(
  accountId: string,
): Promise<TestSmtpAccountResponse> {
  const { data } = await api.post(
    apiEndpoints.smtp.test(accountId),
    {},
    {
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
    },
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
