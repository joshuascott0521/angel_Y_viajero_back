import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOMBRE_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ''\s]{3,100}$/;

function validarPassword(password: string): string | null {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (!/[A-Z]/.test(password)) return "La contraseña debe contener al menos una letra mayúscula";
  if (!/[a-z]/.test(password)) return "La contraseña debe contener al menos una letra minúscula";
  if (!/[0-9]/.test(password)) return "La contraseña debe contener al menos un número";
  return null;
}

// Registro de nuevo usuario endpoint
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { nombre, correo, password, rol } = req.body;

    if (!nombre || typeof nombre !== "string" || !NOMBRE_REGEX.test(nombre.trim())) {
      return res.status(400).json({
        mensaje: "nombre inválido. Solo letras, espacios y acentos, mínimo 3 caracteres",
      });
    }
    if (!correo || !password || !rol) {
      return res.status(400).json({ mensaje: "correo, password y rol son requeridos" });
    }
    if (!EMAIL_REGEX.test(correo.trim())) {
      return res.status(400).json({ mensaje: "El correo electrónico no es válido" });
    }

    const passwordError = validarPassword(password);
    if (passwordError) {
      return res.status(400).json({ mensaje: passwordError });
    }

    const rolId = rol === "Viajero" ? 1 : rol === "Angel" ? 2 : null;
    if (!rolId) {
      return res.status(400).json({ mensaje: "rol debe ser 'Viajero' o 'Angel'" });
    }

    const data = await authService.register({
      nombre: nombre.trim(),
      correo,
      password,
      rolId,
    });

    return res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
}

// Login de usuario endpoint
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ mensaje: "correo y password son requeridos" });
    }
    if (!EMAIL_REGEX.test(correo.trim())) {
      return res.status(400).json({ mensaje: "El correo electrónico no es válido" });
    }

    const data = await authService.login({ correo, password });
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

// Solicitar reseteo de contraseña endpoint
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
    if (!EMAIL_REGEX.test(correo.trim())) {
      return res.status(400).json({ mensaje: "El correo electrónico no es válido" });
    }

    const result = await authService.forgotPassword({ correo });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

// Reseteo de contraseña endpoint
export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ mensaje: "token y newPassword son requeridos" });
    }
    if (typeof token !== "string" || token.trim().length < 6) {
      return res.status(400).json({ mensaje: "Código de verificación inválido" });
    }

    const passwordError = validarPassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ mensaje: passwordError });
    }

    await authService.resetPassword({ token: token.trim(), newPassword });
    return res.json({ exito: true, mensaje: "Contraseña actualizada correctamente" });
  } catch (err) {
    return next(err);
  }
}
