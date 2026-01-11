import sql from "mssql";

const config: sql.config = {
  server: process.env.DB_SERVER!,
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  options: { trustServerCertificate: true },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

let pool: sql.ConnectionPool | null = null;

export async function getPool() {
  try {
    if (pool) return pool;

    pool = await sql.connect(config);

    // si se cae, resetea
    pool.on("error", (err) => {
      console.error("SQL Pool error:", err);
      pool = null;
    });

    return pool;
  } catch (err) {
    pool = null;
    throw err;
  }
}
