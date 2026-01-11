import sql from "mssql";
import { getPool } from "../../config/db";

export const catalogosRepo = {
  async getIdiomas() {
    const pool = await getPool();
    const r = await pool.request().query(`
      SELECT IdiomaId, Nombre
      FROM dbo.Idioma
      ORDER BY IdiomaId;
    `);
    return r.recordset;
  },

  async getHabilidades() {
    const pool = await getPool();
    const r = await pool.request().query(`
      SELECT HabilidadId, Nombre
      FROM dbo.Habilidad
      ORDER BY HabilidadId;
    `);
    return r.recordset;
  },

  async getTiposAsistencia() {
    const pool = await getPool();
    const r = await pool.request().query(`
      SELECT Id, Titulo, Subtitulo
      FROM dbo.TipoAsistencia
      ORDER BY Id;
    `);
    return r.recordset;
  },

  async getTiposDiscapacidad() {
    const pool = await getPool();
    const r = await pool.request().query(`
      SELECT Id, Nombre
      FROM dbo.TipoDiscapacidad
      ORDER BY Id;
    `);
    return r.recordset;
  },

  async getCiudades() {
    const pool = await getPool();
    const r = await pool.request().query(`
      SELECT CiudadId, Nombre
      FROM dbo.Ciudad
      ORDER BY CiudadId;
    `);
    return r.recordset;
  },

  async getZonas(ciudadId: number | null) {
    const pool = await getPool();
    const req = pool.request();

    if (ciudadId) {
      req.input("CiudadId", sql.Int, ciudadId);
    }

    const r = await req.query(`
      SELECT
        z.ZonaId,
        z.Nombre AS Zona,
        c.CiudadId,
        c.Nombre AS Ciudad
      FROM dbo.Zona z
      JOIN dbo.Ciudad c ON c.CiudadId = z.CiudadId
      ${ciudadId ? "WHERE z.CiudadId = @CiudadId" : ""}
      ORDER BY c.Nombre, z.Nombre;
    `);

    return r.recordset;
  },
};
