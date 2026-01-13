import type { Request } from "express";
import { solicitudesRepo } from "./solicitudes.repo";
import { HttpError } from "../../utils/httpError";

const ROL = { Viajero: 1, Angel: 2 } as const;

function normalizeError(err: any) {
  if (err?.status) return err; // ya es error controlado
  console.error("[solicitudesService]", err); // log real (SQL, etc.)
  return new HttpError(err, 500, "INTERNAL_SERVER_ERROR");
}

export const solicitudesService = {
  async create(req: Request) {
    try {
      if (!req.user) throw new HttpError("No autorizado", 401);
      if (req.user.rolId !== ROL.Viajero)
        throw new HttpError("Solo Viajero", 403);

      const {
        perfilAngelId,
        tipoAsistenciaId,
        duracionEstimadaId,
        fechaHoraInicio,
        lugar,
        detalles,
      } = req.body ?? {};

      if (!perfilAngelId)
        throw new HttpError("perfilAngelId es requerido", 400);
      if (!tipoAsistenciaId)
        throw new HttpError("tipoAsistenciaId es requerido", 400);
      if (!duracionEstimadaId)
        throw new HttpError("duracionEstimadaId es requerido", 400);
      if (!fechaHoraInicio)
        throw new HttpError("fechaHoraInicio es requerido", 400);
      if (!lugar || !String(lugar).trim())
        throw new HttpError("lugar es requerido", 400);
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
      if (!req.user) throw new HttpError("No autorizado", 401);
      if (req.user.rolId !== ROL.Angel) throw new HttpError("Solo Angel", 403);

      const { solicitudId } = req.params;
      const { aceptar, motivoRechazo } = req.body ?? {};

      if (!solicitudId) throw new HttpError("solicitudId es requerido", 400);
      if (typeof aceptar !== "boolean")
        throw new HttpError("aceptar debe ser boolean", 400);

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
      if (!req.user) throw new HttpError("No autorizado", 401);
      if (req.user.rolId !== ROL.Viajero)
        throw new HttpError("Solo Viajero", 403);

      const { solicitudId } = req.params;
      const { motivoCancelacion } = req.body ?? {};

      if (!solicitudId) throw new HttpError("solicitudId es requerido", 400);

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
      if (!req.user) throw new HttpError("No autorizado", 401);
      if (req.user.rolId !== ROL.Angel) throw new HttpError("Solo Angel", 403);

      const { perfilAngelId } = req.params;
      if (!perfilAngelId)
        throw new HttpError("perfilAngelId es requerido", 400);
      if (perfilAngelId !== req.user.usuarioId)
        throw new HttpError("Sin permiso", 403);

      return await solicitudesRepo.getByAngel(perfilAngelId);
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async getByViajero(req: Request) {
    try {
      if (!req.user) throw new HttpError("No autorizado", 401);
      if (req.user.rolId !== ROL.Viajero)
        throw new HttpError("Solo Viajero", 403);

      const { perfilViajeroId } = req.params;
      if (!perfilViajeroId)
        throw new HttpError("perfilViajeroId es requerido", 400);
      if (perfilViajeroId !== req.user.usuarioId)
        throw new HttpError("Sin permiso", 403);

      return await solicitudesRepo.getByViajero(perfilViajeroId);
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async getReviews(req: Request) {
    try {
      if (!req.user) throw new HttpError("No autorizado", 401);
      if (req.user.rolId !== ROL.Viajero)
        throw new HttpError("Solo Viajero", 403);

      const { perfilAngelId } = req.params;
      if (!perfilAngelId)
        throw new HttpError("perfilAngelId es requerido", 400);
      // Nota: tu lógica actual bloquea si es el mismo usuario (ok)
      if (perfilAngelId == req.user.usuarioId)
        throw new HttpError("Sin permiso", 403);

      return await solicitudesRepo.getReviews(perfilAngelId);
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async getAngelesSolicitud(req: Request) {
    try {
      if (!req.user) throw new HttpError("No autorizado", 401);
      if (req.user.rolId !== ROL.Viajero)
        throw new HttpError("Solo Viajero", 403);

      const ciudadId =
        req.query.ciudadId === undefined ||
        req.query.ciudadId === null ||
        req.query.ciudadId === ""
          ? null
          : Number(req.query.ciudadId);

      const zonaId =
        req.query.zonaId === undefined ||
        req.query.zonaId === null ||
        req.query.zonaId === ""
          ? null
          : Number(req.query.zonaId);

      if (ciudadId !== null && (Number.isNaN(ciudadId) || ciudadId <= 0)) {
        throw new HttpError("ciudadId debe ser un número > 0", 400);
      }

      if (zonaId !== null && (Number.isNaN(zonaId) || zonaId <= 0)) {
        throw new HttpError("zonaId debe ser un número > 0", 400);
      }

      // regla: zonaId solo si viene ciudadId
      if (zonaId !== null && ciudadId === null) {
        throw new HttpError(
          "ciudadId es requerido cuando se envía zonaId",
          400
        );
      }

      return await solicitudesRepo.getAngelesSolicitud({ ciudadId, zonaId });
    } catch (err: any) {
      throw normalizeError(err);
    }
  },
};
