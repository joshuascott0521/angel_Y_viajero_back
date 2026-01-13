import sql from "mssql";
import { getPool } from "../../config/db";

export const solicitudesRepo = {
  async create(p: {
    perfilViajeroId: string;
    perfilAngelId: string;
    tipoAsistenciaId: number;
    duracionEstimadaId: number;
    fechaHoraInicio: string;
    lugar: string;
    detalles: string | null;
  }) {
    const pool = await getPool();
    const req = pool.request();

    req.input("PerfilViajeroId", sql.UniqueIdentifier, p.perfilViajeroId);
    req.input("PerfilAngelId", sql.UniqueIdentifier, p.perfilAngelId);
    req.input("TipoAsistenciaId", sql.Int, p.tipoAsistenciaId);
    req.input("DuracionEstimadaId", sql.TinyInt, p.duracionEstimadaId);
    req.input("FechaHoraInicio", sql.DateTime2(0), new Date(p.fechaHoraInicio));
    req.input("Lugar", sql.VarChar(200), p.lugar);
    req.input("Detalles", sql.VarChar(700), p.detalles);

    const r = await req.execute("dbo.SolicitudCreate");
    return r.recordset[0];
  },

  async responderAngel(p: {
    solicitudId: string;
    perfilAngelId: string;
    aceptar: boolean;
    motivoRechazo: string | null;
  }) {
    const pool = await getPool();
    const req = pool.request();

    req.input("SolicitudId", sql.UniqueIdentifier, p.solicitudId);
    req.input("PerfilAngelId", sql.UniqueIdentifier, p.perfilAngelId);
    req.input("Aceptar", sql.Bit, p.aceptar ? 1 : 0);
    req.input("MotivoRechazo", sql.VarChar(300), p.motivoRechazo);

    const r = await req.execute("dbo.SolicitudResponderAngel");
    return r.recordset[0];
  },

  async cancelarViajero(p: {
    solicitudId: string;
    perfilViajeroId: string;
    motivoCancelacion: string | null;
  }) {
    const pool = await getPool();
    const req = pool.request();

    req.input("SolicitudId", sql.UniqueIdentifier, p.solicitudId);
    req.input("PerfilViajeroId", sql.UniqueIdentifier, p.perfilViajeroId);
    req.input("MotivoCancelacion", sql.VarChar(300), p.motivoCancelacion);

    const r = await req.execute("dbo.SolicitudCancelarViajero");
    return r.recordset[0];
  },

  async getByAngel(perfilAngelId: string) {
    const pool = await getPool();
    const req = pool.request();
    req.input("PerfilAngelId", sql.UniqueIdentifier, perfilAngelId);

    const r = await req.execute("dbo.SolicitudesEnEsperaGetByAngel");
    return r.recordset;
  },

  async getByViajero(perfilViajeroId: string) {
    const pool = await getPool();
    const req = pool.request();
    req.input("PerfilViajeroId", sql.UniqueIdentifier, perfilViajeroId);

    const r = await req.execute("dbo.SolicitudesGetByViajero");
    return r.recordset;
  },

  async getReviews(perfilAngelId: string) {
    const pool = await getPool();
    const req = pool.request();
    req.input("AngelId", sql.UniqueIdentifier, perfilAngelId);

    const r = await req.execute("dbo.ResenasGetByAngel");

    const sets = r.recordsets as sql.IRecordSet<any>[]; // 👈 cast seguro para tu caso

    return {
      resumen: sets?.[0]?.[0] ?? null,
      reviews: sets?.[1] ?? [],
    };
  },

  async getAngelesSolicitud(p: {
    ciudadId: number | null;
    zonaId: number | null;
  }) {
    const pool = await getPool();
    const req = pool.request();

    req.input("CiudadId", sql.Int, p.ciudadId);
    req.input("ZonaId", sql.Int, p.zonaId);

    const r = await req.execute("dbo.AngelesGetAllResumenFiltrado");
    return r.recordset;
  },
};
