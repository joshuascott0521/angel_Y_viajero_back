// src/middlewares/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[ERROR]", err);

  // Errores controlados (los que lanzamos a propósito)
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      mensaje: err.message,
    });
  }

  // Errores normales de JS
  if (err instanceof Error) {
    return res.status(500).json({
      mensaje: err.message,
    });
  }

  // Cualquier otra cosa rara
  return res.status(500).json({
    mensaje: "Error interno del servidor",
  });
}
