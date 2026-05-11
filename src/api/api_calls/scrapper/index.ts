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

export type ScrapeFollowersInput = {
  user_id: string;
  folder_id: string;
  username: string;
  type: "followers" | "following";
  max_limit?: number;
};

export async function ScrapeInstagram(
  input: ScrapeInstagramInput,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.scrapper.instagram, input);
  return data;
}

export async function ScrapeLinkedIn(
  input: ScrapeLinkedinInput,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.scrapper.linkedin, input);
  return data;
}

export async function ScrapeFollowersOrFollowing(
  input: ScrapeFollowersInput,
): Promise<GenericResponse> {
  const payload = {
    user_id: input.user_id,
    folder_id: input.folder_id,
    targetUsername: input.username,
    withGraphQl: true,
    type: input.type,
    // maxLimit intentionally omitted — backend uses the real profile totalCount
  };

  const { data } = await api.post(
    apiEndpoints.scrapper.scrapeFollowers,
    payload,
  );
  return data;
}

export async function ListScrapeFollowersJobs(params?: {
  page?: number;
  limit?: number;
}): Promise<GenericResponse> {
  const { data } = await api.get(apiEndpoints.scrapper.scrapeFollowersjobs(params));
  return data;
}

export async function GetScrapeFollowersJobStatus(
  jobId: string,
): Promise<GenericResponse> {
  const { data } = await api.get(apiEndpoints.scrapper.scrapeFollowersJob(jobId));
  return data;
}

export async function PauseScrapeFollowersJob(
  jobId: string,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.scrapper.pauseScrapeFollowersJob(jobId));
  return data;
}

export async function ResumeScrapeFollowersJob(
  jobId: string,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.scrapper.resumeScrapeFollowersJob(jobId));
  return data;
}

export async function DeleteScrapeFollowersJob(
  jobId: string,
): Promise<GenericResponse> {
  const { data } = await api.delete(apiEndpoints.scrapper.deleteScrapeFollowersJob(jobId));
  return data;
}
