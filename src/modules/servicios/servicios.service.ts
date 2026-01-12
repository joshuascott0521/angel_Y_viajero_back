import type { Request } from "express";
import { serviciosRepo } from "./servicios.repo";

const ROL = { Viajero: 1, Angel: 2 } as const;

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function normalizeError(err: any) {
  // Si ya viene con status (httpError), respétalo
  if (err?.status) return err;

  // Errores típicos de SQL u otros: no exponer detalles
  console.error("[serviciosService]", err);
  return httpError(500, "Error interno");
}

export const serviciosService = {
  async getBySolicitudId(req: Request) {
    try {
      if (!req.user) throw httpError(401, "No autorizado");
      const { solicitudId } = req.params;
      if (!solicitudId) throw httpError(400, "solicitudId es requerido");

      return await serviciosRepo.getBySolicitudId(solicitudId);
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async completar(req: Request) {
    try {
      if (!req.user) throw httpError(401, "No autorizado");
      const { solicitudId } = req.params;
      if (!solicitudId) throw httpError(400, "solicitudId es requerido");

      const { observacionFinal } = req.body ?? {};
      return await serviciosRepo.completar({
        solicitudId,
        usuarioCompletaId: req.user.usuarioId,
        observacionFinal: observacionFinal ?? null,
      });
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async calificar(req: Request) {
    try {
      if (!req.user) throw httpError(401, "No autorizado");
      if (req.user.rolId !== ROL.Viajero) throw httpError(403, "Solo Viajero");

      const { solicitudId } = req.params;
      const { calificacion, comentario } = req.body ?? {};

      if (!solicitudId) throw httpError(400, "solicitudId es requerido");
      if (typeof calificacion !== "number")
        throw httpError(400, "calificacion es requerida");
      if (calificacion < 1 || calificacion > 5)
        throw httpError(400, "calificacion debe ser 1..5");

      return await serviciosRepo.calificar({
        solicitudId,
        perfilViajeroId: req.user.usuarioId,
        calificacion,
        comentario: comentario ?? null,
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
      if (perfilAngelId !== req.user.usuarioId) throw httpError(403, "Sin permiso");

      return await serviciosRepo.getByAngel(perfilAngelId);
    } catch (err: any) {
      throw normalizeError(err);
    }
  },

  async getByViajero(req: Request) {
    try {
      if (!req.user) throw httpError(401, "No autorizado");
      if (req.user.rolId !== ROL.Viajero) throw httpError(403, "Solo Viajero");

      const { perfilViajeroId } = req.params;
      if (perfilViajeroId !== req.user.usuarioId) throw httpError(403, "Sin permiso");

      return await serviciosRepo.getByViajero(perfilViajeroId);
    } catch (err: any) {
      throw normalizeError(err);
    }
  },
};
