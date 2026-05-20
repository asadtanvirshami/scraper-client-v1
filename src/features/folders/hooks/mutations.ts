"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  CreateFolder,
  UpdateFolder,
  DeleteFolder,
  BulkDeleteFolders,
  CreateFolderPayload,
  UpdateFolderPayload,
  BulkDeleteFoldersPayload,
} from "@/api/api_calls/folders";

/* =========================
   Create Folder
========================= */
export const useCreateFolder = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["folders", "create"],
    mutationFn: (payload: CreateFolderPayload) => CreateFolder(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["folders", "list"] });
    },
  });
};

/* =========================
   Update Folder
========================= */
export const useUpdateFolder = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["folders", "update"],
    mutationFn: (payload: UpdateFolderPayload) => UpdateFolder(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["folders", "list"] });
    },
  });
};

/* =========================
   Delete Single Folder
========================= */
export const useDeleteFolder = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["folders", "delete"],
    mutationFn: (folder_id: string) => DeleteFolder(folder_id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["folders", "list"] });
    },
  });
};

/* =========================
   Bulk Delete Folders
========================= */
export const useBulkDeleteFolders = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationKey: ["folders", "bulk-delete"],
    mutationFn: (input: string[] | BulkDeleteFoldersPayload) =>
      BulkDeleteFolders(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["folders", "list"] });
      await qc.invalidateQueries({ queryKey: ["leads", "list"] });
      await qc.invalidateQueries({ queryKey: ["leads", "summary"] });
    },
  });
};
