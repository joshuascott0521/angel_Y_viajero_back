import type { Request } from "express";
import { solicitudesRepo } from "./solicitudes.repo";

const ROL = { Viajero: 1, Angel: 2 } as const;

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function normalizeError(err: any) {
  if (err?.status) return err; // ya es error controlado
  console.error("[solicitudesService]", err); // log real (SQL, etc.)
  return httpError(500, "Error interno");
}

export const solicitudesService = {
  async create(req: Request) {
    try {
      if (!req.user) throw httpError(401, "No autorizado");
      if (req.user.rolId !== ROL.Viajero) throw httpError(403, "Solo Viajero");

      const {
        perfilAngelId,
        tipoAsistenciaId,
        duracionEstimadaId,
        fechaHoraInicio,
        lugar,
        detalles,
      } = req.body ?? {};

      if (!perfilAngelId) throw httpError(400, "perfilAngelId es requerido");
      if (!tipoAsistenciaId) throw httpError(400, "tipoAsistenciaId es requerido");
      if (!duracionEstimadaId) throw httpError(400, "duracionEstimadaId es requerido");
      if (!fechaHoraInicio) throw httpError(400, "fechaHoraInicio es requerido");
      if (!lugar || !String(lugar).trim()) throw httpError(400, "lugar es requerido");

      return await solicitudesRepo.create({
        perfilViajeroId: req.user.usuarioId,
        perfilAngelId,
        tipoAsistenciaId,
        duracionEstimadaId,
        fechaHoraInicio,
        lugar,
        detalles: detalles ?? null,
      });
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async responderAngel(req: Request) {
    try {
      if (!req.user) throw httpError(401, "No autorizado");
      if (req.user.rolId !== ROL.Angel) throw httpError(403, "Solo Angel");

      const { solicitudId } = req.params;
      const { aceptar, motivoRechazo } = req.body ?? {};

      if (!solicitudId) throw httpError(400, "solicitudId es requerido");
      if (typeof aceptar !== "boolean") throw httpError(400, "aceptar debe ser boolean");

      return await solicitudesRepo.responderAngel({
        solicitudId,
        perfilAngelId: req.user.usuarioId,
        aceptar,
        motivoRechazo: motivoRechazo ?? null,
      });
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async cancelarViajero(req: Request) {
    try {
      if (!req.user) throw httpError(401, "No autorizado");
      if (req.user.rolId !== ROL.Viajero) throw httpError(403, "Solo Viajero");

      const { solicitudId } = req.params;
      const { motivoCancelacion } = req.body ?? {};

      if (!solicitudId) throw httpError(400, "solicitudId es requerido");

      return await solicitudesRepo.cancelarViajero({
        solicitudId,
        perfilViajeroId: req.user.usuarioId,
        motivoCancelacion: motivoCancelacion ?? null,
      });
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async getByAngel(req: Request) {
    try {
      if (!req.user) throw httpError(401, "No autorizado");
      if (req.user.rolId !== ROL.Angel) throw httpError(403, "Solo Angel");

      const { perfilAngelId } = req.params;
      if (!perfilAngelId) throw httpError(400, "perfilAngelId es requerido");

      if (perfilAngelId !== req.user.usuarioId) throw httpError(403, "Sin permiso");

      return await solicitudesRepo.getByAngel(perfilAngelId);
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async getByViajero(req: Request) {
    try {
      if (!req.user) throw httpError(401, "No autorizado");
      if (req.user.rolId !== ROL.Viajero) throw httpError(403, "Solo Viajero");

      const { perfilViajeroId } = req.params;
      if (!perfilViajeroId) throw httpError(400, "perfilViajeroId es requerido");

      if (perfilViajeroId !== req.user.usuarioId) throw httpError(403, "Sin permiso");

      return await solicitudesRepo.getByViajero(perfilViajeroId);
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async getReviews(req: Request) {
    try {
      if (!req.user) throw httpError(401, "No autorizado");
      if (req.user.rolId !== ROL.Viajero) throw httpError(403, "Solo Viajero");

      const { perfilAngelId } = req.params;
      if (!perfilAngelId) throw httpError(400, "perfilAngelId es requerido");

      // Nota: tu lógica actual bloquea si es el mismo usuario (ok)
      if (perfilAngelId == req.user.usuarioId) throw httpError(403, "Sin permiso");

      return await solicitudesRepo.getReviews(perfilAngelId);
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async getAngelesSolicitud(req: Request) {
    try {
      if (!req.user) throw httpError(401, "No autorizado");
      if (req.user.rolId !== ROL.Viajero) throw httpError(403, "Solo Viajero");

      const filtroRaw = String(req.query.filtro ?? "all").toLowerCase();
      const filtro = (
        ["all", "ciudad", "zona"].includes(filtroRaw) ? filtroRaw : null
      ) as "all" | "ciudad" | "zona" | null;

      if (!filtro) throw httpError(400, "filtro inválido. Use: all | ciudad | zona");

      const zonaId =
        req.query.zonaId === undefined || req.query.zonaId === null
          ? null
          : Number(req.query.zonaId);

      if (filtro === "zona") {
        if (!zonaId || Number.isNaN(zonaId) || zonaId <= 0) {
          throw httpError(400, "zonaId es requerido y debe ser > 0 cuando filtro=zona");
        }
      }

      return await solicitudesRepo.getAngelesSolicitud({
        perfilViajeroId: req.user.usuarioId,
        filtro,
        zonaId,
      });
    } catch (err: any) {
      throw normalizeError(err);
    }
  },
};
