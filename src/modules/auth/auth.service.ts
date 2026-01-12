import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { authRepo, type UsuarioRow } from "./auth.repo";
import { type RolId } from "../../constants/roles";
import crypto from "crypto";
import { getTransporter, MAIL_FROM } from "../../config/mailer";
import { buildResetPasswordEmail } from "./auth.mail";
import { AppError } from "../../utils/appError";
import { perfilesRepo } from "../perfiles/perfiles.repo";

// Configuraciones de seguridad
const MAX_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
const LOCK_MINUTES = Number(process.env.LOCK_MINUTES || 10);

// Flujos de login
enum LoginFlow {
  FIRST_LOGIN = "FIRST_LOGIN",
  NORMAL_LOGIN = "NORMAL_LOGIN",
}

function getLoginFlow(user: UsuarioRow): LoginFlow {
  switch (true) {
    case user.PrimerLogin === true:
      return LoginFlow.FIRST_LOGIN;
    default:
      return LoginFlow.NORMAL_LOGIN;
  }
}

function signToken(payload: { usuarioId: string; rolId: RolId }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no está configurado");

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

    if (!user) {
      throw new AppError(
        "Credenciales inválidas",
        400,
        "AUTH_INVALID_CREDENTIALS"
      );
    }

    // 1) Si está bloqueado
    if (user.BloqueadoHasta && new Date(user.BloqueadoHasta) > new Date()) {
      const ms = new Date(user.BloqueadoHasta).getTime() - Date.now();
      const retryAfterSeconds = Math.max(1, Math.ceil(ms / 1000));

      throw new AppError(
        "Cuenta bloqueada temporalmente por demasiados intentos.",
        429,
        "AUTH_TEMP_LOCKED",
        { retryAfterSeconds }
      );
    }

    // 2) Si ya pasó el bloqueo, limpiamos (recomendado)
    if (user.BloqueadoHasta && new Date(user.BloqueadoHasta) <= new Date()) {
      await authRepo.resetIntentos(user.UsuarioId);
    }

    const ok = await bcrypt.compare(input.password, user.PasswordHash);

    if (!ok) {
      // ✅ ahora el SP suma intento y, si llega al umbral, bloquea
      const r = await authRepo.addFailedLoginAttempt({
        usuarioId: user.UsuarioId,
        maxIntentos: MAX_ATTEMPTS,
        minutosBloqueo: LOCK_MINUTES,
      });

      const intentos = Number(r.IntentosLoginFallidos ?? 0);

      // Si el SP dejó BloqueadoHasta, ya está bloqueado
      if (r.BloqueadoHasta && new Date(r.BloqueadoHasta) > new Date()) {
        throw new AppError(
          `Demasiados intentos. Bloqueado por ${LOCK_MINUTES} minutos.`,
          429,
          "AUTH_TEMP_LOCKED",
          { retryAfterSeconds: LOCK_MINUTES * 60 }
        );
      }

      throw new AppError(
        "Credenciales inválidas",
        400,
        "AUTH_INVALID_CREDENTIALS",
        {
          remainingAttempts: Math.max(0, MAX_ATTEMPTS - intentos),
        }
      );
    }

    // éxito
    await authRepo.resetIntentos(user.UsuarioId);

    const token = signToken({
      usuarioId: user.UsuarioId,
      rolId: user.RolId as RolId,
    });
    const flow = getLoginFlow(user);

    const isAngel = Number(user.RolId) === 2;

    const angelStats = isAngel
      ? await authRepo.getAngelStatsFromServicios(user.UsuarioId) // ✅ PerfilAngelId = UsuarioId
      : null;

    switch (flow) {
      case LoginFlow.FIRST_LOGIN:
        await authRepo.marcarPrimerLogin(user.UsuarioId);

        return {
          usuarioId: user.UsuarioId,
          rolId: user.RolId,
          nombre: user.Nombre,
          token,
          primerLogin: true,
          ...(isAngel ? { statsAngel: angelStats } : {}),
        };

      case LoginFlow.NORMAL_LOGIN:
      default:
        return {
          usuarioId: user.UsuarioId,
          rolId: user.RolId,
          nombre: user.Nombre,
          token,
          primerLogin: false,
          ...(isAngel ? { statsAngel: angelStats } : {}),
        };
    }
  },

  async forgotPassword(input: { correo: string }) {
    const correo = input.correo.trim().toLowerCase();
    const user = await authRepo.findByCorreo(correo);

    if (!user) {
      return {
        mensaje: "Si el correo existe, se enviará un código de recuperación.",
      };
    }

    await authRepo.invalidateActiveResetTokens(user.UsuarioId);

    const token = crypto.randomBytes(6).toString("hex");
    const tokenHash = authRepo.hashToken(token);

    const expiraEn = new Date(Date.now() + 5 * 60 * 1000);

    await authRepo.createResetToken({
      usuarioId: user.UsuarioId,
      tokenHash,
      expiraEn,
    });

    const transporter = getTransporter();
    const { subject, text, html } = buildResetPasswordEmail({
      nombre: user.Nombre,
      token,
      expiraMin: 5,
    });

    await transporter.sendMail({
      from: MAIL_FROM,
      to: user.Correo,
      subject,
      text,
      html,
    });

    return {
      mensaje: "Si el correo existe, se enviará un código de recuperación.",
    };
  },

  async resetPassword(input: { token: string; newPassword: string }) {
    const tokenHash = authRepo.hashToken(input.token);

    const tokenRow = await authRepo.findValidResetTokenByHash(tokenHash);
    if (!tokenRow) {
      throw new AppError(
        "Token inválido o expirado",
        400,
        "RESET_INVALID_TOKEN"
      );
    }

    const newHash = await bcrypt.hash(input.newPassword, 10);

    await authRepo.updatePasswordHash({
      usuarioId: tokenRow.UsuarioId,
      passwordHash: newHash,
    });

    await authRepo.markResetTokenUsed(tokenRow.PasswordResetTokenId);
  },
};
