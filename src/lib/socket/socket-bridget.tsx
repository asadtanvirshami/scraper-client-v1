// components/SocketBridge.tsx
"use client";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

export default function SocketBridge({
  userId,
  children,
}: {
  userId?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const socket = getSocket(userId);
    console.log(socket);
    
    if (!socket) return;

    const onConnect = () => {
      socket.emit("subscribe", "broadcast");
      if (userId) socket.emit("subscribe", `user:${userId}`);
    };

    socket.on("connect", onConnect);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      // keep alive across pages in dev; don't disconnect here
    };
  }, [userId]);

  return <>{children}</>;
}
