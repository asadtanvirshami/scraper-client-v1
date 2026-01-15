import axios from "axios";
import qs from "qs";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4000";
  console.log(BASE_URL);
  
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  paramsSerializer: (params) => qs.stringify(params, { encode: false }),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("❌ Network Error:", error.message);
    } else {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.warn("Bad request:", data.message || data);
          break;
        case 401:
          console.warn("Unauthorized — maybe redirect to login?");
          // e.g. clear tokens / redirect
          break;
        case 403:
          console.warn("Forbidden: You don’t have access");
          break;
        case 500:
          console.error(
            "Server error:",
            data.message || "Internal Server Error"
          );
          break;
        default:
          console.error("API error:", status, data);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
