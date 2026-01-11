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

// encripta un token usando SHA256
function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const authRepo = {
  // Buscar usuario por correo
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

  // Marca que el usuario ya no es primer login
  async marcarPrimerLogin(usuarioId: string) {
    const pool = await getPool();
    await pool.request().input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .query(`
      UPDATE dbo.Usuario
      SET PrimerLogin = 0
      WHERE UsuarioId = @UsuarioId;
    `);
  },

  // Crear nuevo usuario
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

  // Bloquea un usuario por X minutos
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

  // Resetea los intentos de login fallidos y desbloquea al usuario
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

  // Suma un intento fallido de login
  async sumarIntento(usuarioId: string) {
    const pool = await getPool();
    await pool.request().input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .query(`
        UPDATE dbo.Usuario
        SET IntentosLoginFallidos = ISNULL(IntentosLoginFallidos, 0) + 1
        WHERE UsuarioId = @UsuarioId;
      `);
  },

  // Repositorio para tokens de reseteo de contraseña
  hashToken,

  // Crea un token de reseteo de contraseña
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

  // Busca un token de reseteo válido por su hash
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

  // Marca un token de reseteo como usado
  async markResetTokenUsed(passwordResetTokenId: string) {
    const pool = await getPool();

    await pool.request().input("Id", sql.UniqueIdentifier, passwordResetTokenId)
      .query(`
        UPDATE dbo.PasswordResetToken
        SET Usado = 1
        WHERE PasswordResetTokenId = @Id;
      `);
  },

  // Invalida todos los tokens activos de reseteo de contraseña de un usuario
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

  // Actualiza el hash de la contraseña de un usuario
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
