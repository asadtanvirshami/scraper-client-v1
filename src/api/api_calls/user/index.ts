import api from "@/api/axios";
import { GenericResponse } from "../type";
import { apiEndpoints } from "@/api/end-points";
import { getAccessToken } from "@/lib/cookies";

const token = getAccessToken();

export async function UpdateProfile(input: UpdateProfilePayload): Promise<GenericResponse> {
  const { data } = await api.put(apiEndpoints.user.update, input, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}