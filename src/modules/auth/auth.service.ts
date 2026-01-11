import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { authRepo, UsuarioRow } from "./auth.repo";
import { ROL_ID, type RolId } from "../../constants/roles";
import crypto from "crypto";
import { getTransporter, MAIL_FROM } from "../../config/mailer";
import { buildResetPasswordEmail } from "./auth.mail";
import { AppError } from "../../utils/appError";

const MAX_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
const LOCK_MINUTES = Number(process.env.LOCK_MINUTES || 10);

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

    if (!user)
      throw new AppError(
        "Credenciales inválidas",
        400,
        "AUTH_INVALID_CREDENTIALS"
      );

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

    // 2) Si ya pasó el bloqueo, limpia (opcional recomendado)
    if (user.BloqueadoHasta && new Date(user.BloqueadoHasta) <= new Date()) {
      await authRepo.resetIntentos(user.UsuarioId); // también pone BloqueadoHasta = NULL
    }

    const ok = await bcrypt.compare(input.password, user.PasswordHash);

    if (!ok) {
      await authRepo.sumarIntento(user.UsuarioId);
      const intentosActuales = (user.IntentosLoginFallidos ?? 0) + 1;

      // si llegó al límite -> bloquear ahora
      if (intentosActuales >= MAX_ATTEMPTS) {
        await authRepo.bloquearUsuario(user.UsuarioId, LOCK_MINUTES);

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
          remainingAttempts: MAX_ATTEMPTS - intentosActuales,
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

    switch (flow) {
      case LoginFlow.FIRST_LOGIN:
        // marcar como ya ingresó
        await authRepo.marcarPrimerLogin(user.UsuarioId);

        return {
          usuarioId: user.UsuarioId,
          rolId: user.RolId,
          nombre: user.Nombre,
          token,
          primerLogin: true,
        };

      case LoginFlow.NORMAL_LOGIN:
      default:
        return {
          usuarioId: user.UsuarioId,
          rolId: user.RolId,
          nombre: user.Nombre,
          token,
          primerLogin: false,
        };
    }
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

    // ✅ enviar por correo (Gmail)
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

    // DEV: devolvemos token para que puedas probar
    return {
      mensaje: "Si el correo existe, se enviará un código de recuperación.",
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
