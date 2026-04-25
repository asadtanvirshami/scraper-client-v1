import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "@/types/api";

export async function fetchDashboard(params: any): Promise<GenericResponse> {
  const { data } = await api.get(apiEndpoints.dashboard.get(params));
  return data;
}

