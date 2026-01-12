import type { Request, Response } from "express";
import { catalogosRepo } from "./catalogos.repo";

export const getIdiomas = async (_: Request, res: Response) =>
  res.json(await catalogosRepo.getIdiomas());

export const getHabilidades = async (_: Request, res: Response) =>
  res.json(await catalogosRepo.getHabilidades());

export const getTiposAsistencia = async (_: Request, res: Response) =>
  res.json(await catalogosRepo.getTiposAsistencia());

export const getTiposDiscapacidad = async (_: Request, res: Response) =>
  res.json(await catalogosRepo.getTiposDiscapacidad());

export const getCiudades = async (_: Request, res: Response) =>
  res.json(await catalogosRepo.getCiudades());

export const getDuracionEstimada = async (_: Request, res: Response) =>
  res.json(await catalogosRepo.getDuracionEstimada());

export const getZonas = async (req: Request, res: Response) => {
  const ciudadId = req.query.ciudadId ? Number(req.query.ciudadId) : null;
  res.json(await catalogosRepo.getZonas(ciudadId));
};
