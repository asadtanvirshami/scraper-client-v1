import type { Lead } from "@/types/leads";

const normalizeUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
};

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const isBlockedEmbedHost = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.hostname.includes("fbcdn.net");
  } catch {
    return true;
  }
};

export const getLeadAvatarSrc = (lead?: Partial<Lead>): string | undefined => {
  const primary = normalizeUrl(lead?.avatar_url);
  const secondary = normalizeUrl(lead?.avatar_rul);
  const candidate = primary || secondary;

  if (!candidate || !isHttpUrl(candidate)) return undefined;
  if (isBlockedEmbedHost(candidate)) return undefined;
  return candidate;
};
