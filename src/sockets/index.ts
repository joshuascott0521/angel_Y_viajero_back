import type { Server } from "socket.io";
import { socketAuth } from "./socketAuth";
import { chatRepo } from "../modules/chat/chat.repo";

export function registerSockets(io: Server) {
  // Middleware global
  io.use(socketAuth);

  io.on("connection", (socket) => {
    const usuarioId = socket.data.usuarioId;
    console.log("✅ socket connected", socket.id, "usuarioId:", usuarioId);

    // Room personal (opcional)
    socket.join(`usuario:${usuarioId}`);

    /* ===============================
       JOIN / LEAVE
       =============================== */

    socket.on("solicitud:join", ({ solicitudId }) => {
      console.log("➡️ join", usuarioId, solicitudId);
      socket.join(`solicitud:${solicitudId}`);
    });

    socket.on("solicitud:leave", ({ solicitudId }) => {
      console.log("⬅️ leave", usuarioId, solicitudId);
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

        // 1) chat abierto
        io.to(`solicitud:${solicitudId}`).emit("chat:nuevo", {
          ...msg,
          tempId: tempId ?? null,
        });

        // 2) inbox (SIEMPRE) -> a cada usuario
        const { viajeroId, angelId } =
          await chatRepo.getParticipantesBySolicitudId(solicitudId);

        // emite un evento separado para inbox (puede ser el mismo chat:nuevo o uno nuevo)
        io.to(`usuario:${viajeroId}`).emit("inbox:nuevo", msg);
        io.to(`usuario:${angelId}`).emit("inbox:nuevo", msg);
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
      console.log("👀 leer", usuarioId, solicitudId, { hastaChatMensajeId });
      const r = await chatRepo.marcarLeidos({
        solicitudId,
        usuarioId,
        hastaChatMensajeId,
      });

      // badge del que leyó se vuelve 0 (o recalculado)
      io.to(`usuario:${usuarioId}`).emit("chat:badge", {
        solicitudId,
        noLeidos: 0,
        mensajesMarcados: r.mensajesMarcados,
      });

      io.to(`solicitud:${solicitudId}`).emit("chat:visto", {
        solicitudId,
        hastaChatMensajeId,
        lectorUsuarioId: usuarioId,
        fechaLectura: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      // logs si quieres
    });
  });
}
