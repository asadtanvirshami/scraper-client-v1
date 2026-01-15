function withPagination(base: string, offset: number, limit: number) {
  return `${base}&offset=${offset}&limit=${limit}`;
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
    verify: "/auth/verification",
  },
};
