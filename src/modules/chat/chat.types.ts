export type ChatInboxItemDTO = {
  solicitudId: string;
  solicitudEstadoId: number;
  estadoSolicitud: string;
  otroUsuarioId: string;
  otroNombre: string;
  ultimoChatMensajeId: number | null;
  ultimoMensaje: string | null;
  fechaUltimoMensaje: string | null;
  noLeidos: number;
};

export type ChatMensajeDTO = {
  chatMensajeId: number;
  solicitudId: string;
  emisorUsuarioId: string;
  emisorNombre: string;
  mensaje: string;
  fechaEnvio: string;
  leidoPorMi: boolean;
  fechaLectura: string | null;
};

export type MarcarLeidosResultDTO = {
  mensajesMarcados: number;
};
