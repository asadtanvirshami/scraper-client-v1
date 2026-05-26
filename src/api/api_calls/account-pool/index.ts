import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "@/types/api";

export type PoolAccount = {
  _id: string;
  username: string;
  instagramUserId: string;
  displayName: string;
  status: "active" | "inactive" | "rate_limited" | "suspended" | "error";
  isAvailable: boolean;
  priority: number;
  proxyUrl: string | null;
  notes: string;
  consecutiveFailures: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastUsedAt: string | null;
  lastSuccessAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AddAccountPayload = {
  cookies: string; // raw JSON string pasted by admin
  displayName?: string;
  notes?: string;
};

export type UpdateAccountPayload = {
  displayName?: string;
  priority?: number;
  status?: string;
  isAvailable?: boolean;
  proxyUrl?: string;
  notes?: string;
};

export async function AdminListPoolAccounts(): Promise<GenericResponse> {
  const { data } = await api.get(apiEndpoints.adminAccountPool.list);
  return data;
}

export async function AdminAddPoolAccount(
  payload: AddAccountPayload,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.adminAccountPool.add, payload);
  return data;
}

export async function AdminUpdatePoolAccount(
  id: string,
  payload: UpdateAccountPayload,
): Promise<GenericResponse> {
  const { data } = await api.patch(
    apiEndpoints.adminAccountPool.update(id),
    payload,
  );
  return data;
}

export async function AdminUpdatePoolCookies(
  id: string,
  cookies: string,
): Promise<GenericResponse> {
  const { data } = await api.put(
    apiEndpoints.adminAccountPool.updateCookies(id),
    { cookies },
  );
  return data;
}

export async function AdminResetPoolAccount(
  id: string,
): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.adminAccountPool.reset(id),
  );
  return data;
}

export async function AdminDeletePoolAccount(
  id: string,
): Promise<GenericResponse> {
  const { data } = await api.delete(
    apiEndpoints.adminAccountPool.delete(id),
  );
  return data;
}
