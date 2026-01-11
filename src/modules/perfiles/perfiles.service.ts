import { perfilesRepo } from "./perfiles.repo";

export const perfilesService = {
  getPerfilViajero: (usuarioId: string) =>
    perfilesRepo.getPerfilViajero(usuarioId),
  getPerfilAngel: (usuarioId: string) => perfilesRepo.getPerfilAngel(usuarioId),

  async patchPerfilViajero(usuarioId: string, body: any) {
    // personal
    if (body.personal && typeof body.personal === "object") {
      await perfilesRepo.patchUsuarioPersonal({
        usuarioId,
        nombre: body.personal.nombre,
        correo: body.personal.correo,
        telefono: body.personal.telefono,
        edad: body.personal.edad,
      });

      // paisOrigen está en PerfilViajero (no en Usuario)
      if (Object.prototype.hasOwnProperty.call(body.personal, "paisOrigen")) {
        await perfilesRepo.patchPerfilViajero({
          usuarioId,
          paisOrigen: body.personal.paisOrigen ?? null,
        });
      }
    }

    // perfil viajero (zona/tipo/intereses/requerimientos)
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
      ...(Object.prototype.hasOwnProperty.call(
        body,
        "requerimientosAdicionales"
      )
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

    // respuesta final: tu GET existente
    return perfilesRepo.getPerfilViajero(usuarioId);
  },

  async upsertPerfilAngel(input: {
    usuarioId: string;
    disponibilidad?: boolean;
    biografia: string | null;
    zonaBaseId: number | null;
  }) {
    await perfilesRepo.upsertPerfilAngel(input);
    return perfilesRepo.getPerfilAngel(input.usuarioId);
  },

  async patchPerfilAngel(usuarioId: string, body: any) {
    // 1) Perfil base (biografia/disponibilidad/zonaBaseId)
    if (body.perfil && typeof body.perfil === "object") {
      await perfilesRepo.patchPerfilAngel({
        usuarioId,
        // OJO: usar hasOwnProperty en el controller (mejor), pero aquí lo dejamos simple:
        disponibilidad: body.perfil.disponibilidad,
        biografia: body.perfil.biografia,
        zonaBaseId: body.perfil.zonaBaseId,
      });
    }

    // 2) Habilidades (si viene habilidadIds, reemplazar)
    if (Object.prototype.hasOwnProperty.call(body, "habilidadIds")) {
      const ids = Array.isArray(body.habilidadIds)
        ? body.habilidadIds.map(Number)
        : [];
      await perfilesRepo.replaceAngelHabilidades({
        usuarioId,
        habilidadIds: ids,
      });
    }

    // 3) Idiomas
    if (Object.prototype.hasOwnProperty.call(body, "idiomaIds")) {
      const ids = Array.isArray(body.idiomaIds)
        ? body.idiomaIds.map(Number)
        : [];
      await perfilesRepo.replaceAngelIdiomas({ usuarioId, idiomaIds: ids });
    }

    // 4) Zonas cobertura
    if (Object.prototype.hasOwnProperty.call(body, "zonaIds")) {
      const ids = Array.isArray(body.zonaIds) ? body.zonaIds.map(Number) : [];
      await perfilesRepo.replaceAngelZonasCobertura({
        usuarioId,
        zonaIds: ids,
      });
    }

    // 5) Disponibilidad semanal
    if (Object.prototype.hasOwnProperty.call(body, "disponibilidadSemanal")) {
      const dias = Array.isArray(body.disponibilidadSemanal)
        ? body.disponibilidadSemanal
        : [];
      await perfilesRepo.upsertAngelDisponibilidad({ usuarioId, dias });
    }

    // devuelve el FULL (tu get ya lo arma completo)
    return perfilesRepo.getPerfilAngel(usuarioId);
  },
};
