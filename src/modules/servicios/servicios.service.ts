import type { Request } from "express";
import { serviciosRepo } from "./servicios.repo";

const ROL = { Viajero: 1, Angel: 2 } as const;

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export const serviciosService = {
  async getBySolicitudId(req: Request) {
    if (!req.user) throw httpError(401, "No autorizado");
    const { solicitudId } = req.params;
    if (!solicitudId) throw httpError(400, "solicitudId es requerido");
    return serviciosRepo.getBySolicitudId(solicitudId);
  },

  async completar(req: Request) {
    if (!req.user) throw httpError(401, "No autorizado");
    const { solicitudId } = req.params;
    if (!solicitudId) throw httpError(400, "solicitudId es requerido");

    const { observacionFinal } = req.body ?? {};
    return serviciosRepo.completar({
      solicitudId,
      usuarioCompletaId: req.user.usuarioId,
      observacionFinal: observacionFinal ?? null,
    });
  },

  async calificar(req: Request) {
    if (!req.user) throw httpError(401, "No autorizado");
    if (req.user.rolId !== ROL.Viajero) throw httpError(403, "Solo Viajero");

    const { solicitudId } = req.params;
    const { calificacion, comentario } = req.body ?? {};

    if (!solicitudId) throw httpError(400, "solicitudId es requerido");
    if (typeof calificacion !== "number") throw httpError(400, "calificacion es requerida");
    if (calificacion < 1 || calificacion > 5) throw httpError(400, "calificacion debe ser 1..5");

    return serviciosRepo.calificar({
      solicitudId,
      perfilViajeroId: req.user.usuarioId,
      calificacion,
      comentario: comentario ?? null,
    });
  },

  async getByAngel(req: Request) {
    if (!req.user) throw httpError(401, "No autorizado");
    if (req.user.rolId !== ROL.Angel) throw httpError(403, "Solo Angel");

    const { perfilAngelId } = req.params;
    if (perfilAngelId !== req.user.usuarioId) throw httpError(403, "Sin permiso");

    return serviciosRepo.getByAngel(perfilAngelId);
  },

  async getActivosByAngel(req: Request) {
    if (!req.user) throw httpError(401, "No autorizado");
    if (req.user.rolId !== ROL.Angel) throw httpError(403, "Solo Angel");

    const { perfilAngelId } = req.params;
    if (perfilAngelId !== req.user.usuarioId) throw httpError(403, "Sin permiso");

    return serviciosRepo.getActivosByAngel(perfilAngelId);
  },

  async getByViajero(req: Request) {
    if (!req.user) throw httpError(401, "No autorizado");
    if (req.user.rolId !== ROL.Viajero) throw httpError(403, "Solo Viajero");

    const { perfilViajeroId } = req.params;
    if (perfilViajeroId !== req.user.usuarioId) throw httpError(403, "Sin permiso");

    return serviciosRepo.getByViajero(perfilViajeroId);
  },
};
