import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4000";

/**
 * Returns a live Socket.io socket for `userId`.
 *
 * Exposed via state (not a ref) so consumers re-render and (re)attach their
 * event listeners the moment the socket exists. Returning a ref meant the
 * instance was created in an effect after render without triggering a
 * re-render, so listeners bound to `null` and no real-time updates arrived.
 */
export function useSocket(userId: string | null | undefined): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!userId) {
      setSocket(null);
      return;
    }

    const instance = io(SOCKET_URL, {
      auth: { userId },
      query: { userId },
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Re-assert the user room on every (re)connect so updates keep flowing
    // after a transient disconnect or backend restart.
    const handleConnect = () => instance.emit("subscribe", `user:${userId}`);
    instance.on("connect", handleConnect);

    setSocket(instance);

    return () => {
      instance.off("connect", handleConnect);
      instance.disconnect();
      setSocket(null);
    };
  }, [userId]);

  return socket;
}
