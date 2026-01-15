// src/api/error.interceptor.ts
import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

let isRefreshing = false;
let queue: ((token: string) => void)[] = [];

// helper: force AxiosError.message to be your API message
function applyServerMessage(error: AxiosError) {
  const serverMsg =
    (error.response?.data as any)?.message ||
    (error.response?.data as any)?.error ||
    (error.response?.data as any)?.detail;

  if (serverMsg) {
    // ✅ overwrite Axios built-in message:
    error.message = String(serverMsg);
  }
  return error;
}

export function attachErrorInterceptor(api: AxiosInstance) {
  api.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error: AxiosError) => {
      // ✅ Always rewrite error.message first (so your onError can just use error.message)
      applyServerMessage(error);

      const originalRequest: any = error.config;

      // If there is no config, just reject
      if (!originalRequest) {
        return Promise.reject(error);
      }

      // ✅ 401 refresh flow
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // If refresh already in progress, wait in queue
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

      // All other errors: reject with rewritten message
      return Promise.reject(error);
    }
  );
}
