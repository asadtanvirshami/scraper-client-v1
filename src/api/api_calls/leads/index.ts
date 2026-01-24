import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "../type";

export async function FetchAllLeads(input: {}): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.auth.verifyOtp, input);
  return data;
}
