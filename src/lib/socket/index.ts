// client/src/lib/socket/index.ts
import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

export function getSocket(userId?: string) {
  if (typeof window === "undefined") return null;
  if (socketInstance) return socketInstance;

  const url = (process.env.NEXT_PUBLIC_WS_URL || window.location.origin).trim();
  const path = (process.env.NEXT_PUBLIC_WS_PATH || "/socket.io").trim();

  console.log("[socket] will connect", { url, path, userId });

  socketInstance = io(url, {
    path,
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
    query: userId ? { userId } : undefined,
    timeout: 10000,
  });

  socketInstance.on("connect_error", (e) =>
    console.error("connect_error:", e?.message ?? e)
  );
  return socketInstance;
}
