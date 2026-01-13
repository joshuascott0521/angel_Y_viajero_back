import { recompensasRepo } from "./recompensas.repo";

export const recompensasService = {
  // Categorías
  async crearCategoria(body: any) {
    const nombre = String(body?.nombre ?? "").trim();
    const descripcion = body?.descripcion ?? null;

    if (!nombre) {
      return { ok: false, code: "VALIDATION_ERROR", message: "nombre es requerido." };
    }

    const cat = await recompensasRepo.categoriaCreate({ nombre, descripcion });
    return { ok: true, data: cat };
  },

  async listarCategoriasActivas() {
    const data = await recompensasRepo.categoriasGetActivas();
    return { ok: true, data };
  },

  async desactivarCategoria(categoriaRecompensaId: number) {
    if (!categoriaRecompensaId || categoriaRecompensaId <= 0) {
      return { ok: false, code: "VALIDATION_ERROR", message: "categoriaRecompensaId inválido." };
    }
    await recompensasRepo.categoriaDesactivar(categoriaRecompensaId);
    return { ok: true, message: "Categoría desactivada." };
  },

  // Recompensas
  async crearRecompensa(body: any) {
    const categoriaRecompensaId = Number(body?.categoriaRecompensaId);
    const nombre = String(body?.nombre ?? "").trim();
    const descripcion = body?.descripcion ?? null;
    const costoAlas = Number(body?.costoAlas);
    const stock = body?.stock === undefined ? null : (body?.stock === null ? null : Number(body.stock));

    if (!categoriaRecompensaId || categoriaRecompensaId <= 0) {
      return { ok: false, code: "VALIDATION_ERROR", message: "categoriaRecompensaId inválido." };
    }
    if (!nombre) {
      return { ok: false, code: "VALIDATION_ERROR", message: "nombre es requerido." };
    }
    if (!Number.isFinite(costoAlas) || costoAlas <= 0) {
      return { ok: false, code: "VALIDATION_ERROR", message: "costoAlas debe ser > 0." };
    }
    if (stock !== null && (!Number.isFinite(stock) || stock < 0)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "stock debe ser null o >= 0." };
    }

    const rec = await recompensasRepo.recompensaCreate({
      categoriaRecompensaId,
      nombre,
      descripcion,
      costoAlas,
      stock,
    });

    return { ok: true, data: rec };
  },

  async listarRecompensasDisponibles(query: any) {
    const categoria = query?.categoriaRecompensaId;
    const categoriaRecompensaId =
      categoria === undefined || categoria === null || categoria === ""
        ? null
        : Number(categoria);

    if (categoriaRecompensaId !== null && (!Number.isFinite(categoriaRecompensaId) || categoriaRecompensaId <= 0)) {
      return { ok: false, code: "VALIDATION_ERROR", message: "categoriaRecompensaId inválido." };
    }

    const data = await recompensasRepo.recompensasGetDisponibles(categoriaRecompensaId);
    return { ok: true, data };
  },

  // Canjes (solo ángel)
  async canjearRecompensa(user: any, body: any) {
    // Ajusta esto a cómo guardas el JWT (ej: req.user.rolId, req.user.usuarioId)
    const rolId = Number(user?.rolId);
    const perfilAngelId = String(user?.usuarioId ?? ""); // en tu BD PerfilAngel.UsuarioId

    if (rolId !== 2) {
      return { ok: false, code: "FORBIDDEN", message: "Solo un ángel puede canjear recompensas." };
    }

    const recompensaId = Number(body?.recompensaId);
    const observacion = body?.observacion ?? null;

    if (!recompensaId || recompensaId <= 0) {
      return { ok: false, code: "VALIDATION_ERROR", message: "recompensaId inválido." };
    }

    const canje = await recompensasRepo.canjeCreate({
      perfilAngelId,
      recompensaId,
      observacion,
    });

    return { ok: true, data: canje };
  },

  async misCanjes(user: any) {
    const rolId = Number(user?.rolId);
    const perfilAngelId = String(user?.usuarioId ?? "");

    if (rolId !== 2) {
      return { ok: false, code: "FORBIDDEN", message: "Solo un ángel puede ver sus canjes." };
    }

    const data = await recompensasRepo.canjesGetByAngel(perfilAngelId);
    return { ok: true, data };
  },

  async miSaldo(user: any) {
    const rolId = Number(user?.rolId);
    const perfilAngelId = String(user?.usuarioId ?? "");

    if (rolId !== 2) {
      return { ok: false, code: "FORBIDDEN", message: "Solo un ángel tiene saldo de alas." };
    }

    const saldo = await recompensasRepo.getSaldoAlas(perfilAngelId);
    return saldo;
  },
};
