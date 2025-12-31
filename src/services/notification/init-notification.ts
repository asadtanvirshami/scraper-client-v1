// src/services/notificationService.ts
import { getSocket } from "@/lib/socket";
import { AppDispatch } from "@/redux/store";
import {
  setNotifications,
  addNotification,
} from "@/redux/slices/notification/slice";
import api from "@/api/axios";
import { apiEndpoints } from "@/api/endpoints";

export async function initNotifications(dispatch: AppDispatch, userId: string) {
  try {
    const { data} = await api.get(
      apiEndpoints.notification.getAll({ id: userId })
    );

    if (data?.data) {
      dispatch(setNotifications(data.data));
    }

    const socket = getSocket();

    // Subscribe to user-specific room
    socket?.emit("subscribe", `user:${userId}`);

    // Listen for new notifications in real-time
    socket?.on("event", (payload) => {
      dispatch(addNotification(payload));
    });
  } catch (error) {
    console.error("❌ initNotifications failed:", error);
  }
}

export default initNotifications;
