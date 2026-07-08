import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH =
  process.env.DATABASE_PATH || path.join(process.cwd(), "db", "jobswap.sqlite3");

declare global {
  // eslint-disable-next-line no-var
  var __jobswapDb: Database.Database | undefined;
}

function bootstrap(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  const schema = fs.readFileSync(
    path.join(process.cwd(), "db", "schema.sql"),
    "utf-8"
  );
  db.exec(schema);
  return db;
}

export const db = global.__jobswapDb || bootstrap();
if (process.env.NODE_ENV !== "production") global.__jobswapDb = db;
