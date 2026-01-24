import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "../type";
import { getAccessToken } from "@/lib/cookies";

const token = getAccessToken();

export async function fetchDashboard(): Promise<GenericResponse> {
  const { data } = await api.get(apiEndpoints.dashboard.get, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}
