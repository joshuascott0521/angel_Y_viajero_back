import sql from "mssql";
import { getPool } from "../../config/db";

export type CategoriaRecompensaRow = {
  CategoriaRecompensaId: number;
  Nombre: string;
  Descripcion: string | null;
  Activa?: boolean;
  FechaCreacion?: string;
};

export type RecompensaRow = {
  RecompensaId: number;
  CategoriaRecompensaId: number;
  Nombre: string;
  Descripcion: string | null;
  CostoAlas: number;
  Stock: number | null;
  Activa?: boolean;
  Categoria?: string;
};

export type CanjeRow = {
  CanjeId: string;
  PerfilAngelId: string;
  RecompensaId: number;
  Recompensa?: string;
  CostoAlas: number;
  Estado?: string;
  FechaCanje: string;
  Observacion: string | null;
  SaldoAlasActual?: number;
};

export const recompensasRepo = {
  // =============================
  // Categorías
  // =============================
  async categoriaCreate(input: { nombre: string; descripcion?: string | null }) {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("Nombre", sql.VarChar(80), input.nombre)
      .input("Descripcion", sql.VarChar(250), input.descripcion ?? null)
      .execute("dbo.CategoriaRecompensaCreate");

    return (r.recordset?.[0] ?? null) as CategoriaRecompensaRow | null;
  },

  async categoriasGetActivas() {
    const pool = await getPool();
    const r = await pool.request().execute("dbo.CategoriaRecompensaGetActivas");
    return (r.recordset ?? []) as CategoriaRecompensaRow[];
  },

  async categoriaDesactivar(categoriaRecompensaId: number) {
    const pool = await getPool();
    await pool
      .request()
      .input("CategoriaRecompensaId", sql.Int, categoriaRecompensaId)
      .execute("dbo.CategoriaRecompensaDesactivar");
    return true;
  },

  // =============================
  // Recompensas
  // =============================
  async recompensaCreate(input: {
    categoriaRecompensaId: number;
    nombre: string;
    descripcion?: string | null;
    costoAlas: number;
    stock?: number | null;
  }) {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("CategoriaRecompensaId", sql.Int, input.categoriaRecompensaId)
      .input("Nombre", sql.VarChar(100), input.nombre)
      .input("Descripcion", sql.VarChar(300), input.descripcion ?? null)
      .input("CostoAlas", sql.Int, input.costoAlas)
      .input("Stock", sql.Int, input.stock ?? null)
      .execute("dbo.RecompensaCreate");

    return (r.recordset?.[0] ?? null) as RecompensaRow | null;
  },

  async recompensasGetDisponibles(categoriaRecompensaId?: number | null) {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("CategoriaRecompensaId", sql.Int, categoriaRecompensaId ?? null)
      .execute("dbo.RecompensasGetDisponibles");

    return (r.recordset ?? []) as RecompensaRow[];
  },

  // =============================
  // Canjes
  // =============================
  async canjeCreate(input: {
    perfilAngelId: string;
    recompensaId: number;
    observacion?: string | null;
  }) {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("PerfilAngelId", sql.UniqueIdentifier, input.perfilAngelId)
      .input("RecompensaId", sql.Int, input.recompensaId)
      .input("Observacion", sql.VarChar(250), input.observacion ?? null)
      .execute("dbo.CanjeCreate");

    return (r.recordset?.[0] ?? null) as CanjeRow | null;
  },

  async canjesGetByAngel(perfilAngelId: string) {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("PerfilAngelId", sql.UniqueIdentifier, perfilAngelId)
      .execute("dbo.CanjesGetByAngel");

    return (r.recordset ?? []) as CanjeRow[];
  },

  // =============================
  // Extra útil: Saldo Alas (query directa)
  // =============================
  async getSaldoAlas(perfilAngelId: string) {
    const pool = await getPool();
    const r = await pool
      .request()
      .input("PerfilAngelId", sql.UniqueIdentifier, perfilAngelId)
      .execute("dbo.AlaMovimientoGetSaldoByAngel");

    return Number(r.recordset?.[0]?.Saldo ?? 0);
  },
};
