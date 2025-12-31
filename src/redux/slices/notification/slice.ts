import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Notification = {
  id: string;
  title: string;
  message?: string;
  level?: "info" | "success" | "warning" | "error";
  ts?: number;
  is_read?: boolean;
  userId?: string; // <- added
};

export type Level = "info" | "success" | "warning" | "error";

export const mapTypeToLevel = (type?: string): Level => {
  switch (type) {
    case "promo":
      return "success";
    case "reminder":
      return "warning";
    case "alert":
      return "error";
    case "system":
    case "info":
    default:
      return "info";
  }
};

type State = {
  items: Notification[];
  unread: number;
  ids: string[];
  isLoading: boolean;
};
const initialState: State = { items: [], unread: 0, ids: [], isLoading: true };

const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (s, a: PayloadAction<Notification>) => {
      s.items.unshift(a.payload);
      s.unread++;
      s.ids = s.items.map((n) => n.id);
    },
    setNotifications: (s, a: PayloadAction<Notification[]>) => {
      s.items = a.payload;
      s.unread = s.items.filter((n) => !n.is_read).length;
      s.ids = s.items.map((n) => n.id);
      s.isLoading = false;
    },
    notificationReceived: (s, a: PayloadAction<Notification>) => {
      s.items.unshift({
        is_read: false,
        ts: Date.now(),
        level: "info",
        ...a.payload,
      });
      s.unread++;
      s.ids = s.items.map((n) => n.id);
    },
    markAllRead: (s) => {
      s.items = s.items.map((n) => ({ ...n, is_read: true }));
      s.unread = 0;
      s.ids = s.items.map((n) => n.id);
    },
    // NEW: mark all notifications for a given userId as read
    markReadByUserId: (s, a: PayloadAction<string>) => {
      let changed = 0;
      s.items = s.items.map((n) => {
        if (!n.is_read && n.userId === a.payload) {
          changed++;
          return { ...n, read: true };
        }
        return n;
      });
      s.unread = Math.max(0, s.unread - changed);
      s.ids = s.items.map((n) => n.id);
    },
    clearAll: (s) => {
      s.items = [];
      s.unread = 0;
      s.ids = [];
      s.isLoading = false;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  notificationReceived,
  markAllRead,
  markReadByUserId,
  clearAll,
} = slice.actions;
export default slice.reducer;
