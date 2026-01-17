import { headers } from "next/headers";
import { apiEndpoints } from "./../../api/end-points";
import api from "@/api/axios";
// lib/auth/verifyJWTServer.ts

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4000";
// console.log(BASE_URL);

/**
 * Verify a given JWT server-side
 * @param {string} accessToken - The JWT to be verified
 * @returns {Promise<object>} The response from the server
 * @throws {Error} If the JWT is invalid
 */
export const verifyJWTServer = async (accessToken: string) => {
   const { data } = await api.get(apiEndpoints.auth.verifyJWT,{
    headers:{
      Authorization: `Bearer ${accessToken}`
    }
   });

  return data
};
