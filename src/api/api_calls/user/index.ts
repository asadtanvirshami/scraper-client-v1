import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { getAccessToken } from "@/lib/cookies";
import { GenericResponse } from "@/types/api";
import { UpdateProfilePayload } from "@/types/api/user";

const token = getAccessToken();

export async function UpdateProfile(input: UpdateProfilePayload): Promise<GenericResponse> {
  const { data } = await api.put(apiEndpoints.user.updateMe, input, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}