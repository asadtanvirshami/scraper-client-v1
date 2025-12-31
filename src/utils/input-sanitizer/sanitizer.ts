// Use this in Next.js so SSR works too:
import DOMPurify from "isomorphic-dompurify";

// JSON-like value types
type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];

/**
 * Public API – keeps caller's type T but delegates recursion to a non-generic.
 */
export function sanitizeDeep<T extends JsonValue>(input: T): T {
  return sanitizeDeepValue(input) as T;
}

/**
 * Internal recursive sanitizer that only deals with JsonValue (no generics),
 * so property access stays correctly typed.
 */
function sanitizeDeepValue(value: JsonValue): JsonValue {
  if (typeof value === "string") {
    return DOMPurify.sanitize(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeDeepValue);
  }

  if (value !== null && typeof value === "object") {
    const obj = value as JsonObject;
    const out: JsonObject = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = sanitizeDeepValue(v);
    }
    return out;
  }

  // number | boolean | null
  return value;
}

/**
 * Sanitizes all strings in a flat object (Record<string, string>).
 * Uses a mapped type so keys/values are preserved precisely.
 */
export const sanitizeFlatStrings = <T extends Record<string, string>>(
  input: T
): { [K in keyof T]: string } => {
  const clean = {} as { [K in keyof T]: string };
  for (const k of Object.keys(input) as Array<keyof T>) {
    clean[k] = DOMPurify.sanitize(input[k]);
  }
  return clean;
};
