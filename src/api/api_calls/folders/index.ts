import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import type { GenericResponse } from "@/types/api";

/* =========================
   Types
========================= */
export type CreateFolderPayload = {
  user_id: string;
  name: string;
};

export type UpdateFolderPayload = {
  folder_id: string;
  name: string;
};

/* =========================
   Queries
========================= */
export async function fetchFolders(params: any): Promise<GenericResponse> {
  const { data } = await api.get(apiEndpoints.folders.get(params));
  return data;
}

/* =========================
   Mutations
========================= */
export async function CreateFolder(
  payload: CreateFolderPayload,
): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.folders.create,
    payload,
  );
  return data;
}

export async function UpdateFolder(
  payload: UpdateFolderPayload,
): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.folders.update,
    payload,
  );
  return data;
}

export async function DeleteFolder(
  folder_id: string,
): Promise<GenericResponse> {
  const { data } = await api.delete(
    apiEndpoints.folders.delete(folder_id),
  );
  return data;
}

export async function BulkDeleteFolders(
  folder_ids: string[],
): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.folders.bulkDelete,
    { folder_ids },
  );
  return data;
}

