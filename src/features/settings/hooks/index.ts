import { GenericResponse } from "@/api/api_calls/type";
import { UpdateProfile } from "@/api/api_calls/user";
import { useMutation } from "@tanstack/react-query";

export const useUpdateProfile = () =>
  useMutation<GenericResponse, Error, UpdateProfilePayload>({
    mutationKey: ["user", "updateProfile"],
    mutationFn: async (payload) => {
      return await UpdateProfile(payload);
    },
  });
