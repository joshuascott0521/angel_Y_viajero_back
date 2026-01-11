import type { Server } from "socket.io";

export function registerSockets(io: Server) {
  io.on("connection", (socket) => {
    // Unirse a una solicitud (chat + estados)
    socket.on("solicitud:join", ({ solicitudId }: { solicitudId: string }) => {
      if (!solicitudId) return;
      socket.join(`solicitud:${solicitudId}`);
    });

    socket.on("solicitud:leave", ({ solicitudId }: { solicitudId: string }) => {
      if (!solicitudId) return;
      socket.leave(`solicitud:${solicitudId}`);
    });
  });
}
