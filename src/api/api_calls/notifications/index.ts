import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "../type";
import { getAccessToken } from "@/lib/cookies";

const token = getAccessToken();

/**
 * Get user notifications (paginated)
 */
export async function fetchNotifications(
  offset = 0,
  limit = 10
): Promise<GenericResponse> {
  const { data } = await api.get(
    apiEndpoints.notifications.get({offset, limit}),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}

/**
 * Get ALL notifications (ADMIN)
 */
export async function fetchAllNotificationsAdmin(
  offset = 0,
  limit = 10
): Promise<GenericResponse> {
  const { data } = await api.get(
    apiEndpoints.notifications.getAllAdmin({offset, limit}),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}

/**
 * Create a single notification (ADMIN / SYSTEM)
 */
export async function createNotification(
  payload: Record<string, any>
): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.notifications.create,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}

/**
 * Bulk create notifications (ADMIN)
 */
export async function bulkCreateNotifications(
  payload: Record<string, any>[]
): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.notifications.bulkCreate,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}

/**
 * Mark ALL notifications as read (USER)
 */
export async function markAllNotificationsRead(): Promise<GenericResponse> {
  const { data } = await api.patch(
    apiEndpoints.notifications.markAllRead,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}

/**
 * Mark ONE notification as read (USER)
 */
export async function markNotificationRead(
  notificationId: string
): Promise<GenericResponse> {
  const { data } = await api.patch(
    apiEndpoints.notifications.markOneRead(notificationId),
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}

/**
 * Delete ALL notifications (USER)
 */
export async function deleteAllNotifications(): Promise<GenericResponse> {
  const { data } = await api.delete(
    apiEndpoints.notifications.deleteAll,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}

/**
 * Delete ONE notification (USER)
 */
export async function deleteNotification(
  notificationId: string
): Promise<GenericResponse> {
  const { data } = await api.delete(
    apiEndpoints.notifications.deleteOne(notificationId),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}

/**
 * Bulk delete notifications (USER)
 */
export async function bulkDeleteNotifications(
  notificationIds: string[]
): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.notifications.bulkDelete,
    { notificationIds },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
}
