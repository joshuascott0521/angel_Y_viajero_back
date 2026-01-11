import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ROL_ID, type RolId } from "../constants/roles";

export function authJwt(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ mensaje: "Token requerido" });
    }

    const token = header.slice(7);
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as any;

    const usuarioId = decoded.sub as string;
    const rolIdNum = Number(decoded.rolId);

    const rolesValidos = Object.values(ROL_ID) as RolId[];
    if (!usuarioId || !rolesValidos.includes(rolIdNum as RolId)) {
      return res.status(401).json({ mensaje: "Token inválido" });
    }

    req.user = { usuarioId, rolId: rolIdNum as RolId };
    return next();
  } catch {
    return res.status(401).json({ mensaje: "Token inválido" });
  }
}
