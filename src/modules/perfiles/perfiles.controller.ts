import type { Request, Response } from "express";
import { perfilesService } from "./perfiles.service";

export async function getMiPerfilViajero(req: Request, res: Response) {
  try {
    const data = await perfilesService.getPerfilViajero(req.user!.usuarioId);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ mensaje: error.message });
  }
}

export async function patchMiPerfilViajero(req: Request, res: Response) {
  try {
    const data = await perfilesService.patchPerfilViajero(
      req.user!.usuarioId,
      req.body
    );

    return res.json({
      mensaje: "Perfil viajero actualizado",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({ mensaje: error.message });
  }
}

export async function getMiPerfilAngel(req: Request, res: Response) {
  try {
    const data = await perfilesService.getPerfilAngel(req.user!.usuarioId);
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ mensaje: error.message });
  }
}

export async function patchMiPerfilAngel(req: Request, res: Response) {
  try {
    const usuarioId = req.user!.usuarioId;
    const body = req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({ mensaje: "Body inválido" });
    }

    if (body.disponibilidadSemanal) {
      if (!Array.isArray(body.disponibilidadSemanal)) {
        return res.status(400).json({
          mensaje: "disponibilidadSemanal debe ser un arreglo",
        });
      }

      for (const d of body.disponibilidadSemanal) {
        if (typeof d.diaSemana !== "number" || d.diaSemana < 1 || d.diaSemana > 7) {
          return res.status(400).json({
            mensaje: "diaSemana debe estar entre 1 y 7",
          });
        }

        if (d.activo === true && (!d.horaInicio || !d.horaFin)) {
          return res.status(400).json({
            mensaje: "Si activo=true, horaInicio y horaFin son obligatorias",
          });
        }
      }
    }

    const data = await perfilesService.patchPerfilAngel(usuarioId, body);

    return res.json({
      mensaje: "Perfil ángel actualizado",
      data,
    });
  } catch (error: any) {
    return res.status(500).json({ mensaje: error.message });
  }
}
