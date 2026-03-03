import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "@/types/api";
import {
  CreateBugPayload,
  CreateFeedbackPayload,
  UpdateBugPayload,
} from "@/types/api/bug";

export async function CreateBug(
  input: CreateBugPayload,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.support.bug_create, input);
  return data;
}

export async function UpdateBug(
  id: string,
  input: UpdateBugPayload,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.support.bug_update, {
    bug_id: id,
    ...input,
  });
  return data;
}

export async function DeleteBug(id: string): Promise<GenericResponse> {
  const { data } = await api.delete(apiEndpoints.support.bug_delete(id));
  return data;
}

export async function CreateFeedback(
  input: CreateFeedbackPayload,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.support.feedback_create, input);
  return data;
}

export async function UpdateFeedback(
  id: string,
  input: Partial<CreateFeedbackPayload>,
): Promise<GenericResponse> {
  const { data } = await api.put(
    apiEndpoints.support.feedback_update(id),
    input,
  );
  return data;
}

export async function DeleteFeedback(id: string): Promise<GenericResponse> {
  const { data } = await api.delete(apiEndpoints.support.feedback_delete(id));
  return data;
}

export async function GetFeedbacks(params: {
  offset?: number;
  limit?: number;
  search?: string;
  user_id?: string;
}): Promise<GenericResponse> {
  const { data } = await api.get(apiEndpoints.support.feedback_list(params));
  return data;
}

export async function GetBugs(params: {
  offset?: number;
  limit?: number;
  search?: string;
  user_id?: string;
}): Promise<GenericResponse> {
  const { data } = await api.get(apiEndpoints.support.bugs_list(params));
  return data;
}
