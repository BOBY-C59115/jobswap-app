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
  secteur_naf: string;
  convention_collective: string;
  classification: string;
  contract_type: string;
  work_time_pct: number;
  salaire_brut_annuel: number;
  part_variable_pct: number;
  prime_anciennete: number;
  interessement: number;
  participation: number;
  mutuelle_taux_employeur: number;
  tickets_resto_montant: number;
  rtt_jours: number;
  cse: number;
  vehicule_fonction: number;
  telework_days_per_week: number;
  horaires: string;
  penibilite: number;
  deplacements_frequence: string;
  diplome_requis: string;
  experience_annees: number;
  certifications: string;
  permis: string;
  langues: string;
  subj_management: number;
  subj_valeurs: number;
  subj_ambiance: number;
  subj_evolution: number;
  subj_stress: number;
  residence_city: string;
  residence_postal_code: string;
  residence_lat: number;
  residence_lng: number;
  workplace_city: string;
  workplace_postal_code: string;
  workplace_lat: number;
  workplace_lng: number;
  commute_distance_km: number;
  commute_duration_min: number;
  commute_days_per_week: number;
  current_vehicle_type: string;
  current_fuel_type: string;
  current_fiscal_cv: number;
  current_consumption: number;
  current_vehicle_age: number;
  carpool_passengers: number;
  public_transport_pass: number;
  envisaged_mode: string;
  envisaged_vehicle_type: string;
  envisaged_fuel_type: string;
  envisaged_fiscal_cv: number;
  envisaged_consumption: number;
  open_to_remote: number;
  created_at: string;
  updated_at: string;
};

export type ProfileInput = Omit<
  Profile,
  "id" | "user_id" | "created_at" | "updated_at"
>;

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
  secteur_naf: string;
  classification: string;
  contract_type: string;
  salaire_brut_annuel: number;
  mutuelle_taux_employeur: number;
  rtt_jours: number;
  telework_days_per_week: number;
  subj_management: number;
  subj_valeurs: number;
  subj_ambiance: number;
  subj_evolution: number;
  subj_stress: number;
  workplace_city: string;
  workplace_postal_code: string;
  workplace_lat: number;
  workplace_lng: number;
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
  db.prepare(
    `UPDATE users SET email = ?, password_hash = '', deleted_at = datetime('now') WHERE id = ?`
  ).run(`deleted-${id}@anonymized.jobswap`, id);
  db.prepare(`DELETE FROM profiles WHERE user_id = ?`).run(id);
  db.prepare(`DELETE FROM consents WHERE user_id = ?`).run(id);
}

// ── Profiles ─────────────────────────────────────────────────────────────
const PROFILE_COLUMNS = [
  "pseudonym", "rome_code", "rome_label", "secteur_naf", "convention_collective",
  "classification", "contract_type", "work_time_pct",
  "salaire_brut_annuel", "part_variable_pct", "prime_anciennete", "interessement", "participation",
  "mutuelle_taux_employeur", "tickets_resto_montant", "rtt_jours", "cse", "vehicule_fonction", "telework_days_per_week",
  "horaires", "penibilite", "deplacements_frequence",
  "diplome_requis", "experience_annees", "certifications", "permis", "langues",
  "subj_management", "subj_valeurs", "subj_ambiance", "subj_evolution", "subj_stress",
  "residence_city", "residence_postal_code", "residence_lat", "residence_lng",
  "workplace_city", "workplace_postal_code", "workplace_lat", "workplace_lng",
  "commute_distance_km", "commute_duration_min", "commute_days_per_week",
  "current_vehicle_type", "current_fuel_type", "current_fiscal_cv", "current_consumption", "current_vehicle_age",
  "carpool_passengers", "public_transport_pass",
  "envisaged_mode", "envisaged_vehicle_type", "envisaged_fuel_type", "envisaged_fiscal_cv", "envisaged_consumption",
  "open_to_remote",
] as const;

export function upsertProfile(userId: string, data: ProfileInput): Profile {
  const existing = getProfileByUserId(userId);
  const values = PROFILE_COLUMNS.map((c) => (data as any)[c]);

  if (existing) {
    const setClause = PROFILE_COLUMNS.map((c) => `${c}=?`).join(", ");
    db.prepare(
      `UPDATE profiles SET ${setClause}, updated_at=datetime('now') WHERE user_id=?`
    ).run(...values, userId);
  } else {
    const cols = ["id", "user_id", ...PROFILE_COLUMNS].join(", ");
    const placeholders = ["?", "?", ...PROFILE_COLUMNS.map(() => "?")].join(", ");
    db.prepare(`INSERT INTO profiles (${cols}) VALUES (${placeholders})`).run(
      randomUUID(),
      userId,
      ...values
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
  db.prepare(`INSERT INTO consents (id, user_id) VALUES (?, ?)`).run(id, userId);
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
  let phase3 = phases.phase3 ?? current.phase3;
  let phase4 = phases.phase4 ?? current.phase4;
  if (!phase2) { phase3 = 0; phase4 = 0; }
  if (!phase3) phase4 = 0;
  db.prepare(
    `UPDATE consents SET phase2=?, phase3=?, phase4=?, updated_at=datetime('now') WHERE user_id=?`
  ).run(phase2, phase3, phase4, userId);
  return getConsent(userId)!;
}

// ── Seed pool ────────────────────────────────────────────────────────────
export function getSeedPool(): SeedProfile[] {
  return db.prepare(`SELECT * FROM seed_profiles`).all() as SeedProfile[];
}

export function countSeedProfiles(): number {
  const row = db.prepare(`SELECT COUNT(*) as c FROM seed_profiles`).get() as { c: number };
  return row.c;
}
