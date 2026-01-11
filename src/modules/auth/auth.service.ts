import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { authRepo } from "./auth.repo";
import { ROL_ID, type RolId } from "../../constants/roles";
import crypto from "crypto";

const MAX_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);

function signToken(payload: { usuarioId: string; rolId: RolId }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está configurado");
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN ??
    "9h") as SignOptions["expiresIn"];

  return jwt.sign({ rolId: payload.rolId }, secret, {
    subject: payload.usuarioId,
    expiresIn,
  });
}

export const authService = {
  async register(input: {
    nombre: string;
    edad: number;
    correo: string;
    password: string;
    rolId: RolId;
  }) {
    const correo = input.correo.trim().toLowerCase();

    const existing = await authRepo.findByCorreo(correo);
    if (existing) throw new Error("El correo ya está registrado");

    const hash = await bcrypt.hash(input.password, 10);

    const creado = await authRepo.createUsuario({
      nombre: input.nombre,
      edad: input.edad,
      correo,
      passwordHash: hash,
      rolId: input.rolId,
    });

    const token = signToken({
      usuarioId: creado.UsuarioId,
      rolId: input.rolId,
    });
    return { usuarioId: creado.UsuarioId, rolId: input.rolId, token };
  },

  async login(input: { correo: string; password: string }) {
    const correo = input.correo.trim().toLowerCase();
    const user = await authRepo.findByCorreo(correo);

    if (!user) throw new Error("Credenciales inválidas");

    if ((user.IntentosLoginFallidos ?? 0) >= MAX_ATTEMPTS) {
      throw new Error("Demasiados intentos. Intenta más tarde.");
    }

    const ok = await bcrypt.compare(input.password, user.PasswordHash);
    if (!ok) {
      await authRepo.sumarIntento(user.UsuarioId);
      throw new Error("Credenciales inválidas");
    }

    await authRepo.resetIntentos(user.UsuarioId);

    const token = signToken({
      usuarioId: user.UsuarioId,
      rolId: user.RolId as RolId,
    });

    return {
      usuarioId: user.UsuarioId,
      rolId: user.RolId,
      nombre: user.Nombre, // ✅ nuevo
      token,
    };
  },

  async me(usuarioId: string) {
    const u = await authRepo.getById(usuarioId);
    if (!u) throw new Error("Usuario no encontrado");
    return u;
  },

  async forgotPassword(input: { correo: string }) {
    const correo = input.correo.trim().toLowerCase();
    const user = await authRepo.findByCorreo(correo);

    // Seguridad: no revelamos si el correo existe o no
    if (!user) {
      return {
        mensaje: "Si el correo existe, se enviará un código de recuperación.",
      };
    }

    // ✅ NUEVO: invalidar tokens anteriores activos (deja solo el último válido)
    await authRepo.invalidateActiveResetTokens(user.UsuarioId);

    // token aleatorio
    const token = crypto.randomBytes(24).toString("hex"); // 48 chars
    const tokenHash = authRepo.hashToken(token);

    const expiraEn = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await authRepo.createResetToken({
      usuarioId: user.UsuarioId,
      tokenHash,
      expiraEn,
    });

    // DEV: devolvemos token para que puedas probar
    return {
      mensaje: "Token generado (DEV). En producción se enviaría por correo.",
      correo,
      token,
      expiraEn,
    };
  },

  async resetPassword(input: {
    correo: string;
    token: string;
    newPassword: string;
  }) {
    const correo = input.correo.trim().toLowerCase();
    const user = await authRepo.findByCorreo(correo);

    // misma idea: si no existe, no revelamos
    if (!user) throw new Error("Token inválido o expirado");

    const tokenHash = authRepo.hashToken(input.token);
    const tokenRow = await authRepo.findValidResetToken({
      usuarioId: user.UsuarioId,
      tokenHash,
    });

    if (!tokenRow) throw new Error("Token inválido o expirado");

    const newHash = await bcrypt.hash(input.newPassword, 10);

    // Importante: marcar token usado + cambiar password
    await authRepo.updatePasswordHash({
      usuarioId: user.UsuarioId,
      passwordHash: newHash,
    });
    await authRepo.markResetTokenUsed(tokenRow.PasswordResetTokenId);
  },
};
