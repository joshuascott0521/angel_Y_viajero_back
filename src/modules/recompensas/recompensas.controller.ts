import type { Request, Response } from "express";
import { recompensasService } from "./recompensas.service";

function parseIntParam(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

export const recompensasController = {
  // Categorías
  async createCategoria(req: Request, res: Response) {
    try {
      const r = await recompensasService.crearCategoria(req.body);
      return r.ok ? res.status(201).json(r) : res.status(400).json(r);
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: err?.message ?? "Error interno" });
    }
  },

  async getCategoriasActivas(_req: Request, res: Response) {
    try {
      const r = await recompensasService.listarCategoriasActivas();
      return res.json(r);
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: err?.message ?? "Error interno" });
    }
  },

  async desactivarCategoria(req: Request, res: Response) {
    try {
      const id = parseIntParam(req.params.categoriaRecompensaId);
      const r = await recompensasService.desactivarCategoria(id);
      return r.ok ? res.json(r) : res.status(400).json(r);
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: err?.message ?? "Error interno" });
    }
  },

  // Recompensas
  async createRecompensa(req: Request, res: Response) {
    try {
      const r = await recompensasService.crearRecompensa(req.body);
      return r.ok ? res.status(201).json(r) : res.status(400).json(r);
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: err?.message ?? "Error interno" });
    }
  },

  async getRecompensasDisponibles(req: Request, res: Response) {
    try {
      const r = await recompensasService.listarRecompensasDisponibles(req.query);
      return r.ok ? res.json(r) : res.status(400).json(r);
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: err?.message ?? "Error interno" });
    }
  },

  // Canjes
  async canjear(req: Request, res: Response) {
    try {
      const r = await recompensasService.canjearRecompensa((req as any).user, req.body);
      return r.ok ? res.status(201).json(r) : res.status(r.code === "FORBIDDEN" ? 403 : 400).json(r);
    } catch (err: any) {
      // Aquí caen los RAISERROR del SP (saldo insuficiente, agotado, etc.)
      return res.status(400).json({ ok: false, message: err?.message ?? "No fue posible canjear." });
    }
  },

  async misCanjes(req: Request, res: Response) {
    try {
      const r = await recompensasService.misCanjes((req as any).user);
      return r.ok ? res.json(r) : res.status(403).json(r);
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: err?.message ?? "Error interno" });
    }
  },

  async miSaldo(req: Request, res: Response) {
    try {
      const r = await recompensasService.miSaldo((req as any).user);
      return r.ok ? res.json(r) : res.status(403).json(r);
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: err?.message ?? "Error interno" });
    }
  },
};
