import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { getAccessToken } from "@/lib/cookies";
import { GenericResponse } from "@/types/api";
import { UpdateProfilePayload } from "@/types/api/user";

export type FetchUsersParams = {
  page?: number; // 1-based
  limit?: number;
  search?: string;
  role?: "USER" | "ADMIN";
  is_blocked?: boolean;
  is_verified?: boolean;
  auth_provider?: "local" | "google" | "facebook" | "github";
  sortBy?: string; // created | updated_at
  sortOrder?: "asc" | "desc";
};

export type UserRow = {
  _id: string;
  first_name: string;
  last_name?: string;
  email: string;
  role: "USER" | "ADMIN";
  avatar_url?: string;
  is_blocked?: boolean;
  is_verified?: boolean;
  is_deleted?: boolean;
  created?: string;
  updated_at?: string;
};

export type UsersListPayload = {
  pagination:{
    totalCount: number;
  limit: number;
  offset: number;
  },
  data: UserRow[];
};

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getAccessToken()}`,
  },
});

/* ================= FETCH USERS ================= */
export async function FetchUsers(
  params: FetchUsersParams = {},
): Promise<UsersListPayload> {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    is_blocked,
    is_verified,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const offset = Math.max(page - 1, 0) * limit;

  const { data } = await api.get(
    apiEndpoints.user.getAll({
      limit,
      offset,
      search: search || undefined,
      role: role || undefined,
      is_blocked: typeof is_blocked === "boolean" ? is_blocked : undefined,
      is_verified: typeof is_verified === "boolean" ? is_verified : undefined,
      sortBy,
      sortOrder,
    }),
    {
      ...authHeaders(),
    },
  );

  return data;
}

/* ================= BLOCK USER ================= */
export async function BlockUser(userId: string): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.user.block(userId),
    {},
    authHeaders(),
  );
  return data;
}

/* ================= DELETE USER ================= */
export async function DeleteUser(userId: string): Promise<GenericResponse> {
  const { data } = await api.delete(
    apiEndpoints.user.deleteById(userId),
    authHeaders(),
  );
  return data;
}

/* ================= Bulk DELETE USER ================= */
export async function BulkDeleteUsers(
  userIds: string[],
  actorId: string,
): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.user.bulkDeleteUsers,
    { userIds, actorId },
    authHeaders(),
  );
  return data;
}

/* ================= UPDATE USER ================= */
export async function UpdateProfile(
  input: UpdateProfilePayload | FormData,
): Promise<GenericResponse> {
  const headers = {
    Authorization: `Bearer ${getAccessToken()}`,
  };

  // Don't set Content-Type header for FormData - browser will set it automatically with boundary
  const config = input instanceof FormData
    ? { headers }
    : { headers: { ...headers, "Content-Type": "application/json" } };

  const { data } = await api.put(apiEndpoints.user.updateMe, input, config);
  return data;
}

/* ================= UPLOAD AVATAR ================= */
export async function UploadAvatar(input: FormData): Promise<GenericResponse> {
  const headers = {
    Authorization: `Bearer ${getAccessToken()}`,
  };

  const { data } = await api.put(apiEndpoints.user.uploadAvatar, input, {
    headers,
  });

  return data;
}
