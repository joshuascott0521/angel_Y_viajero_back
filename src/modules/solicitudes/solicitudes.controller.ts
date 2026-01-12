import type { Request, Response } from "express";
import { solicitudesService } from "./solicitudes.service";

const handle = (res: Response, err: any) =>
  res.status(err?.status ?? 500).json({ mensaje: err?.message ?? "Error interno" });

export const create = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.create(req);
    return res.status(201).json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};

export const responderAngel = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.responderAngel(req);
    return res.json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};

export const cancelarViajero = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.cancelarViajero(req);
    return res.json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};

export const getByAngel = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.getByAngel(req);
    return res.json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};

export const getByViajero = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.getByViajero(req);
    return res.json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.getReviews(req);
    return res.json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};

export const getAngelesSolicitud = async (req: Request, res: Response) => {
  try {
    const data = await solicitudesService.getAngelesSolicitud(req);
    return res.json(data);
  } catch (err: any) {
    return handle(res, err);
  }
};
