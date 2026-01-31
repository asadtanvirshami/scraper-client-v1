import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "@/types/api";

export type ScrapeInstagramInput = {
  profileUrl: string;
  user_id: string;
  folder_id?: string;
};

export type ScrapeLinkedinInput = {
  profile_url: string;
  user_id: string;
  folder_id?: string;
};

export async function ScrapeInstagram(input: ScrapeInstagramInput): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.scrapper.instagram, input);
  return data;
}

export async function ScrapeLinkedIn(input: ScrapeLinkedinInput): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.scrapper.linkedin, input);
  return data;
}
