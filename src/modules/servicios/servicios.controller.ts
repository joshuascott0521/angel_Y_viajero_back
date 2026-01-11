import type { Request, Response } from "express";
import { serviciosService } from "./servicios.service";

export const getBySolicitudId = async (req: Request, res: Response) => {
  try {
    const data = await serviciosService.getBySolicitudId(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

export const completar = async (req: Request, res: Response) => {
  try {
    const data = await serviciosService.completar(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

export const calificar = async (req: Request, res: Response) => {
  try {
    const data = await serviciosService.calificar(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

export const getByAngel = async (req: Request, res: Response) => {
  try {
    const data = await serviciosService.getByAngel(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

export const getActivosByAngel = async (req: Request, res: Response) => {
  try {
    const data = await serviciosService.getActivosByAngel(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

export const getByViajero = async (req: Request, res: Response) => {
  try {
    const data = await serviciosService.getByViajero(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};
