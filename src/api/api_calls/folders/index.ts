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

export type BulkDeleteFoldersPayload = {
  folder_ids: string[];
  move_to_folder_id?: string;
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
  move_to_folder_id?: string,
): Promise<GenericResponse> {
  const { data } = await api.delete(apiEndpoints.folders.delete(folder_id), {
    data: move_to_folder_id ? { move_to_folder_id } : undefined,
  });
  return data;
}

export async function BulkDeleteFolders(
  input: string[] | BulkDeleteFoldersPayload,
): Promise<GenericResponse> {
  const payload = Array.isArray(input) ? { folder_ids: input } : input;
  const { data } = await api.post(
    apiEndpoints.folders.bulkDelete,
    payload,
  );
  return data;
}

