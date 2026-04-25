import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";
import { GenericResponse } from "@/types/api";

/**
 * Get user notifications (paginated)
 */
export async function fetchNotifications(
  offset = 0,
  limit = 10,
): Promise<GenericResponse> {
  const { data } = await api.get(
    apiEndpoints.notifications.get({ offset, limit }),
  );
  return data;
}

/**
 * Get ALL notifications (ADMIN)
 */
export async function fetchAllNotificationsAdmin(
  offset = 0,
  limit = 10,
): Promise<GenericResponse> {
  const { data } = await api.get(
    apiEndpoints.notifications.getAllAdmin({ offset, limit }),
  );
  return data;
}

/**
 * Create a single notification (ADMIN / SYSTEM)
 */
export async function createNotification(
  payload: Record<string, any>,
): Promise<GenericResponse> {
  const { data } = await api.post(apiEndpoints.notifications.create, payload);
  return data;
}

/**
 * Bulk create notifications (ADMIN)
 */
export async function bulkCreateNotifications(
  payload: Record<string, any>[],
): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.notifications.bulkCreate,
    payload,
  );
  return data;
}

/**
 * Mark ALL notifications as read (USER)
 */
export async function markAllNotificationsRead(
  id: string,
): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.notifications.markAllRead,
    { _id: id },
  );
  return data;
}

/**
 * Mark ONE notification as read (USER)
 */
export async function markNotificationRead(
  notificationId: string,
): Promise<GenericResponse> {
  const { data } = await api.patch(
    apiEndpoints.notifications.markOneRead(notificationId),
    {},
  );
  return data;
}

/**
 * Delete ALL notifications (USER)
 */
export async function deleteAllNotifications(id:string): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.notifications.deleteAll,
    { _id: id },
  );
  return data;
}

/**
 * Delete ONE notification (USER)
 */
export async function deleteNotification(
  notificationId: string,
): Promise<GenericResponse> {
  const { data } = await api.delete(
    apiEndpoints.notifications.deleteOne(notificationId),
  );
  return data;
}

/**
 * Bulk delete notifications (USER)
 */
export async function bulkDeleteNotifications(
  notificationIds: string[],
): Promise<GenericResponse> {
  const { data } = await api.post(
    apiEndpoints.notifications.bulkDelete,
    { notificationIds },
  );
  return data;
}
