import type { Request, Response } from "express";
import { serviciosService } from "./servicios.service";

const handle = (res: Response, err: any) =>
  res.status(err?.status ?? 500).json({ mensaje: err?.message ?? "Error interno" });

export const getBySolicitudId = async (req: Request, res: Response) => {
  try {
    const data = await serviciosService.getBySolicitudId(req);
    return res.json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};

export const completar = async (req: Request, res: Response) => {
  try {
    const data = await serviciosService.completar(req);
    return res.json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};

export const calificar = async (req: Request, res: Response) => {
  try {
    const data = await serviciosService.calificar(req);
    return res.json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};

export const getByAngel = async (req: Request, res: Response) => {
  try {
    const data = await serviciosService.getByAngel(req);
    return res.json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};

export const getByViajero = async (req: Request, res: Response) => {
  try {
    const data = await serviciosService.getByViajero(req);
    return res.json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};
