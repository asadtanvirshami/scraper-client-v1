// Helper to extract error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Firebase error codes
    const message = error.message;
    if (message.includes("invalid-credentials"))
      return "Invalid email address or password";
    if (message.includes("user-blocked"))
      return "This account has been blocked";
    if (message.includes("user-disabled"))
      return "This account has been disabled";
    if (message.includes("user-not-found"))
      return "No account found with this email";
    if (message.includes("wrong-password")) return "Incorrect password";
    if (message.includes("auth/email-already-in-use"))
      return "An account with this email already exists";
    if (message.includes("auth/weak-password"))
      return "Password should be at least 6 characters";
    if (message.includes("auth/too-many-requests"))
      return "Too many attempts. Please try again later";
    if (message.includes("google-signin-failed"))
      return "Google sign-in failed. Please try again.";
    return message;
  }
  return "An unexpected error occurred";
}

function getSuccessMessage(message: unknown): string {
  if (typeof message === "string") {
    if (message.includes("password-reset-email-sent"))
      return "Password reset email sent";
    if (message.includes("account-created"))
      return "Account created successfully";
    if (message.includes("signed-in-successfully"))
      return "Signed in successfully";
    if (message.includes("signed-out-successfully"))
      return "Signed out successfully";
    if (message.includes("password-updated"))
      return "Password updated successfully";
    if (message.includes("google-signin-success"))
      return "Signed in with Google successfully";
    return message;
  }
  return "Operation successful";
}

export { getErrorMessage, getSuccessMessage };

