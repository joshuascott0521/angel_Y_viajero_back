import type { Request, Response } from "express";
import { perfilesService } from "./perfiles.service";

export async function getMiPerfilViajero(req: Request, res: Response) {
  const data = await perfilesService.getPerfilViajero(req.user!.usuarioId);
  return res.json(data);
}

export async function patchMiPerfilViajero(req: Request, res: Response) {
  const data = await perfilesService.patchPerfilViajero(
    req.user!.usuarioId,
    req.body
  );
  return res.json({ mensaje: "Perfil viajero actualizado", data });
}

export async function getMiPerfilAngel(req: Request, res: Response) {
  const data = await perfilesService.getPerfilAngel(req.user!.usuarioId);
  return res.json(data);
}

export async function patchMiPerfilAngel(req: Request, res: Response) {
  const usuarioId = req.user!.usuarioId;
  const body = req.body;

  // Validación mínima: debe venir al menos algo
  if (!body || typeof body !== "object") {
    return res.status(400).json({ mensaje: "Body inválido" });
  }

  // (Opcional pero recomendado) validaciones defensivas
  if (body.disponibilidadSemanal) {
    if (!Array.isArray(body.disponibilidadSemanal)) {
      return res.status(400).json({
        mensaje: "disponibilidadSemanal debe ser un arreglo",
      });
    }

    for (const d of body.disponibilidadSemanal) {
      if (
        typeof d.diaSemana !== "number" ||
        d.diaSemana < 1 ||
        d.diaSemana > 7
      ) {
        return res.status(400).json({
          mensaje: "diaSemana debe estar entre 1 y 7",
        });
      }

      if (d.activo === true) {
        if (!d.horaInicio || !d.horaFin) {
          return res.status(400).json({
            mensaje: "Si activo=true, horaInicio y horaFin son obligatorias",
          });
        }
      }
    }
  }

  // Ejecutar PATCH
  const data = await perfilesService.patchPerfilAngel(usuarioId, body);

  return res.json({
    mensaje: "Perfil ángel actualizado",
    data,
  });
}
