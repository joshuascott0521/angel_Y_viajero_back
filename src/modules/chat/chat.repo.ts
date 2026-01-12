import sql from "mssql";
import { getPool } from "../../config/db";
import type { ChatInboxItemDTO, ChatMensajeDTO } from "./chat.types";

export const chatRepo = {
  async inboxByUsuario(usuarioId: string): Promise<ChatInboxItemDTO[]> {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId)
      .execute("dbo.ChatInboxByUsuario");

    return (r.recordset ?? []).map((x: any) => ({
      solicitudId: String(x.SolicitudId),
      solicitudEstadoId: Number(x.SolicitudEstadoId),
      estadoSolicitud: String(x.EstadoSolicitud),
      otroUsuarioId: String(x.OtroUsuarioId),
      otroNombre: String(x.OtroNombre),
      ultimoChatMensajeId: x.UltimoChatMensajeId != null ? Number(x.UltimoChatMensajeId) : null,
      ultimoMensaje: x.UltimoMensaje != null ? String(x.UltimoMensaje) : null,
      fechaUltimoMensaje: x.FechaUltimoMensaje != null ? new Date(x.FechaUltimoMensaje).toISOString() : null,
      noLeidos: x.NoLeidos != null ? Number(x.NoLeidos) : 0,
    }));
  },

  async mensajesGetBySolicitud(input: {
    solicitudId: string;
    usuarioId: string;
    take: number;
  }): Promise<ChatMensajeDTO[]> {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("SolicitudId", sql.UniqueIdentifier, input.solicitudId)
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("Take", sql.Int, input.take)
      .execute("dbo.ChatMensajesGetBySolicitud");

    return (r.recordset ?? []).map((x: any) => ({
      chatMensajeId: Number(x.ChatMensajeId),
      solicitudId: String(x.SolicitudId),
      emisorUsuarioId: String(x.EmisorUsuarioId),
      emisorNombre: String(x.EmisorNombre),
      mensaje: String(x.Mensaje),
      fechaEnvio: new Date(x.FechaEnvio).toISOString(),
      leidoPorMi: Number(x.LeidoPorMi) === 1,
      fechaLectura: x.FechaLectura != null ? new Date(x.FechaLectura).toISOString() : null,
    }));
  },

  async marcarLeidos(input: {
    solicitudId: string;
    usuarioId: string;
    hastaChatMensajeId: number | null;
  }): Promise<{ mensajesMarcados: number }> {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("SolicitudId", sql.UniqueIdentifier, input.solicitudId)
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("HastaChatMensajeId", sql.BigInt, input.hastaChatMensajeId ?? null)
      .execute("dbo.ChatMarcarLeidos");

    const row = r.recordset?.[0];
    return { mensajesMarcados: row?.MensajesMarcados != null ? Number(row.MensajesMarcados) : 0 };
  },

  // ✅ Solo si creaste dbo.ChatNoLeidosBySolicitud
  async noLeidosBySolicitud(input: { solicitudId: string; usuarioId: string }): Promise<number> {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("SolicitudId", sql.UniqueIdentifier, input.solicitudId)
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .execute("dbo.ChatNoLeidosBySolicitud");

    return r.recordset?.[0]?.NoLeidos != null ? Number(r.recordset[0].NoLeidos) : 0;
  },
};
