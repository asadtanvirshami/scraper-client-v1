type QueryParams = Record<string, string | number | boolean | undefined | null>;

function buildQuery(params: QueryParams = {}) {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");

  return query ? `?${query}` : "";
}

export function withPagination(
  base: string,
  params: { offset?: number; limit?: number; page?: number } & QueryParams = {},
) {
  // ✅ HARD FAIL to reveal the real caller
  if (base === "/notification" && (params == null || Object.keys(params).length === 0)) {
    throw new Error(`[withPagination] EMPTY params for ${base}`);
  }

  const { offset, limit, page, ...rest } = params;

  return `${base}${buildQuery({
    ...(typeof offset === "number" ? { offset } : {}),
    ...(typeof limit === "number" ? { limit } : {}),
    ...(typeof page === "number" ? { page } : {}),
    ...rest,
  })}`;
}
