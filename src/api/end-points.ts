import { withPagination } from "@/helpers/query-helper";

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

  support: {
    bug_create: "/bug/create",
    feedback_create: "/feedback/create",
  },

  user: {
    // self
    getMe: "/user/me",
    updateMe: "/user/me",
    deleteMe: "/user/me",
    uploadAvatar: "/user/avatar",

    // admin
    getAll: "/user/all",
    getById: (userId: string) => `/user/${userId}`,
    deleteById: (userId: string) => `/user/${userId}`,
    block: (userId: string) => `/user/block/${userId}`,
  },

  leads: {
    create: "/lead/create",
    update: `/lead/update`,
    delete: `/lead/delete`,
    bulk_delete: `/lead/bulk-delete`,
    list: (params: {
      offset?: number;
      limit?: number;
      search?: string;
      type?: "INSTAGRAM" | "LINKEDIN" | "MANUAL";
      folder_id?: string;
      is_converted?: boolean;
    }) => withPagination("/lead/get", params),

    summary: (params?: {
      days?: number;
      type?: "INSTAGRAM" | "LINKEDIN" | "MANUAL";
      folder_id?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => withPagination("/lead/summary", params || {}),

    download: (params: {
      user_id: string;
      search?: string;
      type?: "INSTAGRAM" | "LINKEDIN" | "MANUAL" | "";
      folder_id?: string;
      is_converted?: boolean;
    }) => withPagination("/lead/download", params),
  },

  notifications: {
    // USER
    get: (params: { offset?: number; limit?: number }) =>
      withPagination("/notification", params),

    markAllRead: "/notification/read-all",
    markOneRead: (notificationId: string) =>
      `/notification/read/${notificationId}`,
    deleteAll: "/notification/all",
    deleteOne: (notificationId: string) => `/notification/${notificationId}`,
    bulkDelete: "/notification/bulk-delete",

    // ADMIN
    getAllAdmin: (params: { offset?: number; limit?: number }) =>
      withPagination("/notification/admin/all", params),

    create: "/notification",
    bulkCreate: "/notification/bulk",
  },
};
