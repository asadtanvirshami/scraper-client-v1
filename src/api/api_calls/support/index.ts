import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "../type";

export type CreateBugPayload = {
  user_id: string;
  bug: string;
};

export type CreateFeedbackPayload = {
  user_id: string;
  feedback: string;
};

export async function CreateBug(input: CreateBugPayload): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.support.bug_create, input);
  return data;
}

export async function CreateFeedback(
  input: CreateFeedbackPayload,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.support.feedback_create, input);
  return data;
}