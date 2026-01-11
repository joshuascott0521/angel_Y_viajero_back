import sql from "mssql";
import { getPool } from "../../config/db";

export const serviciosRepo = {
  async getBySolicitudId(solicitudId: string) {
    const pool = await getPool();
    const req = pool.request();
    req.input("SolicitudId", sql.UniqueIdentifier, solicitudId);

    const r = await req.execute("dbo.ServicioGetBySolicitudId");
    return r.recordset[0] ?? null;
  },

  async completar(p: { solicitudId: string; usuarioCompletaId: string; observacionFinal: string | null }) {
    const pool = await getPool();
    const req = pool.request();
    req.input("SolicitudId", sql.UniqueIdentifier, p.solicitudId);
    req.input("UsuarioCompletaId", sql.UniqueIdentifier, p.usuarioCompletaId);
    req.input("ObservacionFinal", sql.VarChar(400), p.observacionFinal);

    const r = await req.execute("dbo.ServicioCompletar");
    return r.recordset[0];
  },

  async getByAngel(perfilAngelId: string) {
    const pool = await getPool();
    const req = pool.request();
    req.input("PerfilAngelId", sql.UniqueIdentifier, perfilAngelId);

    const r = await req.execute("dbo.ServiciosGetByAngel");
    return r.recordset;
  },

  async getActivosByAngel(perfilAngelId: string) {
    const pool = await getPool();
    const req = pool.request();
    req.input("PerfilAngelId", sql.UniqueIdentifier, perfilAngelId);

    const r = await req.execute("dbo.ServiciosGetActivosByAngel");
    return r.recordset;
  },

  async getByViajero(perfilViajeroId: string) {
    const pool = await getPool();
    const req = pool.request();
    req.input("PerfilViajeroId", sql.UniqueIdentifier, perfilViajeroId);

    const r = await req.execute("dbo.ServiciosGetByViajero");
    return r.recordset;
  },

  async calificar(p: {
    solicitudId: string;
    perfilViajeroId: string;
    calificacion: number;
    comentario: string | null;
  }) {
    const pool = await getPool();
    const req = pool.request();

    req.input("SolicitudId", sql.UniqueIdentifier, p.solicitudId);
    req.input("PerfilViajeroId", sql.UniqueIdentifier, p.perfilViajeroId);
    req.input("Calificacion", sql.TinyInt, p.calificacion);
    req.input("Comentario", sql.VarChar(300), p.comentario);

    const r = await req.execute("dbo.ServicioCalificar");
    return r.recordset[0];
  },
};
