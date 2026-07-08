import { randomUUID } from "node:crypto";
import { db } from "./client";

export type User = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  deleted_at: string | null;
};

export type Profile = {
  id: string;
  user_id: string;
  pseudonym: string;
  rome_code: string;
  rome_label: string;
  classification: string;
  contract_type: string;
  city: string;
  postal_code: string;
  lat: number;
  lng: number;
  commute_km: number;
  open_to_remote: number;
  created_at: string;
  updated_at: string;
};

export type Consent = {
  id: string;
  user_id: string;
  phase1: number;
  phase2: number;
  phase3: number;
  phase4: number;
  updated_at: string;
};

export type SeedProfile = {
  id: string;
  pseudonym: string;
  rome_code: string;
  rome_label: string;
  classification: string;
  contract_type: string;
  city: string;
  postal_code: string;
  lat: number;
  lng: number;
  commute_km: number;
};

// ── Users ────────────────────────────────────────────────────────────────
export function createUser(email: string, passwordHash: string): User {
  const id = randomUUID();
  db.prepare(
    `INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)`
  ).run(id, email.toLowerCase().trim(), passwordHash);
  return getUserById(id)!;
}

export function getUserByEmail(email: string): User | undefined {
  return db
    .prepare(`SELECT * FROM users WHERE email = ? AND deleted_at IS NULL`)
    .get(email.toLowerCase().trim()) as User | undefined;
}

export function getUserById(id: string): User | undefined {
  return db
    .prepare(`SELECT * FROM users WHERE id = ? AND deleted_at IS NULL`)
    .get(id) as User | undefined;
}

export function softDeleteUser(id: string) {
  // Anonymisation : on écrase l'e-mail et on marque le compte comme supprimé,
  // conformément au droit à l'effacement (Art. 17 RGPD). Le profil et les
  // consentements sont détruits (cascade), seule une trace neutre subsiste.
  db.prepare(
    `UPDATE users SET email = ?, password_hash = '', deleted_at = datetime('now') WHERE id = ?`
  ).run(`deleted-${id}@anonymized.jobswap`, id);
  db.prepare(`DELETE FROM profiles WHERE user_id = ?`).run(id);
  db.prepare(`DELETE FROM consents WHERE user_id = ?`).run(id);
}

// ── Profiles ─────────────────────────────────────────────────────────────
export function upsertProfile(
  userId: string,
  data: Omit<Profile, "id" | "user_id" | "created_at" | "updated_at">
): Profile {
  const existing = getProfileByUserId(userId);
  if (existing) {
    db.prepare(
      `UPDATE profiles SET pseudonym=?, rome_code=?, rome_label=?, classification=?,
       contract_type=?, city=?, postal_code=?, lat=?, lng=?, commute_km=?,
       open_to_remote=?, updated_at=datetime('now') WHERE user_id=?`
    ).run(
      data.pseudonym,
      data.rome_code,
      data.rome_label,
      data.classification,
      data.contract_type,
      data.city,
      data.postal_code,
      data.lat,
      data.lng,
      data.commute_km,
      data.open_to_remote,
      userId
    );
  } else {
    db.prepare(
      `INSERT INTO profiles (id, user_id, pseudonym, rome_code, rome_label, classification,
       contract_type, city, postal_code, lat, lng, commute_km, open_to_remote)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      randomUUID(),
      userId,
      data.pseudonym,
      data.rome_code,
      data.rome_label,
      data.classification,
      data.contract_type,
      data.city,
      data.postal_code,
      data.lat,
      data.lng,
      data.commute_km,
      data.open_to_remote
    );
  }
  return getProfileByUserId(userId)!;
}

export function getProfileByUserId(userId: string): Profile | undefined {
  return db
    .prepare(`SELECT * FROM profiles WHERE user_id = ?`)
    .get(userId) as Profile | undefined;
}

// ── Consents ─────────────────────────────────────────────────────────────
export function ensureConsent(userId: string): Consent {
  const existing = getConsent(userId);
  if (existing) return existing;
  const id = randomUUID();
  db.prepare(`INSERT INTO consents (id, user_id) VALUES (?, ?)`).run(
    id,
    userId
  );
  return getConsent(userId)!;
}

export function getConsent(userId: string): Consent | undefined {
  return db
    .prepare(`SELECT * FROM consents WHERE user_id = ?`)
    .get(userId) as Consent | undefined;
}

export function updateConsent(
  userId: string,
  phases: Partial<Pick<Consent, "phase2" | "phase3" | "phase4">>
): Consent {
  ensureConsent(userId);
  const current = getConsent(userId)!;
  const phase2 = phases.phase2 ?? current.phase2;
  // Retirer le consentement d'une phase verrouille automatiquement les suivantes
  let phase3 = phases.phase3 ?? current.phase3;
  let phase4 = phases.phase4 ?? current.phase4;
  if (!phase2) {
    phase3 = 0;
    phase4 = 0;
  }
  if (!phase3) phase4 = 0;
  db.prepare(
    `UPDATE consents SET phase2=?, phase3=?, phase4=?, updated_at=datetime('now') WHERE user_id=?`
  ).run(phase2, phase3, phase4, userId);
  return getConsent(userId)!;
}

// ── Seed pool (bassin de candidats fictifs) ─────────────────────────────
export function getSeedPool(): SeedProfile[] {
  return db.prepare(`SELECT * FROM seed_profiles`).all() as SeedProfile[];
}

export function getAllRealProfilesExcept(userId: string): Profile[] {
  return db
    .prepare(
      `SELECT p.* FROM profiles p JOIN users u ON u.id = p.user_id
       WHERE p.user_id != ? AND u.deleted_at IS NULL`
    )
    .all(userId) as Profile[];
}

export function countSeedProfiles(): number {
  const row = db
    .prepare(`SELECT COUNT(*) as c FROM seed_profiles`)
    .get() as { c: number };
  return row.c;
}
