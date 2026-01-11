import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { authJwt } from "../../middlewares/authJwt";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { nombre, edad, correo, password, rol } = req.body;

    if (!nombre || typeof nombre !== "string") {
      return res.status(400).json({ mensaje: "nombre es requerido" });
    }
    if (edad === undefined || Number.isNaN(Number(edad))) {
      return res.status(400).json({ mensaje: "edad es requerida" });
    }
    if (!correo || !password || !rol) {
      return res
        .status(400)
        .json({ mensaje: "correo, password y rol son requeridos" });
    }

    const rolId = rol === "Viajero" ? 1 : rol === "Angel" ? 2 : null;
    if (!rolId) {
      return res
        .status(400)
        .json({ mensaje: "rol debe ser 'Viajero' o 'Angel'" });
    }

    const data = await authService.register({
      nombre: nombre.trim(),
      edad: Number(edad),
      correo,
      password,
      rolId,
    });

    return res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res
        .status(400)
        .json({ mensaje: "correo y password son requeridos" });
    }

    const data = await authService.login({ correo, password });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export const me = [
  authJwt,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await authService.me(req.user!.usuarioId);
      return res.json(data);
    } catch (err) {
      return next(err);
    }
  },
];

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { correo } = req.body;
    if (!correo) {
      return res.status(400).json({ mensaje: "correo es requerido" });
    }

    const result = await authService.forgotPassword({ correo });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { correo, token, newPassword } = req.body;

    if (!correo || !token || !newPassword) {
      return res
        .status(400)
        .json({ mensaje: "correo, token y newPassword son requeridos" });
    }

    await authService.resetPassword({ correo, token, newPassword });
    return res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (err) {
    return next(err);
  }
}
