import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "@/types/api";
import { CreateBugPayload, CreateFeedbackPayload } from "@/types/api/bug";

export async function CreateBug(
  input: CreateBugPayload,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.support.bug_create, input);
  return data;
}

export async function CreateFeedback(
  input: CreateFeedbackPayload,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.support.feedback_create, input);
  return data;
}
