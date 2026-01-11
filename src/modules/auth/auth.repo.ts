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
  Estado: number | boolean; // depende tu tabla (BIT o int)
  IntentosLoginFallidos: number;
  BloqueadoHasta: Date | null;
  PrimerLogin: boolean;
};

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const authRepo = {
  async findByCorreo(correo: string): Promise<UsuarioRow | null> {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("Correo", sql.VarChar(120), correo.trim().toLowerCase()).query(`
        SELECT TOP 1
          UsuarioId,
          RolId,
          Nombre,
          Correo,
          PasswordHash,
          Estado,
          IntentosLoginFallidos,
          BloqueadoHasta,
          PrimerLogin
        FROM dbo.Usuario
        WHERE Correo = @Correo;
      `);

    return r.recordset?.[0] ?? null;
  },

  async marcarPrimerLogin(usuarioId: string) {
    const pool = await getPool();
    await pool.request().input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .query(`
      UPDATE dbo.Usuario
      SET PrimerLogin = 0
      WHERE UsuarioId = @UsuarioId;
    `);
  },

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
      .input("PasswordHash", sql.VarChar(200), input.passwordHash)
      .input("RolId", sql.Int, input.rolId).query(`
        DECLARE @NewId UNIQUEIDENTIFIER = NEWID();

        INSERT INTO dbo.Usuario (UsuarioId, Nombre, RolId, Correo, PasswordHash, IntentosLoginFallidos)
        VALUES (@NewId, @Nombre, @RolId, @Correo, @PasswordHash, 0);

        SELECT @NewId AS UsuarioId;
`);

    return { UsuarioId: r.recordset[0].UsuarioId };
  },

  async bloquearUsuario(usuarioId: string, minutos: number) {
    const pool = await getPool();
    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .input("Minutos", sql.Int, minutos).query(`
      UPDATE dbo.Usuario
      SET BloqueadoHasta = DATEADD(MINUTE, @Minutos, SYSUTCDATETIME())
      WHERE UsuarioId = @UsuarioId;
    `);
  },

  async resetIntentos(usuarioId: string) {
    const pool = await getPool();
    await pool.request().input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .query(`
      UPDATE dbo.Usuario
      SET IntentosLoginFallidos = 0,
          BloqueadoHasta = NULL
      WHERE UsuarioId = @UsuarioId;
    `);
  },

  async sumarIntento(usuarioId: string) {
    const pool = await getPool();
    await pool.request().input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .query(`
        UPDATE dbo.Usuario
        SET IntentosLoginFallidos = ISNULL(IntentosLoginFallidos, 0) + 1
        WHERE UsuarioId = @UsuarioId;
      `);
  },

  hashToken,
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
      .input("ExpiraEn", sql.DateTime2, input.expiraEn).query(`
        INSERT INTO dbo.PasswordResetToken (UsuarioId, TokenHash, ExpiraEn, Usado)
        VALUES (@UsuarioId, @TokenHash, @ExpiraEn, 0);
      `);
  },
  async findValidResetTokenByHash(tokenHash: string) {
    const pool = await getPool();

    const r = await pool
      .request()
      .input("TokenHash", sql.VarChar(255), tokenHash).query(`
      SELECT TOP 1
        PasswordResetTokenId,
        UsuarioId,
        ExpiraEn,
        Usado
      FROM dbo.PasswordResetToken
      WHERE TokenHash = @TokenHash
        AND Usado = 0
        AND ExpiraEn >= SYSUTCDATETIME()
      ORDER BY FechaCreacion DESC;
    `);

    return r.recordset?.[0] ?? null;
  },

  async findValidResetToken(input: { usuarioId: string; tokenHash: string }) {
    const pool = await getPool();

    const r = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("TokenHash", sql.VarChar(255), input.tokenHash).query(`
        SELECT TOP 1 PasswordResetTokenId, ExpiraEn, Usado
        FROM dbo.PasswordResetToken
        WHERE UsuarioId = @UsuarioId
          AND TokenHash = @TokenHash
          AND Usado = 0
          AND ExpiraEn >= SYSUTCDATETIME()
        ORDER BY FechaCreacion DESC;
      `);

    return r.recordset?.[0] ?? null;
  },
  async markResetTokenUsed(passwordResetTokenId: string) {
    const pool = await getPool();

    await pool.request().input("Id", sql.UniqueIdentifier, passwordResetTokenId)
      .query(`
        UPDATE dbo.PasswordResetToken
        SET Usado = 1
        WHERE PasswordResetTokenId = @Id;
      `);
  },
  async invalidateActiveResetTokens(usuarioId: string) {
    const pool = await getPool();

    await pool.request().input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .query(`
      UPDATE dbo.PasswordResetToken
      SET Usado = 1
      WHERE UsuarioId = @UsuarioId
        AND Usado = 0
        AND ExpiraEn >= SYSUTCDATETIME();
    `);
  },

  async updatePasswordHash(input: { usuarioId: string; passwordHash: string }) {
    const pool = await getPool();

    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("PasswordHash", sql.VarChar(255), input.passwordHash).query(`
        UPDATE dbo.Usuario
        SET PasswordHash = @PasswordHash,
            IntentosLoginFallidos = 0
        WHERE UsuarioId = @UsuarioId;
      `);
  },
};
