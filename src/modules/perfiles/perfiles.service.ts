import { perfilesRepo } from "./perfiles.repo";

export const perfilesService = {
  // Gets
  async getPerfilViajero(usuarioId: string) {
    try {
      return await perfilesRepo.getPerfilViajero(usuarioId);
    } catch (error) {
      console.error("[getPerfilViajero]", error);
      throw new Error("Error obteniendo perfil viajero");
    }
  },

  async getPerfilAngel(usuarioId: string) {
    try {
      return await perfilesRepo.getPerfilAngel(usuarioId);
    } catch (error) {
      console.error("[getPerfilAngel]", error);
      throw new Error("Error obteniendo perfil ángel");
    }
  },

  // PATCH VIAJERO
  async patchPerfilViajero(usuarioId: string, body: any) {
    try {
      // personal
      if (body.personal && typeof body.personal === "object") {
        await perfilesRepo.patchUsuarioPersonal({
          usuarioId,
          nombre: body.personal.nombre,
          correo: body.personal.correo,
          telefono: body.personal.telefono,
          edad: body.personal.edad,
        });

        if (Object.prototype.hasOwnProperty.call(body.personal, "paisOrigen")) {
          await perfilesRepo.patchPerfilViajero({
            usuarioId,
            paisOrigen: body.personal.paisOrigen ?? null,
          });
        }
      }

      // perfil viajero
      await perfilesRepo.patchPerfilViajero({
        usuarioId,
        ...(Object.prototype.hasOwnProperty.call(body, "zonaId")
          ? { zonaId: Number(body.zonaId) }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(body, "tipoDiscapacidadId")
          ? { tipoDiscapacidadId: Number(body.tipoDiscapacidadId) }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(body, "interesesTuristicos")
          ? { interesesTuristicos: body.interesesTuristicos ?? null }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(body, "requerimientosAdicionales")
          ? { requerimientosAdicionales: body.requerimientosAdicionales ?? null }
          : {}),
      });

      // asistencias
      if (Object.prototype.hasOwnProperty.call(body, "asistenciasIds")) {
        const ids = Array.isArray(body.asistenciasIds)
          ? body.asistenciasIds.map(Number)
          : [];
        await perfilesRepo.replaceViajeroAsistencias({
          usuarioId,
          tipoAsistenciaIds: ids,
        });
      }

      // contacto emergencia
      if (Object.prototype.hasOwnProperty.call(body, "contactoEmergencia")) {
        const ce = body.contactoEmergencia;
        if (ce && typeof ce === "object") {
          await perfilesRepo.upsertContactoEmergencia({
            usuarioId,
            nombre: ce.nombre,
            telefono: ce.telefono,
            parentesco: ce.parentesco,
          });
        }
      }

      // idiomas
      if (Object.prototype.hasOwnProperty.call(body, "idiomaIds")) {
        const ids = Array.isArray(body.idiomaIds)
          ? body.idiomaIds.map(Number)
          : [];
        await perfilesRepo.replaceUsuarioIdiomas({ usuarioId, idiomaIds: ids });
      }

      return await perfilesRepo.getPerfilViajero(usuarioId);
    } catch (error) {
      console.error("[patchPerfilViajero]", error);
      throw new Error("Error actualizando perfil viajero");
    }
  },

  // PATCH ANGEL
  async patchPerfilAngel(usuarioId: string, body: any) {
    try {
      if (body.perfil && typeof body.perfil === "object") {
        await perfilesRepo.patchPerfilAngel({
          usuarioId,
          disponibilidad: body.perfil.disponibilidad,
          biografia: body.perfil.biografia,
          zonaBaseId: body.perfil.zonaBaseId,
        });
      }

      if (Object.prototype.hasOwnProperty.call(body, "habilidadIds")) {
        const ids = Array.isArray(body.habilidadIds)
          ? body.habilidadIds.map(Number)
          : [];
        await perfilesRepo.replaceAngelHabilidades({ usuarioId, habilidadIds: ids });
      }

      if (Object.prototype.hasOwnProperty.call(body, "idiomaIds")) {
        const ids = Array.isArray(body.idiomaIds)
          ? body.idiomaIds.map(Number)
          : [];
        await perfilesRepo.replaceAngelIdiomas({ usuarioId, idiomaIds: ids });
      }

      if (Object.prototype.hasOwnProperty.call(body, "zonaIds")) {
        const ids = Array.isArray(body.zonaIds) ? body.zonaIds.map(Number) : [];
        await perfilesRepo.replaceAngelZonasCobertura({ usuarioId, zonaIds: ids });
      }

      if (Object.prototype.hasOwnProperty.call(body, "disponibilidadSemanal")) {
        const dias = Array.isArray(body.disponibilidadSemanal)
          ? body.disponibilidadSemanal
          : [];
        await perfilesRepo.upsertAngelDisponibilidad({ usuarioId, dias });
      }

      return await perfilesRepo.getPerfilAngel(usuarioId);
    } catch (error) {
      console.error("[patchPerfilAngel]", error);
      throw new Error("Error actualizando perfil ángel");
    }
  },
};
