import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "@/types/api";

export type Email = {
  _id: string;
  user_id: string;
  email: string;
  verified: boolean;
  otp: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type FetchEmailsParams = {
  user_id: string;
  page?: number;
  limit?: number;
  subject?: string;
};

export type FetchEmailsResponse = GenericResponse<Email[]>;
export type DeleteEmailResponse = GenericResponse<Email>;
export type BulkDeleteEmailResponse = GenericResponse<{ deletedCount: number }>;

export async function fetchEmails(
  params: FetchEmailsParams,
): Promise<FetchEmailsResponse> {
  const { data } = await api.get(apiEndpoints.emails.get(params));
  return data;
}

export async function deleteEmail(email_id: string): Promise<DeleteEmailResponse> {
  const { data } = await api.delete(apiEndpoints.emails.delete, {
    params: { email_id },
  });
  return data;
}

export async function bulkDeleteEmail(
  email_ids: string[],
): Promise<BulkDeleteEmailResponse> {
  const { data } = await api.post(apiEndpoints.emails.bulkDelete, { email_ids });
  return data;
}

export async function createEmail(params: {
  user_id: string;
  email: string;
}): Promise<GenericResponse<Email>> {
  const { data } = await api.post(apiEndpoints.emails.add, params);
  return data;
}

export async function verifyEmail(params: {
  otp: string;
  email: string;
}): Promise<GenericResponse<Email>> {
  const { data } = await api.post(apiEndpoints.emails.verify, params);
  return data;
}
