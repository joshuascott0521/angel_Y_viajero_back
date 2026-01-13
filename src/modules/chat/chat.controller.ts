import type { Request, Response } from "express";
import { chatService } from "./chat.service";

function apiError(res: Response, status: number, message: string, code: string) {
  return res.status(status).json({ ok: false, message, code });
}

export const chatController = {
  async inbox(req: Request, res: Response) {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return apiError(res, 401, "No autenticado", "AUTH_REQUIRED");

    const data = await chatService.inbox(usuarioId);
    return res.json(data);
  },

  async enviarMensaje(req: Request, res: Response) {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return apiError(res, 401, "No autenticado", "AUTH_REQUIRED");
    const { solicitudId } = req.params;
    const { mensaje } = req.body;
    if (!solicitudId) return apiError(res, 400, "solicitudId es requerido", "VALIDATION_ERROR");
    if (!mensaje || typeof mensaje !== "string" || !mensaje.trim()) {
      return apiError(res, 400, "mensaje es requerido", "VALIDATION_ERROR");
    }
    try {
      const msg = await chatService.enviarMensaje(solicitudId, usuarioId, mensaje.trim());
      return res.json(msg);
    } catch (e: any) {
      return apiError(res, 403, e.message || "No autorizado", "CHAT_FORBIDDEN");
    }
  },

  async mensajesBySolicitud(req: Request, res: Response) {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return apiError(res, 401, "No autenticado", "AUTH_REQUIRED");

    const { solicitudId } = req.params;
    if (!solicitudId) return apiError(res, 400, "solicitudId es requerido", "VALIDATION_ERROR");

    let take = Number(req.query.take ?? 50);
    if (!Number.isFinite(take) || take <= 0) take = 50;
    if (take > 200) take = 200;

    try {
      const data = await chatService.mensajes(solicitudId, usuarioId, take);
      return res.json(data);
    } catch (e: any) {
      // tus SP tiran RAISERROR con mensaje claro
      return apiError(res, 403, e.message || "No autorizado", "CHAT_FORBIDDEN");
    }
  },

  async marcarLeidos(req: Request, res: Response) {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return apiError(res, 401, "No autenticado", "AUTH_REQUIRED");

    const { solicitudId } = req.params;
    if (!solicitudId) return apiError(res, 400, "solicitudId es requerido", "VALIDATION_ERROR");

    const body = req.body;
    if (!body || typeof body !== "object") {
      return apiError(res, 400, "Body inválido", "VALIDATION_ERROR");
    }

    const hastaChatMensajeIdRaw = body.hastaChatMensajeId;
    const hastaChatMensajeId =
      hastaChatMensajeIdRaw == null ? null : Number(hastaChatMensajeIdRaw);

    if (hastaChatMensajeId != null && (!Number.isFinite(hastaChatMensajeId) || hastaChatMensajeId <= 0)) {
      return apiError(res, 400, "hastaChatMensajeId inválido", "VALIDATION_ERROR");
    }

    try {
      const r = await chatService.leer(solicitudId, usuarioId, hastaChatMensajeId);
      return res.json({ ok: true, mensaje: "Mensajes marcados como leídos", ...r });
    } catch (e: any) {
      return apiError(res, 403, e.message || "No autorizado", "CHAT_FORBIDDEN");
    }
  },

  // ✅ opcional si creaste ChatNoLeidosBySolicitud
  async noLeidos(req: Request, res: Response) {
    const usuarioId = req.user?.usuarioId;
    if (!usuarioId) return apiError(res, 401, "No autenticado", "AUTH_REQUIRED");

    const { solicitudId } = req.params;
    if (!solicitudId) return apiError(res, 400, "solicitudId es requerido", "VALIDATION_ERROR");

    try {
      const noLeidos = await chatService.noLeidos(solicitudId, usuarioId);
      return res.json({ ok: true, noLeidos });
    } catch (e: any) {
      return apiError(res, 403, e.message || "No autorizado", "CHAT_FORBIDDEN");
    }
  },
};
