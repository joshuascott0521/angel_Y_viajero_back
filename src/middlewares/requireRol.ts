import type { Request, Response, NextFunction } from "express";
import { RolId } from "../constants/roles";

export function requireRole(...roles: RolId[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ mensaje: "No autenticado" });
    if (!roles.includes(req.user.rolId)) {
      return res.status(403).json({ mensaje: "No autorizado para este rol" });
    }
    return next();
  };
}
