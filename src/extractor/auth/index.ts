// Helper to extract error message KEY
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("user-already-verified"))
      return "auth.messages.errors.user_already_verified";

    if(message.includes("user-not-found"))
      return "auth.messages.errors.user_not_found";
    
    if (message.includes("invalid-credentials"))
      return "auth.messages.errors.invalid_email_or_password";

    if (message.includes("user-blocked"))
      return "auth.messages.errors.account_blocked";

    if (message.includes("account-not-verified"))
      return "auth.messages.errors.account_not_verified";

    if (message.includes("user-not-found"))
      return "auth.messages.errors.no_account_found";

    if (message.includes("wrong-password"))
      return "auth.messages.errors.incorrect_password";

    if (message.includes("email-already-exists"))
      return "auth.messages.errors.email_already_exists";

    if(message.includes("invalid-otp"))
      return "auth.messages.errors.invalid_otp";

    if (message.includes("auth/weak-password"))
      return "auth.messages.errors.weak_password_6";

    if (message.includes("auth/too-many-requests"))
      return "auth.messages.errors.too_many_attempts";

    if (message.includes("google-signin-failed"))
      return "auth.messages.errors.google_signin_failed";

    return "auth.messages.errors.unexpected_error";
  }

  return "auth.messages.errors.unexpected_error";
}

// Helper to extract success message KEY
function getSuccessMessage(message: unknown): string {
  if (typeof message === "string") {
    if (message.includes("password-reset-email-sent"))
      return "auth.messages.success.password_reset_email_sent";

    if (message.includes("account-created"))
      return "auth.messages.success.account_created";

    if (message.includes("signed-in-successfully"))
      return "auth.messages.success.signed_in_successfully";

    if (message.includes("signed-out-successfully"))
      return "auth.messages.success.signed_out_successfully";

    if (message.includes("password-updated"))
      return "auth.messages.success.password_updated";

    if (message.includes("google-signin-success"))
      return "auth.messages.success.google_signin_success";

    return "auth.messages.success.operation_successful";
  }

  return "auth.messages.success.operation_successful";
}

export { getErrorMessage, getSuccessMessage };
