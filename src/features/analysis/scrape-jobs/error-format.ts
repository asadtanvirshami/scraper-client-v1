const HIDDEN_FAILED_REASONS = new Set(["failed-to-analyze"]);

const normalizeReason = (failedReason: string) =>
  failedReason.trim().toLowerCase();

const TRANSIENT_RELATIONSHIP_ERRORS = [
  "relationship edges",
  "request failed with status code 401",
  "instagram-apify-job-concurrency-limit",
  "proxy-request-budget-exhausted",
  "instagram-pipeline-timeout",
];

export const isTransientRelationshipFetchError = (failedReason: string | null) => {
  if (!failedReason) return false;

  const normalizedReason = normalizeReason(failedReason);
  return TRANSIENT_RELATIONSHIP_ERRORS.some((reason) =>
    normalizedReason.includes(reason),
  );
};

export const formatScrapeJobError = (failedReason: string | null) => {
  if (!failedReason) return null;

  const normalizedReason = normalizeReason(failedReason);
  if (HIDDEN_FAILED_REASONS.has(normalizedReason)) {
    return null;
  }

  if (
    normalizedReason.includes("no instagram accounts available within rate budget") ||
    normalizedReason.includes("over the hourly request budget") ||
    normalizedReason.includes("cooling down")
  ) {
    return "Pausing briefly to stay within safe limits — this will resume automatically.";
  }

  if (isTransientRelationshipFetchError(failedReason)) {
    return "Taking a short break — the job will continue automatically.";
  }

  // Soften any remaining raw message: drop internal/technical prefixes and
  // alarming words so the UI never shows a blunt "error/failed/exception".
  const cleaned = failedReason
    .replace(/\[fetcher\]\s*/gi, "")
    .replace(/instagram\s*/gi, "")
    .replace(/graphql\s*/gi, "")
    .replace(/\b(error|errored|failure|failed|exception|fatal|crash(ed)?)\b/gi, "interrupted")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Always frame it as a recoverable interruption the user can retry.
  return cleaned
    ? `Run interrupted — you can retry. (${cleaned})`
    : "Run interrupted — you can retry.";
};
