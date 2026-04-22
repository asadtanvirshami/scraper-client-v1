import type { Lead } from "@/types/leads";

const PROXY_HOST_SUFFIXES = ["fbcdn.net", "instagram.com", "cdninstagram.com"];

const normalizeUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return trimmed;
};

const isHttpUrl = (value: string) => /^https?:\/\//i.test(value);

const shouldProxyAvatarUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return PROXY_HOST_SUFFIXES.some((suffix) => parsed.hostname.endsWith(suffix));
  } catch {
    return false;
  }
};

export const getLeadAvatarSrc = (lead?: Partial<Lead>): string | undefined => {
  const primary = normalizeUrl(lead?.avatar_url);
  const secondary = normalizeUrl(lead?.avatar_rul);
  const candidate = primary || secondary;

  if (!candidate || !isHttpUrl(candidate)) return undefined;

  if (shouldProxyAvatarUrl(candidate)) {
    return `/api/proxy-image?url=${encodeURIComponent(candidate)}`;
  }

  return candidate;
};
