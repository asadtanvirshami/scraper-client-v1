import { BulkDeleteUsers, UpdateProfile, UploadAvatar } from "@/api/api_calls/user";
import { GenericResponse } from "@/types/api";
import { UpdateProfilePayload } from "@/types/api/user";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  FetchUsers,
  BlockUser,
  DeleteUser,
  FetchUsersParams,
  UsersListPayload,
} from "@/api/api_calls/user";

export const useUpdateProfile = () =>
  useMutation<GenericResponse, Error, UpdateProfilePayload | FormData>({
    mutationKey: ["user", "updateProfile"],
    mutationFn: async (payload) => {
      return await UpdateProfile(payload);
    },
  });

export const useUploadAvatar = () =>
  useMutation<GenericResponse, Error, FormData>({
    mutationKey: ["user", "uploadAvatar"],
    mutationFn: async (payload) => {
      return await UploadAvatar(payload);
    },
  });

export const usersKeys = {
  all: ["users"] as const,
  list: (params: FetchUsersParams) => ["users", "list", params] as const,
};

/* ================= LIST ================= */
export const useFetchUsers = (params: FetchUsersParams) => {
  const { data, isLoading, isFetching, isError, error } = useQuery<
    UsersListPayload,
    Error
  >({
    queryKey: usersKeys.list(params),
    queryFn: () => FetchUsers({...params}),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  };
};

/* ================= BLOCK ================= */
export const useBlockUser = () => {
  const qc = useQueryClient();

  return useMutation<GenericResponse, Error, { id: string }>({
    mutationKey: ["users", "block"],
    mutationFn: ({ id }) => BlockUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
};

/* ================= DELETE ================= */
export const useDeleteUser = () => {
  const qc = useQueryClient();

  return useMutation<GenericResponse, Error, { id: string }>({
    mutationKey: ["users", "delete"],
    mutationFn: ({ id }) => DeleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
};

/* ================= DELETE ================= */
export const useBulkDeleteUsers = () => {
  const qc = useQueryClient();

  return useMutation<
    GenericResponse,
    Error,
    { userIds: string[]; actorId: string }
  >({
    mutationKey: ["users", "delete"],
    mutationFn: ({ userIds, actorId }) => BulkDeleteUsers(userIds, actorId),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
};
