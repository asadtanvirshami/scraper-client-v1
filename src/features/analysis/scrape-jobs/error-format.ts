const HIDDEN_FAILED_REASONS = new Set(["failed-to-analyze"]);

const normalizeReason = (failedReason: string) =>
  failedReason.trim().toLowerCase();

export const isTransientRelationshipFetchError = (failedReason: string | null) => {
  if (!failedReason) return false;

  const normalizedReason = normalizeReason(failedReason);
  return (
    normalizedReason.includes("relationship edges") ||
    normalizedReason.includes("request failed with status code 401")
  );
};

export const formatScrapeJobError = (failedReason: string | null) => {
  if (!failedReason) return null;

  const normalizedReason = normalizeReason(failedReason);
  if (HIDDEN_FAILED_REASONS.has(normalizedReason)) {
    return null;
  }

  if (normalizedReason.includes("no instagram accounts available within rate budget")) {
    return "No accounts are available within the rate budget. Please wait for account cooldown.";
  }

  if (isTransientRelationshipFetchError(failedReason)) {
    return "Temporary service issue. The job has been queued to retry.";
  }

  return failedReason
    .replace(/\[fetcher\]\s*/gi, "")
    .replace(/instagram\s*/gi, "")
    .replace(/graphql\s*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};
