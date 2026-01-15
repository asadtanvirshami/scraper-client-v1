// src/api/error.interceptor.ts
import { AxiosError, AxiosInstance, AxiosResponse } from "axios";

let isRefreshing = false;
let queue: ((token: string) => void)[] = [];

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

    async (error: AxiosError) => {
      // 🔹 Normalize message FIRST
      applyServerMessage(error);

      const originalRequest: any = error.config;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      // 🔹 401 refresh logic (unchanged)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            queue.push((token: string) => {
              try {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(api(originalRequest));
              } catch (e) {
                reject(e);
              }
            });
          });
        }

        isRefreshing = true;
      }

      return Promise.reject(error);
    }
  );
}
