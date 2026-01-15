// src/api/auth.interceptor.ts
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
export function attachAuthInterceptor(api: AxiosInstance) {
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = null
    if (token) {
      // Axios v1: headers may be AxiosHeaders (has .set) OR a plain object
      if (typeof (config.headers as any)?.set === "function") {
        (config.headers as any).set("Authorization", `Bearer ${token}`);
      } else {
        config.headers = config.headers ?? ({} as any);
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }

    return config;
  });
}