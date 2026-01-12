import sql from "mssql";
import { getPool } from "../../config/db";
import type { RolId } from "../../constants/roles";
import crypto from "crypto";

export type UsuarioRow = {
  UsuarioId: string;
  RolId: number;
  Nombre: string;
  Correo: string;
  PasswordHash: string;
  Estado: number | boolean;
  IntentosLoginFallidos: number;
  BloqueadoHasta: Date | null;
  PrimerLogin: boolean;
};

export type FailedAttemptResult = {
  Ok: boolean;
  Code: string; // ATTEMPT_UPDATED
  IntentosLoginFallidos: number;
  BloqueadoHasta: Date | null;
};

export type AngelStatsRow = {
  PersonasAyudadas: number;
  HorasServicio: number;
  Rating: number;
};

// encripta un token usando SHA256
function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const authRepo = {
  // SP: dbo.Auth_GetUsuarioByCorreo
  async findByCorreo(correo: string): Promise<UsuarioRow | null> {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("Correo", sql.VarChar(120), correo.trim().toLowerCase())
      .execute("dbo.Auth_GetUsuarioByCorreo");

    return r.recordset?.[0] ?? null;
  },

  // SP: dbo.Auth_MarcarPrimerLogin
  async marcarPrimerLogin(usuarioId: string) {
    const pool = await getPool();
    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .execute("dbo.Auth_MarcarPrimerLogin");
  },

  // SP: dbo.Auth_CreateUsuario
  async createUsuario(input: {
    nombre: string;
    correo: string;
    passwordHash: string;
    rolId: RolId;
  }): Promise<{ UsuarioId: string }> {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("Nombre", sql.VarChar(200), input.nombre)
      .input("Correo", sql.VarChar(120), input.correo.trim().toLowerCase())
      .input("PasswordHash", sql.VarChar(255), input.passwordHash)
      .input("RolId", sql.Int, input.rolId)
      .execute("dbo.Auth_CreateUsuario");

    return { UsuarioId: r.recordset[0].UsuarioId };
  },

  // SP: dbo.Auth_ResetLoginAttempts
  async resetIntentos(usuarioId: string) {
    const pool = await getPool();
    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .execute("dbo.Auth_ResetLoginAttempts");
  },

  // SP: dbo.Auth_AddFailedLoginAttempt (también puede bloquear)
  async addFailedLoginAttempt(input: {
    usuarioId: string;
    maxIntentos: number;
    minutosBloqueo: number;
  }): Promise<FailedAttemptResult> {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("MaxIntentos", sql.Int, input.maxIntentos)
      .input("MinutosBloqueo", sql.Int, input.minutosBloqueo)
      .execute("dbo.Auth_AddFailedLoginAttempt");

    return r.recordset?.[0] as FailedAttemptResult;
  },

  // SP: dbo.Auth_BlockUsuario (por si lo quieres usar manual/admin)
  async bloquearUsuario(usuarioId: string, minutos: number) {
    const pool = await getPool();
    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .input("Minutos", sql.Int, minutos)
      .execute("dbo.Auth_BlockUsuario");
  },

  // Repositorio para tokens
  hashToken,

  // SP: dbo.Auth_CreateResetToken
  async createResetToken(input: {
    usuarioId: string;
    tokenHash: string;
    expiraEn: Date;
  }) {
    const pool = await getPool();
    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("TokenHash", sql.VarChar(255), input.tokenHash)
      .input("ExpiraEn", sql.DateTime2(0), input.expiraEn)
      .execute("dbo.Auth_CreateResetToken");
  },

  // SP: dbo.Auth_FindValidResetTokenByHash
  async findValidResetTokenByHash(tokenHash: string) {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("TokenHash", sql.VarChar(255), tokenHash)
      .execute("dbo.Auth_FindValidResetTokenByHash");

    return r.recordset?.[0] ?? null;
  },

  // SP: dbo.Auth_MarkResetTokenUsed
  async markResetTokenUsed(passwordResetTokenId: string) {
    const pool = await getPool();
    await pool
      .request()
      .input("PasswordResetTokenId", sql.UniqueIdentifier, passwordResetTokenId)
      .execute("dbo.Auth_MarkResetTokenUsed");
  },

  // SP: dbo.Auth_InvalidateActiveResetTokens
  async invalidateActiveResetTokens(usuarioId: string) {
    const pool = await getPool();
    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .execute("dbo.Auth_InvalidateActiveResetTokens");
  },

  // SP: dbo.Auth_UpdatePasswordHash (resetea intentos y desbloquea)
  async updatePasswordHash(input: { usuarioId: string; passwordHash: string }) {
    const pool = await getPool();
    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("PasswordHash", sql.VarChar(255), input.passwordHash)
      .execute("dbo.Auth_UpdatePasswordHash");
  },

  async getAngelStatsFromServicios(perfilAngelId: string): Promise<AngelStatsRow> {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("PerfilAngelId", sql.UniqueIdentifier, perfilAngelId)
      .execute("dbo.Angel_GetStatsFromServicios");

    return r.recordset?.[0] ?? { PersonasAyudadas: 0, HorasServicio: 0, Rating: 0 };
  },
};
