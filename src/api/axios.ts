import axios from "axios";
import qs from "qs";
import { attachAuthInterceptor } from "./auth-interceptor";
import { attachErrorInterceptor } from "./error-interceptor";

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

attachAuthInterceptor(api);
attachErrorInterceptor(api);

export default api;
