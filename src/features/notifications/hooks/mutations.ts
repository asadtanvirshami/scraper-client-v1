"use client";

import { useMutation } from "@tanstack/react-query";
import type { GenericResponse } from "../../../api/api_calls/type";

import {
  markAllNotificationsRead,
  markNotificationRead,
  bulkDeleteNotifications,
  deleteAllNotifications,
  deleteNotification,
} from "@/api/api_calls/notifications";

export const useMarkAllRead = () =>
  useMutation<GenericResponse, Error, void>({
    mutationKey: ["notifications", "markAllRead"],
    mutationFn: async () => {
      return await markAllNotificationsRead();
    },
  });

export const useMarkReadByNotificationId = () =>
  useMutation<GenericResponse, Error, string>({
    mutationKey: ["notifications", "markOneRead"],
    mutationFn: async (notificationId: string) => {
      return await markNotificationRead(notificationId);
    },
    onError(error) {
      console.error(error);
      throw error;
    },
  });

export const useBulkDeleteNotifications = () =>
  useMutation<GenericResponse, Error, { ids: string[] }>({
    mutationKey: ["notifications", "bulkDelete"],
    mutationFn: async ({ ids }) => {
      // backend expects: { notificationIds: string[] }
      return await bulkDeleteNotifications(ids);
    },
    onError(error) {
      console.error(error);
      throw error;
    },
  });

export const useClearAllNotifications = () =>
  useMutation<GenericResponse, Error, void>({
    mutationKey: ["notifications", "deleteAll"],
    mutationFn: async () => {
      return await deleteAllNotifications();
    },
    onError(error) {
      console.error(error);
      throw error;
    },
  });

export const useDeleteNotificationById = () =>
  useMutation<GenericResponse, Error, string>({
    mutationKey: ["notifications", "deleteOne"],
    mutationFn: async (notificationId: string) => {
      return await deleteNotification(notificationId);
    },
  });

const notificationMutations = {
  useMarkAllRead,
  useMarkReadByNotificationId,
  useBulkDeleteNotifications,
  useDeleteNotificationById,
  useClearAllNotifications,
};

export default notificationMutations;
