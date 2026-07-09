import { Pool, QueryResultRow } from "pg";
import fs from "node:fs";
import path from "node:path";

declare global {
  // eslint-disable-next-line no-var
  var __jobswapPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __jobswapReady: Promise<void> | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL n'est pas défini. Ajoutez la chaîne de connexion Postgres " +
        "(ex. Neon) dans vos variables d'environnement — voir .env.example."
    );
  }
  return new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }, // requis par Neon et la plupart des Postgres hébergés
  });
}

const pool = global.__jobswapPool || createPool();
if (process.env.NODE_ENV !== "production") global.__jobswapPool = pool;

function ensureReady(): Promise<void> {
  if (!global.__jobswapReady) {
    const schema = fs.readFileSync(
      path.join(process.cwd(), "db", "schema.sql"),
      "utf-8"
    );
    global.__jobswapReady = pool.query(schema).then(() => undefined);
    global.__jobswapReady.catch(() => {
      // Si la création du schéma échoue, on retentera au prochain appel
      global.__jobswapReady = undefined;
    });
  }
  return global.__jobswapReady;
}

/**
 * Exécute une requête SQL (placeholders $1, $2, ... comme dans le driver
 * `pg`). S'assure d'abord que le schéma existe (idempotent, CREATE TABLE
 * IF NOT EXISTS), ce qui évite d'avoir un script de migration séparé à
 * exécuter manuellement.
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  await ensureReady();
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function queryOne<T extends QueryResultRow = any>(
  text: string,
  params: any[] = []
): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}
