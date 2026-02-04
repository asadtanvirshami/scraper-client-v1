import { useMutation } from "@tanstack/react-query";

import { CreateBug, CreateFeedback,  } from "@/api/api_calls/support";
import { CreateBugPayload, CreateFeedbackPayload } from "@/types/api/bug";


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