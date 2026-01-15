import { Register } from "@/api/api_calls/auth";
import { GenericResponse } from "@/api/api_calls/type";
import api from "@/api/axios";
import { useMutation } from "@tanstack/react-query";

export function useSignUp() {
  return useMutation({
    mutationKey: ["sign-up"],
    mutationFn: async (input: any) => await Register(input), // Use async/await to wrap the promise
    onSuccess: (data) => {
      return data;
    },
  });
}
