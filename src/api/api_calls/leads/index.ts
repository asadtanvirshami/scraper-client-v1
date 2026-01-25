import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import type {
  GenericResponse,
  Lead,
  LeadsListParams,
  LeadsSummaryParams,
} from "@/types/leads";

export type DownloadLeadsParams = {
  user_id: string;
  search?: string;
  type?: "INSTAGRAM" | "LINKEDIN" | "MANUAL" | "";
  folder_id?: string;
  is_converted?: boolean;
};

// ✅ downloads CSV as blob
export async function DownloadAllLeads(
  input: DownloadLeadsParams,
): Promise<Blob> {
  const res = await api.get(apiEndpoints.leads.download(input), {
    responseType: "blob",
  });
  return res.data;
}

// ✅ LIST
export async function FetchAllLeadsList(
  input: LeadsListParams,
): Promise<GenericResponse<Lead[]>> {
  const { data } = await api.get(apiEndpoints.leads.list(input as any));
  return data;
}

// ✅ SUMMARY
export async function FetchAllLeadsSummary(
  input: LeadsSummaryParams,
): Promise<GenericResponse<any>> {
  const { data } = await api.get(apiEndpoints.leads.summary(input as any));
  return data;
}

// ✅ CREATE
export type CreateLeadPayload = {
  first_name: string;
  last_name: string;
  emails: string[];
  phones: string[];
  company?: string | null;
  job_title?: string | null;
  message?: string | null;
  folder_id?: string | null;
  user_id: string;
  type: "INSTAGRAM" | "LINKEDIN" | "MANUAL";
  is_converted?: boolean;
};

export async function CreateLead(
  payload: CreateLeadPayload,
): Promise<GenericResponse<Lead>> {
  const { data } = await api.post(apiEndpoints.leads.create, payload);
  return data;
}

// ✅ UPDATE (your backend expects lead_id in payload)
export type UpdateLeadPayload = Partial<Omit<CreateLeadPayload, "user_id">> & {
  lead_id: string;
};

export async function UpdateLead(
  payload: UpdateLeadPayload,
): Promise<GenericResponse<Lead>> {
  const { data } = await api.post(apiEndpoints.leads.update, payload);
  return data;
}

// ✅ DELETE ONE (your backend expects lead_id)
export async function DeleteLead(
  lead_id: string,
): Promise<GenericResponse<Lead>> {
  // safest: send lead_id as query param
  const { data } = await api.delete(apiEndpoints.leads.delete, {
    params: { lead_id },
  });
  return data;
}

// ✅ BULK DELETE (your backend expects lead_ids)
export async function BulkDeleteLeads(
  lead_ids: string[],
): Promise<GenericResponse<any>> {
  const { data } = await api.de(apiEndpoints.leads.bulk_delete, { lead_ids });
  return data;
}
