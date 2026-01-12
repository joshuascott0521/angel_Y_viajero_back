import type { Server } from "socket.io";
import { socketAuth } from "./socketAuth";
import { chatRepo } from "../modules/chat/chat.repo";

export function registerSockets(io: Server) {
  // Middleware global
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const usuarioId = socket.data.usuarioId;

    // Room personal (opcional)
    socket.join(`usuario:${usuarioId}`);

    /* ===============================
       JOIN / LEAVE
       =============================== */

    socket.on("solicitud:join", ({ solicitudId }) => {
      if (!solicitudId) return;
      socket.join(`solicitud:${solicitudId}`);
    });

    socket.on("solicitud:leave", ({ solicitudId }) => {
      if (!solicitudId) return;
      socket.leave(`solicitud:${solicitudId}`);
    });

    /* ===============================
       ENVIAR MENSAJE
       =============================== */

    socket.on("chat:enviar", async ({ solicitudId, mensaje, tempId }) => {
      if (!solicitudId || !mensaje?.trim()) return;

      try {
        const msg = await chatRepo.enviarMensaje({
          solicitudId,
          emisorUsuarioId: usuarioId,
          mensaje: mensaje.trim(),
        });

        io.to(`solicitud:${solicitudId}`).emit("chat:nuevo", {
          ...msg,
          tempId: tempId ?? null,
        });
      } catch (err: any) {
        socket.emit("chat:error", {
          message: err.message || "No se pudo enviar el mensaje",
        });
      }
    });

    /* ===============================
       MARCAR LEÍDOS
       =============================== */

    socket.on("chat:leer", async ({ solicitudId, hastaChatMensajeId }) => {
      if (!solicitudId) return;

      const r = await chatRepo.marcarLeidos({
        solicitudId,
        usuarioId,
        hastaChatMensajeId,
      });

      // badge del que leyó se vuelve 0 (o recalculado)
      io.to(`usuario:${usuarioId}`).emit("chat:badge", {
        solicitudId,
        noLeidos: 0,
        mensajesMarcados: r.MensajesMarcados,
      });
    });

    socket.on("disconnect", () => {
      // logs si quieres
    });
  });
}
