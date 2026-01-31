import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "@/types/api";
import { getAccessToken } from "@/lib/cookies";

const token = getAccessToken();

export async function fetchDashboard(params: any): Promise<GenericResponse> {
  const { data } = await api.get(apiEndpoints.dashboard.get(params), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

