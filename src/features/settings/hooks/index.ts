import { GenericResponse } from "@/api/api_calls/type";
import { UpdateProfile } from "@/api/api_calls/user";
import { useMutation } from "@tanstack/react-query";

import { CreateBug, CreateFeedback, CreateBugPayload, CreateFeedbackPayload } from "@/api/api_calls/support";

export const useUpdateProfile = () =>
  useMutation<GenericResponse, Error, UpdateProfilePayload>({
    mutationKey: ["user", "updateProfile"],
    mutationFn: async (payload) => {
      return await UpdateProfile(payload);
    },
  });


export const useCreateBug = () => {
  return useMutation({
    mutationKey: ["support", "bug", "create"],
    mutationFn: (input: CreateBugPayload) => CreateBug(input),
  });
};

export const useCreateFeedback = () => {
  return useMutation({
    mutationKey: ["support", "feedback", "create"],
    mutationFn: (input: CreateFeedbackPayload) => CreateFeedback(input),
  });
};