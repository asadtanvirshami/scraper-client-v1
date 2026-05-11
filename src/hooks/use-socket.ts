import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4000";

/**
 * Returns a stable Socket.io socket for `userId`.
 * The socket is created once and cleaned up when the component unmounts.
 */
export function useSocket(userId: string | null | undefined): Socket | null {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(SOCKET_URL, {
      auth: { userId },
      query: { userId },
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  return socketRef.current;
}
