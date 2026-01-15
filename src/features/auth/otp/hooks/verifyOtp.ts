import { VerifyOTP } from "@/api/api_calls/auth";
import { useMutation } from "@tanstack/react-query";

export function useVerifyOtp() {
  return useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: async (input: any) => await VerifyOTP(input), // Use async/await to wrap the promise
    onSuccess: (data) => {
      return data;
    },
  });
}
