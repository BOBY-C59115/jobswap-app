CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pseudonym TEXT NOT NULL,
  rome_code TEXT NOT NULL,
  rome_label TEXT NOT NULL,
  classification TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  commute_km REAL NOT NULL,
  open_to_remote INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS consents (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phase1 INTEGER NOT NULL DEFAULT 1,
  phase2 INTEGER NOT NULL DEFAULT 1,
  phase3 INTEGER NOT NULL DEFAULT 1,
  phase4 INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Bassin de profils fictifs utilisé pour alimenter le matching de démonstration
CREATE TABLE IF NOT EXISTS seed_profiles (
  id TEXT PRIMARY KEY,
  pseudonym TEXT NOT NULL,
  rome_code TEXT NOT NULL,
  rome_label TEXT NOT NULL,
  classification TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  commute_km REAL NOT NULL
);
