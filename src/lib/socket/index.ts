// client/src/lib/socket/index.ts
import { io } from "socket.io-client";

export function getSocket(userId?: string) {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_WS_URL!; // http://localhost:8080
  const path = process.env.NEXT_PUBLIC_WS_PATH || "/socket.io";

  console.log("[socket] will connect", { url, path, userId });

  const socket = io(url, {
    path,
    withCredentials: true,
    // 👇 allow polling while we debug the WS upgrade
    transports: ["websocket"],
    autoConnect: true,
    query: userId ? { userId } : undefined,
    timeout: 10000,
  });

  socket.on("connect_error", (e) =>
    console.error("connect_error:", e?.message ?? e)
  );
  return socket;
}
