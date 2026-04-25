import { withPagination } from "@/helpers/query-helper";

export const apiEndpoints = {
  auth: {
    signin: "/auth/login",
    google: "/auth/google-signin",
    logout: "/auth/logout",
    signup: "/auth/register",
    verifyOtp: "/auth/verify-otp",
    resendOtp: "/auth/resend-otp",
    reset_password: "/auth/reset-password-with-otp",
    change_password: "/auth/change-password",
    forgot_password: "/auth/send-password-reset-otp",
    verifyJWT: "/auth/verification",
  },

  scrapper: {
    instagram: "/scrapper/scrap-instagram",
    linkedin: "/scrapper/scrap-linkedin",
    scrapeFollowers: "/beta-insta/scrape-followers",
    // callback is server-to-server, frontend doesn't call it
  },

  dashboard: {
    get: (params?: { days?: number; dateFrom?: string; dateTo?: string }) =>
      withPagination("/dashboard", params ?? {}),
  },

  support: {
    bug_create: "/bug/create",
    bug_update: "/bug/update",
    bug_delete: (id: string) => `/bug/delete/${id}`,
    bugs_list: (params: {
      offset?: number;
      limit?: number;
      search?: string;
      user_id?: string;
    }) => withPagination("/bug/get", params),

    feedback_create: "/feedback/create",
    feedback_update: (id: string) => `/feedback/update/${id}`,
    feedback_delete: (id: string) => `/feedback/delete/${id}`,
    feedback_list: (params: {
      offset?: number; // 1-based
      limit?: number;
      search?: string;
      user_id?: string;
    }) => withPagination("/feedback/get", params),
  },

  user: {
    // self
    getMe: "/user/me",
    updateMe: "/user/me",
    deleteMe: "/user/me",
    uploadAvatar: "/user/avatar",
    updateOnboarding: "/user/onboarding",

    // user
    getAllUser: (params: {
      offset?: number; // 1-based
      limit?: number;
      search?: string;
      role?: "USER" | "ADMIN";
      is_blocked?: boolean;
      is_verified?: boolean;
      sortBy?: string; // created | updated_at
      sortOrder?: "asc" | "desc";
    }) => withPagination("/user/all", params),

    getByIdUser: (userId: string) => `/user/${userId}`,
    deleteByIdUser: (userId: string) => `/user/${userId}`,
    blockUser: (userId: string) => `/user/block/${userId}`,
    bulkDeleteUsers: "/user/bulk-delete",

    // admin
    getAll: (params: {
      offset?: number; // 1-based
      limit?: number;
      search?: string;
      role?: "USER" | "ADMIN";
      is_blocked?: boolean;
      is_verified?: boolean;
      sortBy?: string; // created | updated_at
      sortOrder?: "asc" | "desc";
    }) => withPagination("/user/all", params),
    getById: (userId: string) => `/user/${userId}`,
    deleteById: (userId: string) => `/user/${userId}`,
    block: (userId: string) => `/user/block/${userId}`,
  },

  leads: {
    create: "/lead/create",
    update: `/lead/update`,
    delete: `/lead/delete`,
    bulk_delete: `/lead/bulk-delete`,
    bulk_upload: `/lead/bulk-upload`,
    bulk_update_scraped: `/lead/bulk-update-scraped`,
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

  folders: {
    create: "/folder/create",
    update: `/folder/update`,
    delete: (id: string) => `/folder/delete/${id}`,
    bulkDelete: `/folder/bulk-delete`,
    get: (params: { offset?: number; limit?: number }) =>
      withPagination("/folder/get", params),
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

  emails: {
    get: (params: {
      user_id: string;
      page?: number;
      limit?: number;
      subject?: string;
    }) => withPagination("/email/get", params),
    add: "/email/add",
    verify: "/email/verify",
    delete: "/email/delete",
    bulkDelete: "/email/bulk-delete",
    update: "/email/update",
  },

  smtp: {
    list: "/smtp/accounts",
    getOne: (id: string) => `/smtp/accounts/${id}`,
    create: "/smtp/accounts",
    update: (id: string) => `/smtp/accounts/${id}`,
    delete: (id: string) => `/smtp/accounts/${id}`,
    test: (id: string) => `/smtp/accounts/${id}/test`,
    send: (id: string) => `/smtp/accounts/${id}/send`,
  },

  /* ================= CAMPAIGNS ================= */

  campaigns: {
    base: "/campaign",

    get: (params?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    }) => withPagination("/campaign/get", params),

    getOne: (campaign_id: string, user_id?: string) =>
      withPagination(`/campaign/get-by-id`, { campaign_id, user_id }),

    create: "/campaign/create",
    update: "/campaign/update",
    delete: "/campaign/delete",

    schedule: (id: string) => `/campaign/schedule/${id}`,
    send: "/campaign/send",

    stats: "/campaign/stats",
    analytics: (id: string) => `/campaign/analytics/${id}`,
  },
  /* ================= BILLING / STRIPE ================= */

  billing: {
    plans: "/billing/plans",
    subscription: "/billing/subscription",
    checkout: "/billing/checkout",
    portal: "/billing/portal",
    cancel: "/billing/cancel",
    changePlan: "/billing/change-plan",
    freeTrial: "/billing/free-trial",
    syncSession: "/billing/sync-session",
  },

  /* ================= EMAIL TEMPLATES ================= */

  emailTemplates: {
    get: (params: { user_id: string; page?: number; limit?: number }) =>
      withPagination("/email-template/get", params),
    getOne: (template_id: string, user_id: string) =>
      `/email-template/get-by-id?template_id=${template_id}&user_id=${user_id}`,
    create: "/email-template/create",
    update: "/email-template/update",
    delete: (template_id: string, user_id: string) =>
      `/email-template/delete?template_id=${template_id}&user_id=${user_id}`,
  },
};
