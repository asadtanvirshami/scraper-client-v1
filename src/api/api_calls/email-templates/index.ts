import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import type {
  FetchTemplatesResponse,
  FetchTemplateResponse,
  CreateTemplateResponse,
  UpdateTemplateResponse,
  DeleteTemplateResponse,
  CreateTemplatePayload,
  UpdateTemplatePayload,
} from "@/types/api/email-template";

export async function fetchEmailTemplates(params: {
  user_id: string;
  page?: number;
  limit?: number;
}): Promise<FetchTemplatesResponse> {
  const { data } = await api.get(apiEndpoints.emailTemplates.get(params));
  return data;
}

export async function fetchEmailTemplate(
  template_id: string,
  user_id: string
): Promise<FetchTemplateResponse> {
  const { data } = await api.get(
    apiEndpoints.emailTemplates.getOne(template_id, user_id)
  );
  return data;
}

export async function createEmailTemplate(
  payload: CreateTemplatePayload
): Promise<CreateTemplateResponse> {
  const { data } = await api.post(apiEndpoints.emailTemplates.create, payload);
  return data;
}

export async function updateEmailTemplate(
  payload: UpdateTemplatePayload
): Promise<UpdateTemplateResponse> {
  const { data } = await api.put(apiEndpoints.emailTemplates.update, payload);
  return data;
}

export async function deleteEmailTemplate(
  template_id: string,
  user_id: string
): Promise<DeleteTemplateResponse> {
  const { data } = await api.delete(
    apiEndpoints.emailTemplates.delete(template_id, user_id)
  );
  return data;
}
