import { chatRepo } from "./chat.repo";

export const chatService = {
  inbox(usuarioId: string) {
    return chatRepo.inboxByUsuario(usuarioId);
  },

  mensajes(solicitudId: string, usuarioId: string, take: number) {
    return chatRepo.mensajesGetBySolicitud({ solicitudId, usuarioId, take });
  },

  async leer(solicitudId: string, usuarioId: string, hastaChatMensajeId: number | null) {
    return chatRepo.marcarLeidos({ solicitudId, usuarioId, hastaChatMensajeId });
  },

  // opcional
  async noLeidos(solicitudId: string, usuarioId: string) {
    return chatRepo.noLeidosBySolicitud({ solicitudId, usuarioId });
  },
};
