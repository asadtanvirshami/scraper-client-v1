"use client"
import Cookies from "js-cookie";

const COOKIE_OPTIONS = {
  expires: 7, // days
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

export const setAuthCookies = ({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken?: string;
}) => {
  Cookies.set("access_token", accessToken, COOKIE_OPTIONS);

  if (refreshToken) {
    Cookies.set("refresh_token", refreshToken, {
      ...COOKIE_OPTIONS,
      expires: 30,
    });
  }
};

export const clearAuthCookies = () => {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
};

export const getAccessToken = () => Cookies.get("access_token");
