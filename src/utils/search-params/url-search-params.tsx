// utils/searchParams.ts
export function getSearchParams<T extends Record<string, string | number>>(
  searchParams: URLSearchParams | Partial<Record<keyof T, string | number>>,
  defaults: T
): T {
  const params: Partial<T> = { ...defaults };

  (Object.keys(defaults) as Array<keyof T>).forEach((key) => {
    const value =
      searchParams instanceof URLSearchParams
        ? searchParams.get(key as string)
        : searchParams[key];

    if (value !== null && value !== undefined) {
      // Convert to number if default is number
      params[key] =
        typeof defaults[key] === "number"
          ? (Number(value) as T[typeof key])
          : (value as T[typeof key]);
    }
  });

  return params as T;
}
