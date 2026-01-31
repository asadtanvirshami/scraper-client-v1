import { UpdateProfile } from "@/api/api_calls/user";
import { GenericResponse } from "@/types/api";
import { UpdateProfilePayload } from "@/types/api/user";
import { useMutation } from "@tanstack/react-query";

export const useUpdateProfile = () =>
  useMutation<GenericResponse, Error, UpdateProfilePayload>({
    mutationKey: ["user", "updateProfile"],
    mutationFn: async (payload) => {
      return await UpdateProfile(payload);
    },
  });

