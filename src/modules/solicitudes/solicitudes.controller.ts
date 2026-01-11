import type { Request, Response } from "express";
import { solicitudesService } from "./solicitudes.service";

export const create = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.create(req);
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

export const responderAngel = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.responderAngel(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

export const cancelarViajero = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.cancelarViajero(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

export const getByAngel = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.getByAngel(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

export const getByViajero = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.getByViajero(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.getReviews(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

export const getAngelesSolicitud = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.getAngelesSolicitud(req);
    return res.json(data);
  } catch (err: any) {
    return res.status(err?.status ?? 400).json({ mensaje: err?.message ?? "Error" });
  }
};

