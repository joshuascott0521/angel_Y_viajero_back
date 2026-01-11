import sql from "mssql";
import { getPool } from "../../config/db";

export const perfilesRepo = {
  // =========================
  // PERFIL VIAJERO
  // =========================

  async getPerfilViajero(usuarioId: string) {
    const pool = await getPool();

    // 1) Usuario + PerfilViajero
    const perfil = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId).query(`
      SELECT TOP 1
        u.UsuarioId,
        u.Nombre,
        u.Correo,
        u.Telefono,
        u.Edad,
        pv.ZonaId,
        pv.TipoDiscapacidadId,
        pv.RequerimientosAdicionales,
        pv.PaisOrigen,
        pv.InteresesTuristicos
      FROM dbo.Usuario u
      LEFT JOIN dbo.PerfilViajero pv
        ON pv.UsuarioId = u.UsuarioId
      WHERE u.UsuarioId = @UsuarioId;
    `);

    const row = perfil.recordset?.[0] ?? null;
    if (!row) return null;

    // 2) Asistencias (con nombre)
    const asistencias = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId).query(`
    SELECT
      ta.Id AS Id,
      ta.Titulo,
      ta.Subtitulo
    FROM dbo.PerfilViajeroAsistencia pva
    JOIN dbo.TipoAsistencia ta ON ta.Id = pva.TipoAsistenciaId
    WHERE pva.UsuarioId = @UsuarioId
    ORDER BY ta.Id;
  `);

    // 3) Idiomas (con nombre)
    const idiomas = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId).query(`
    SELECT
      i.IdiomaId AS Id,
      i.Nombre
    FROM dbo.UsuarioIdioma ui
    JOIN dbo.Idioma i ON i.IdiomaId = ui.IdiomaId
    WHERE ui.UsuarioId = @UsuarioId
    ORDER BY i.IdiomaId;
  `);

    // 4) Contacto de emergencia (si existe)
    const contacto = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId).query(`
      SELECT TOP 1
        Nombre,
        Telefono,
        Parentesco
      FROM dbo.ContactoEmergencia
      WHERE UsuarioId = @UsuarioId
      ORDER BY ContactEmerId DESC;
    `);

    return {
      usuarioId: row.UsuarioId,

      personal: {
        nombre: row.Nombre,
        correo: row.Correo,
        telefono: row.Telefono ?? null,
        edad: row.Edad,
        paisOrigen: row.PaisOrigen ?? null,
      },

      perfil: {
        zonaId: row.ZonaId ?? null,
        tipoDiscapacidadId: row.TipoDiscapacidadId ?? null,
        requerimientosAdicionales: row.RequerimientosAdicionales ?? null,
        interesesTuristicos: row.InteresesTuristicos ?? null,
      },

      // ✅ nuevos (con nombre)
      asistencias: asistencias.recordset.map((x: any) => ({
        id: x.Id,
        titulo: x.Titulo,
        subtitulo: x.Subtitulo,
      })),

      idiomas: idiomas.recordset.map((x: any) => ({
        id: x.Id,
        nombre: x.Nombre,
      })),
      
      contactoEmergencia: contacto.recordset?.[0]
        ? {
            nombre: contacto.recordset[0].Nombre,
            telefono: contacto.recordset[0].Telefono,
            parentesco: contacto.recordset[0].Parentesco,
          }
        : null,
    };
  },

  async patchUsuarioPersonal(input: {
    usuarioId: string;
    nombre?: string;
    correo?: string;
    telefono?: string | null;
    edad?: number;
  }) {
    const pool = await getPool();

    const hasNombre = Object.prototype.hasOwnProperty.call(input, "nombre");
    const hasCorreo = Object.prototype.hasOwnProperty.call(input, "correo");
    const hasTel = Object.prototype.hasOwnProperty.call(input, "telefono");
    const hasEdad = Object.prototype.hasOwnProperty.call(input, "edad");

    if (!hasNombre && !hasCorreo && !hasTel && !hasEdad) return;

    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("SetNombre", sql.Bit, hasNombre ? 1 : 0)
      .input("Nombre", sql.VarChar(255), hasNombre ? input.nombre : null)
      .input("SetCorreo", sql.Bit, hasCorreo ? 1 : 0)
      .input(
        "Correo",
        sql.VarChar(150),
        hasCorreo ? input.correo?.trim().toLowerCase() : null
      )
      .input("SetTelefono", sql.Bit, hasTel ? 1 : 0)
      .input("Telefono", sql.VarChar(20), hasTel ? input.telefono : null)
      .input("SetEdad", sql.Bit, hasEdad ? 1 : 0)
      .input("Edad", sql.Int, hasEdad ? input.edad : null).query(`
      UPDATE dbo.Usuario
      SET
        Nombre = CASE WHEN @SetNombre = 1 THEN @Nombre ELSE Nombre END,
        Correo = CASE WHEN @SetCorreo = 1 THEN @Correo ELSE Correo END,
        Telefono = CASE WHEN @SetTelefono = 1 THEN @Telefono ELSE Telefono END,
        Edad = CASE WHEN @SetEdad = 1 THEN @Edad ELSE Edad END
      WHERE UsuarioId = @UsuarioId;
    `);
  },

  async patchPerfilViajero(input: {
    usuarioId: string;
    zonaId?: number;
    tipoDiscapacidadId?: number;
    requerimientosAdicionales?: string | null;
    paisOrigen?: string | null;
    interesesTuristicos?: string | null;
  }) {
    const pool = await getPool();

    const hasZona = Object.prototype.hasOwnProperty.call(input, "zonaId");
    const hasTipo = Object.prototype.hasOwnProperty.call(
      input,
      "tipoDiscapacidadId"
    );
    const hasReq = Object.prototype.hasOwnProperty.call(
      input,
      "requerimientosAdicionales"
    );
    const hasPais = Object.prototype.hasOwnProperty.call(input, "paisOrigen");
    const hasInt = Object.prototype.hasOwnProperty.call(
      input,
      "interesesTuristicos"
    );

    if (!hasZona && !hasTipo && !hasReq && !hasPais && !hasInt) return;

    // Asegura que exista fila en PerfilViajero (si no existe, la crea con los campos mínimos)
    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("ZonaId", sql.Int, hasZona ? input.zonaId : null)
      .input(
        "TipoDiscapacidadId",
        sql.Int,
        hasTipo ? input.tipoDiscapacidadId : null
      ).query(`
      IF NOT EXISTS (SELECT 1 FROM dbo.PerfilViajero WHERE UsuarioId = @UsuarioId)
      BEGIN
        IF @ZonaId IS NULL OR @TipoDiscapacidadId IS NULL
          RAISERROR('Para crear el perfil, zonaId y tipoDiscapacidadId son requeridos.', 16, 1);

        INSERT INTO dbo.PerfilViajero (UsuarioId, ZonaId, TipoDiscapacidadId)
        VALUES (@UsuarioId, @ZonaId, @TipoDiscapacidadId);
      END
    `);

    // Patch parcial
    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("SetZonaId", sql.Bit, hasZona ? 1 : 0)
      .input("ZonaId", sql.Int, hasZona ? input.zonaId : null)
      .input("SetTipo", sql.Bit, hasTipo ? 1 : 0)
      .input(
        "TipoDiscapacidadId",
        sql.Int,
        hasTipo ? input.tipoDiscapacidadId : null
      )
      .input("SetReq", sql.Bit, hasReq ? 1 : 0)
      .input(
        "RequerimientosAdicionales",
        sql.VarChar(500),
        hasReq ? input.requerimientosAdicionales : null
      )
      .input("SetPais", sql.Bit, hasPais ? 1 : 0)
      .input("PaisOrigen", sql.VarChar(100), hasPais ? input.paisOrigen : null)
      .input("SetInt", sql.Bit, hasInt ? 1 : 0)
      .input(
        "InteresesTuristicos",
        sql.VarChar(500),
        hasInt ? input.interesesTuristicos : null
      ).query(`
      UPDATE dbo.PerfilViajero
      SET
        ZonaId = CASE WHEN @SetZonaId = 1 THEN @ZonaId ELSE ZonaId END,
        TipoDiscapacidadId = CASE WHEN @SetTipo = 1 THEN @TipoDiscapacidadId ELSE TipoDiscapacidadId END,
        RequerimientosAdicionales = CASE WHEN @SetReq = 1 THEN @RequerimientosAdicionales ELSE RequerimientosAdicionales END,
        PaisOrigen = CASE WHEN @SetPais = 1 THEN @PaisOrigen ELSE PaisOrigen END,
        InteresesTuristicos = CASE WHEN @SetInt = 1 THEN @InteresesTuristicos ELSE InteresesTuristicos END
      WHERE UsuarioId = @UsuarioId;
    `);
  },
  async replaceViajeroAsistencias(input: {
    usuarioId: string;
    tipoAsistenciaIds: number[];
  }) {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);
    await tx.begin();
    try {
      await new sql.Request(tx)
        .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
        .query(
          `DELETE FROM dbo.PerfilViajeroAsistencia WHERE UsuarioId = @UsuarioId;`
        );

      for (const id of input.tipoAsistenciaIds) {
        await new sql.Request(tx)
          .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
          .input("TipoAsistenciaId", sql.Int, id).query(`
          INSERT INTO dbo.PerfilViajeroAsistencia (UsuarioId, TipoAsistenciaId)
          VALUES (@UsuarioId, @TipoAsistenciaId);
        `);
      }
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },
  async upsertContactoEmergencia(input: {
    usuarioId: string;
    nombre: string;
    telefono: string;
    parentesco: string;
  }) {
    const pool = await getPool();

    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("Nombre", sql.VarChar(255), input.nombre)
      .input("Telefono", sql.VarChar(20), input.telefono)
      .input("Parentesco", sql.VarChar(60), input.parentesco).query(`
      IF EXISTS (SELECT 1 FROM dbo.ContactoEmergencia WHERE UsuarioId = @UsuarioId)
      BEGIN
        UPDATE dbo.ContactoEmergencia
        SET Nombre=@Nombre, Telefono=@Telefono, Parentesco=@Parentesco
        WHERE UsuarioId=@UsuarioId;
      END
      ELSE
      BEGIN
        INSERT INTO dbo.ContactoEmergencia (UsuarioId, Nombre, Telefono, Parentesco)
        VALUES (@UsuarioId, @Nombre, @Telefono, @Parentesco);
      END
    `);
  },
  async replaceUsuarioIdiomas(input: {
    usuarioId: string;
    idiomaIds: number[];
  }) {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);
    await tx.begin();
    try {
      await new sql.Request(tx)
        .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
        .query(`DELETE FROM dbo.UsuarioIdioma WHERE UsuarioId = @UsuarioId;`);

      for (const id of input.idiomaIds) {
        await new sql.Request(tx)
          .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
          .input("IdiomaId", sql.Int, id).query(`
          INSERT INTO dbo.UsuarioIdioma (UsuarioId, IdiomaId)
          VALUES (@UsuarioId, @IdiomaId);
        `);
      }
      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },
  // =========================
  // PERFIL ÁNGEL
  // =========================
  async getPerfilAngel(usuarioId: string) {
    const pool = await getPool();

    // 1) Base (Usuario + PerfilAngel)
    const baseR = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId).query(`
      SELECT TOP 1
        u.UsuarioId,
        u.Nombre AS NombreCompleto,
        u.Estado,
        pa.Disponibilidad,
        pa.Biografia,
        pa.ZonaBaseId
      FROM dbo.Usuario u
      JOIN dbo.PerfilAngel pa ON pa.UsuarioId = u.UsuarioId
      WHERE u.UsuarioId = @UsuarioId
        AND u.RolId = 2;
    `);

    const base = baseR.recordset?.[0] ?? null;
    if (!base) return null;

    // 2) Habilidades
    const habR = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId).query(`
      SELECT h.HabilidadId, h.Nombre
      FROM dbo.HabilidadUsuario hu
      JOIN dbo.Habilidad h ON h.HabilidadId = hu.HabilidadId
      WHERE hu.UsuarioId = @UsuarioId
      ORDER BY h.Nombre;
    `);

    // 3) Idiomas
    const idiR = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId).query(`
      SELECT i.IdiomaId, i.Nombre
      FROM dbo.UsuarioIdioma ui
      JOIN dbo.Idioma i ON i.IdiomaId = ui.IdiomaId
      WHERE ui.UsuarioId = @UsuarioId
      ORDER BY i.Nombre;
    `);

    // 4) Zonas de cobertura activas
    const zonasR = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId).query(`
      SELECT z.ZonaId, z.Nombre AS Zona, c.CiudadId, c.Nombre AS Ciudad
      FROM dbo.AngelZonaCobertura azc
      JOIN dbo.Zona z ON z.ZonaId = azc.ZonaId
      JOIN dbo.Ciudad c ON c.CiudadId = z.CiudadId
      WHERE azc.UsuarioId = @UsuarioId
        AND azc.Activo = 1
      ORDER BY c.Nombre, z.Nombre;
    `);

    // 5) Horario semanal
    const dispR = await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, usuarioId).query(`
      SELECT DiaSemana, Activo, HoraInicio, HoraFin
      FROM dbo.AngelDisponibilidad
      WHERE UsuarioId = @UsuarioId
      ORDER BY DiaSemana;
    `);

    return {
      ...base,
      Habilidades: habR.recordset,
      Idiomas: idiR.recordset,
      ZonasCobertura: zonasR.recordset,
      HorarioDisponibilidad: dispR.recordset,
    };
  },

  async upsertPerfilAngel(input: {
    usuarioId: string;
    disponibilidad?: boolean; // si no llega, no se toca
    biografia: string | null;
    zonaBaseId: number | null;
  }) {
    const pool = await getPool();

    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("Disponibilidad", sql.Bit, input.disponibilidad ?? null)
      .input("Biografia", sql.VarChar(500), input.biografia)
      .input("ZonaBaseId", sql.Int, input.zonaBaseId).query(`
        IF EXISTS (SELECT 1 FROM dbo.PerfilAngel WHERE UsuarioId = @UsuarioId)
        BEGIN
          UPDATE dbo.PerfilAngel
          SET Biografia = @Biografia,
              ZonaBaseId = @ZonaBaseId,
              Disponibilidad = COALESCE(@Disponibilidad, Disponibilidad)
          WHERE UsuarioId = @UsuarioId;
        END
        ELSE
        BEGIN
          INSERT INTO dbo.PerfilAngel (UsuarioId, Disponibilidad, Biografia, ZonaBaseId)
          VALUES (@UsuarioId, COALESCE(@Disponibilidad, 1), @Biografia, @ZonaBaseId);
        END
      `);
  },
  async patchPerfilAngel(input: {
    usuarioId: string;
    disponibilidad?: boolean;
    biografia?: string | null;
    zonaBaseId?: number | null;
  }) {
    const pool = await getPool();

    // Distinguir "no enviado" vs "enviado"
    const hasDispon = Object.prototype.hasOwnProperty.call(
      input,
      "disponibilidad"
    );
    const hasBio = Object.prototype.hasOwnProperty.call(input, "biografia");
    const hasZona = Object.prototype.hasOwnProperty.call(input, "zonaBaseId");

    if (!hasDispon && !hasBio && !hasZona) return;

    // Nota: si quieres permitir borrar biografia enviando null, esto funciona
    // porque usamos flags separados.
    await pool
      .request()
      .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
      .input("SetDisponibilidad", sql.Bit, hasDispon ? 1 : 0)
      .input(
        "Disponibilidad",
        sql.Bit,
        hasDispon ? (input.disponibilidad ? 1 : 0) : 0
      )
      .input("SetBiografia", sql.Bit, hasBio ? 1 : 0)
      .input("Biografia", sql.VarChar(500), hasBio ? input.biografia : null)
      .input("SetZonaBaseId", sql.Bit, hasZona ? 1 : 0)
      .input("ZonaBaseId", sql.Int, hasZona ? input.zonaBaseId : null).query(`
        UPDATE dbo.PerfilAngel
        SET
          Disponibilidad = CASE WHEN @SetDisponibilidad = 1 THEN @Disponibilidad ELSE Disponibilidad END,
          Biografia      = CASE WHEN @SetBiografia = 1 THEN @Biografia ELSE Biografia END,
          ZonaBaseId     = CASE WHEN @SetZonaBaseId = 1 THEN @ZonaBaseId ELSE ZonaBaseId END
        WHERE UsuarioId = @UsuarioId;
      `);
  },

  // =========================
  // HABILIDADES (replace total)
  // =========================
  async replaceAngelHabilidades(input: {
    usuarioId: string;
    habilidadIds: number[];
  }) {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);

    await tx.begin();
    try {
      await new sql.Request(tx)
        .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
        .query(
          `DELETE FROM dbo.HabilidadUsuario WHERE UsuarioId = @UsuarioId;`
        );

      for (const id of input.habilidadIds) {
        await new sql.Request(tx)
          .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
          .input("HabilidadId", sql.Int, id).query(`
            INSERT INTO dbo.HabilidadUsuario (UsuarioId, HabilidadId)
            VALUES (@UsuarioId, @HabilidadId);
          `);
      }

      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },

  // =========================
  // IDIOMAS (replace total)
  // =========================
  async replaceAngelIdiomas(input: { usuarioId: string; idiomaIds: number[] }) {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);

    await tx.begin();
    try {
      await new sql.Request(tx)
        .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
        .query(`DELETE FROM dbo.UsuarioIdioma WHERE UsuarioId = @UsuarioId;`);

      for (const id of input.idiomaIds) {
        await new sql.Request(tx)
          .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
          .input("IdiomaId", sql.Int, id).query(`
            INSERT INTO dbo.UsuarioIdioma (UsuarioId, IdiomaId)
            VALUES (@UsuarioId, @IdiomaId);
          `);
      }

      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },

  // =========================
  // ZONAS COBERTURA (replace total)
  // =========================
  async replaceAngelZonasCobertura(input: {
    usuarioId: string;
    zonaIds: number[];
  }) {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);

    await tx.begin();
    try {
      await new sql.Request(tx)
        .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
        .query(
          `DELETE FROM dbo.AngelZonaCobertura WHERE UsuarioId = @UsuarioId;`
        );

      for (const id of input.zonaIds) {
        await new sql.Request(tx)
          .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
          .input("ZonaId", sql.Int, id).query(`
            INSERT INTO dbo.AngelZonaCobertura (UsuarioId, ZonaId, Activo)
            VALUES (@UsuarioId, @ZonaId, 1);
          `);
      }

      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },

  // =========================
  // DISPONIBILIDAD SEMANAL (upsert por día)
  // =========================
  async upsertAngelDisponibilidad(input: {
    usuarioId: string;
    dias: Array<{
      diaSemana: number;
      activo: boolean;
      horaInicio?: string | null;
      horaFin?: string | null;
    }>;
  }) {
    const pool = await getPool();
    const tx = new sql.Transaction(pool);

    await tx.begin();
    try {
      for (const d of input.dias) {
        await new sql.Request(tx)
          .input("UsuarioId", sql.UniqueIdentifier, input.usuarioId)
          .input("DiaSemana", sql.TinyInt, d.diaSemana)
          .input("Activo", sql.Bit, d.activo ? 1 : 0)
          .input(
            "HoraInicio",
            sql.Time(0),
            d.activo ? d.horaInicio ?? null : null
          )
          .input("HoraFin", sql.Time(0), d.activo ? d.horaFin ?? null : null)
          .query(`
            IF EXISTS (SELECT 1 FROM dbo.AngelDisponibilidad WHERE UsuarioId=@UsuarioId AND DiaSemana=@DiaSemana)
            BEGIN
              UPDATE dbo.AngelDisponibilidad
              SET Activo=@Activo, HoraInicio=@HoraInicio, HoraFin=@HoraFin
              WHERE UsuarioId=@UsuarioId AND DiaSemana=@DiaSemana;
            END
            ELSE
            BEGIN
              INSERT INTO dbo.AngelDisponibilidad (UsuarioId, DiaSemana, Activo, HoraInicio, HoraFin)
              VALUES (@UsuarioId, @DiaSemana, @Activo, @HoraInicio, @HoraFin);
            END
          `);
      }

      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },
};
