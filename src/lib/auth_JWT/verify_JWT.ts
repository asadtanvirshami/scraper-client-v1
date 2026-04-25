import axios from "axios";
import { apiEndpoints } from "./../../api/end-points";
// lib/auth/verifyJWTServer.ts

// Plain axios instance with no client-side interceptors — safe to use server-side.
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4000";

const serverApi = axios.create({
  baseURL: `${BASE_URL}/api`,
});

/**
 * Verify a given JWT server-side
 * @param {string} accessToken - The JWT to be verified
 * @returns {Promise<object>} The response from the server
 * @throws {Error} If the JWT is invalid
 */
export const verifyJWTServer = async (accessToken: string) => {
  const { data } = await serverApi.get(apiEndpoints.auth.verifyJWT, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return data;
};
