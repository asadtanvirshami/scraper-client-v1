// src/api/error.interceptor.ts
import { AxiosError, AxiosInstance, AxiosResponse } from "axios";

// Extract server error message into AxiosError.message
function applyServerMessage(error: AxiosError) {
  const data = error.response?.data as any;

  const serverMsg =
    data?.message ||
    data?.error ||
    data?.detail ||
    data?.code; // ← include backend error codes if present

  if (serverMsg) {
    error.message = String(serverMsg);
  }

  return error;
}

export function attachErrorInterceptor(api: AxiosInstance) {
  api.interceptors.response.use(
    (res: AxiosResponse) => res,

    (error: AxiosError) => {
      applyServerMessage(error);
      return Promise.reject(error);
    }
  );
}
