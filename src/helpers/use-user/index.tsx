"use client";

import { useAppSelector } from "@/redux/hook";

const useUserInfo = () => {
  const user = useAppSelector((state) => state?.user?.user);
  if (!user) return {};
  return {
    user: user,
    id: user?._id,
    firstName: user?.first_name,
    lastName: user?.last_name,
    plan: user?.plan,
    email: user?.email,
    avatar_url: user?.avatar_url,
    role: user?.role,
    blocked: user?.blocked,
    is_verified: user?.is_verified,
  };
};

export { useUserInfo };
