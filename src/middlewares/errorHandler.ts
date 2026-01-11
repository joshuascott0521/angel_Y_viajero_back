import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[ERROR]", err);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      ok: false,
      mensaje: err.message,
      code: err.code,
      details: err.details ?? null,
    });
  }

  // NO devuelvas err.message en 500 (seguridad)
  return res.status(500).json({
    ok: false,
    mensaje: "Error interno del servidor",
    code: "INTERNAL_ERROR",
  });
}
