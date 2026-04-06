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
      // 1) personal (Usuario) — solo pasar campos que realmente vienen en el body
      if (body.personal && typeof body.personal === "object") {
        const p = body.personal;
        await perfilesRepo.patchUsuarioPersonal({
          usuarioId,
          ...(Object.prototype.hasOwnProperty.call(p, "nombre") ? { nombre: p.nombre } : {}),
          ...(Object.prototype.hasOwnProperty.call(p, "correo") ? { correo: p.correo } : {}),
          ...(Object.prototype.hasOwnProperty.call(p, "telefono") ? { telefono: p.telefono } : {}),
          ...(Object.prototype.hasOwnProperty.call(p, "edad") ? { edad: p.edad } : {}),
        });
      }

      // 2) PERFIL VIAJERO — lee de body.perfil (formato del frontend)
      const pf = body.perfil && typeof body.perfil === "object" ? body.perfil : null;
      if (pf) {
        await perfilesRepo.patchPerfilViajero({
          usuarioId,
          ...(Object.prototype.hasOwnProperty.call(pf, "zonaId")
            ? { zonaId: pf.zonaId != null ? Number(pf.zonaId) : undefined }
            : {}),
          ...(Object.prototype.hasOwnProperty.call(pf, "tipoDiscapacidadId")
            ? { tipoDiscapacidadId: pf.tipoDiscapacidadId != null ? Number(pf.tipoDiscapacidadId) : undefined }
            : {}),
          ...(Object.prototype.hasOwnProperty.call(pf, "interesesTuristicos")
            ? { interesesTuristicos: pf.interesesTuristicos ?? null }
            : {}),
          ...(Object.prototype.hasOwnProperty.call(pf, "requerimientosAdicionales")
            ? { requerimientosAdicionales: pf.requerimientosAdicionales ?? null }
            : {}),
        });
      }

      // 3) paisOrigen vive en body.personal (después de asegurar fila en PerfilViajero)
      if (body.personal && typeof body.personal === "object") {
        if (Object.prototype.hasOwnProperty.call(body.personal, "paisOrigen")) {
          await perfilesRepo.patchPerfilViajero({
            usuarioId,
            paisOrigen: body.personal.paisOrigen ?? null,
          });
        }
      }

      // asistencias — acepta body.asistenciasIds (array de números)
      // o body.asistencias (array de objetos con tipoAsistenciaId) — formato del frontend
      if (Object.prototype.hasOwnProperty.call(body, "asistenciasIds")) {
        const ids = Array.isArray(body.asistenciasIds)
          ? body.asistenciasIds.map(Number)
          : [];
        await perfilesRepo.replaceViajeroAsistencias({ usuarioId, tipoAsistenciaIds: ids });
      } else if (Array.isArray(body.asistencias)) {
        const ids = body.asistencias
          .map((a: any) => Number(a.tipoAsistenciaId ?? a.id))
          .filter((n: number) => !isNaN(n));
        await perfilesRepo.replaceViajeroAsistencias({ usuarioId, tipoAsistenciaIds: ids });
      }

      // contacto emergencia — acepta parentesco o relacion (alias del frontend)
      if (Object.prototype.hasOwnProperty.call(body, "contactoEmergencia")) {
        const ce = body.contactoEmergencia;
        if (ce && typeof ce === "object") {
          await perfilesRepo.upsertContactoEmergencia({
            usuarioId,
            nombre: ce.nombre,
            telefono: ce.telefono,
            parentesco: ce.parentesco ?? ce.relacion ?? "",
          });
        }
      }

      // idiomas — acepta body.idiomaIds (array de números)
      // o body.idiomas (array de objetos con idiomaId) — formato del frontend
      if (Object.prototype.hasOwnProperty.call(body, "idiomaIds")) {
        const ids = Array.isArray(body.idiomaIds) ? body.idiomaIds.map(Number) : [];
        await perfilesRepo.replaceUsuarioIdiomas({ usuarioId, idiomaIds: ids });
      } else if (Array.isArray(body.idiomas)) {
        const ids = body.idiomas
          .map((i: any) => Number(i.idiomaId ?? i.id))
          .filter((n: number) => !isNaN(n));
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
        await perfilesRepo.replaceAngelHabilidades({
          usuarioId,
          habilidadIds: ids,
        });
      }

      if (Object.prototype.hasOwnProperty.call(body, "idiomaIds")) {
        const ids = Array.isArray(body.idiomaIds)
          ? body.idiomaIds.map(Number)
          : [];
        await perfilesRepo.replaceAngelIdiomas({ usuarioId, idiomaIds: ids });
      }

      if (Object.prototype.hasOwnProperty.call(body, "zonaIds")) {
        const ids = Array.isArray(body.zonaIds) ? body.zonaIds.map(Number) : [];
        await perfilesRepo.replaceAngelZonasCobertura({
          usuarioId,
          zonaIds: ids,
        });
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
