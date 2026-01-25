"use client";
import { DownloadAllLeads, type DownloadLeadsParams } from "@/api/api_calls/leads";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreateLead,
  UpdateLead,
  DeleteLead,
  BulkDeleteLeads,
  type CreateLeadPayload,
  type UpdateLeadPayload,
} from "@/api/api_calls/leads";

export const useCreateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["leads", "create"],
    mutationFn: (payload: CreateLeadPayload) => CreateLead(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["leads", "list"] });
      await qc.invalidateQueries({ queryKey: ["leads", "summary"] });
    },
  });
};

export const useUpdateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["leads", "update"],
    mutationFn: (payload: UpdateLeadPayload) => UpdateLead(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["leads", "list"] });
      await qc.invalidateQueries({ queryKey: ["leads", "summary"] });
    },
  });
};

export const useDeleteLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["leads", "delete"],
    mutationFn: (lead_id: string) => DeleteLead(lead_id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["leads", "list"] });
      await qc.invalidateQueries({ queryKey: ["leads", "summary"] });
    },
  });
};

export const useBulkDeleteLeads = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["leads", "bulk-delete"],
    mutationFn: (lead_ids: string[]) => BulkDeleteLeads(lead_ids),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["leads", "list"] });
      await qc.invalidateQueries({ queryKey: ["leads", "summary"] });
    },
  });
};

const triggerBrowserDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const useDownloadAllLeads = () => {
  return useMutation({
    mutationKey: ["leads", "download"],
    mutationFn: async (params: DownloadLeadsParams) => DownloadAllLeads(params),
    onSuccess: (blob, params) => {
      const date = new Date().toISOString().slice(0, 10);
      triggerBrowserDownload(blob, `leads_${date}.csv`);
    },
  });
};
