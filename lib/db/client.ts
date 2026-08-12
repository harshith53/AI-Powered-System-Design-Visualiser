import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __sdPgPool: Pool | undefined;
}

function createPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  return new Pool({
    connectionString,
    // Neon pooled connections are TLS by default.
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

export function getDbPool(): Pool | null {
  if (!global.__sdPgPool) {
    global.__sdPgPool = createPool() ?? undefined;
  }
  return global.__sdPgPool ?? null;
}

export function hasDatabaseConfig(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
