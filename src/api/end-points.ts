function withPagination(base: string, offset: number, limit: number) {
  return `${base}?offset=${offset}&limit=${limit}`;
}

export const apiEndpoints = {
  auth: {
    signin: "/auth/login",
    google: "/auth/google-login",
    logout: "/auth/logout",
    signup: "/auth/register",
    verifyOtp: "/auth/verify-otp",
    resendOtp: "/auth/resend-otp",
    reset_password: "/auth/reset-password-with-otp",
    change_password: "/auth/change-password",
    forgot_password: "/auth/send-password-reset-otp",
    verifyJWT: "/auth/verification",
  },
  dashboard: {
    get: "/dashboard",
  },
  user: {
    get: "/user/me",
    update: "/user/me",
    delete: "/user/me",
    upload_avatar: "/user/avatar",
  },
  leads: {
    get: (offset: number, limit: number) =>
      withPagination("/leads", offset, limit),
  },
  notifications: {
    // USER
    get: (offset: number, limit: number) =>
      withPagination("/notification", offset, limit),
    markAllRead: "/notification/read-all",
    markOneRead: (notificationId: string) =>
      `/notification/read/${notificationId}`,
    deleteAll: "/notification/all",
    deleteOne: (notificationId: string) => `/notification/${notificationId}`,
    bulkDelete: "/notification/bulk-delete",
    // ADMIN / SYSTEM
    getAllAdmin: (offset: number, limit: number) =>
      withPagination("/notification/admin/all", offset, limit),
    create: "/notification",
    bulkCreate: "/notification/bulk",
  },
};
