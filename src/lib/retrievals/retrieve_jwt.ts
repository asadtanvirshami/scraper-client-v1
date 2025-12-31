// lib/retrieve_jwt.ts

import Cookies from "js-cookie";

export const getJWTToken = () => {
  return Cookies.get("accessToken") || "";
};
