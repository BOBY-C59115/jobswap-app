import { randomUUID } from "node:crypto";
import { query, queryOne } from "./client";

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
export async function createUser(email: string, passwordHash: string): Promise<User> {
  const id = randomUUID();
  await query(
    `INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)`,
    [id, email.toLowerCase().trim(), passwordHash]
  );
  return (await getUserById(id))!;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return queryOne<User>(
    `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`,
    [email.toLowerCase().trim()]
  );
}

export async function getUserById(id: string): Promise<User | undefined> {
  return queryOne<User>(
    `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
}

export async function softDeleteUser(id: string) {
  await query(
    `UPDATE users SET email = $1, password_hash = '', deleted_at = NOW() WHERE id = $2`,
    [`deleted-${id}@anonymized.jobswap`, id]
  );
  await query(`DELETE FROM profiles WHERE user_id = $1`, [id]);
  await query(`DELETE FROM consents WHERE user_id = $1`, [id]);
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

export async function upsertProfile(userId: string, data: ProfileInput): Promise<Profile> {
  const existing = await getProfileByUserId(userId);
  const values = PROFILE_COLUMNS.map((c) => (data as any)[c]);

  if (existing) {
    const setClause = PROFILE_COLUMNS.map((c, i) => `${c}=$${i + 1}`).join(", ");
    await query(
      `UPDATE profiles SET ${setClause}, updated_at=NOW() WHERE user_id=$${PROFILE_COLUMNS.length + 1}`,
      [...values, userId]
    );
  } else {
    const cols = ["id", "user_id", ...PROFILE_COLUMNS].join(", ");
    const placeholders = [1, 2, ...PROFILE_COLUMNS.map((_, i) => i + 3)]
      .map((n) => `$${n}`)
      .join(", ");
    await query(
      `INSERT INTO profiles (${cols}) VALUES (${placeholders})`,
      [randomUUID(), userId, ...values]
    );
  }
  return (await getProfileByUserId(userId))!;
}

export async function getProfileByUserId(userId: string): Promise<Profile | undefined> {
  return queryOne<Profile>(`SELECT * FROM profiles WHERE user_id = $1`, [userId]);
}

// ── Consents ─────────────────────────────────────────────────────────────
export async function ensureConsent(userId: string): Promise<Consent> {
  const existing = await getConsent(userId);
  if (existing) return existing;
  const id = randomUUID();
  await query(`INSERT INTO consents (id, user_id) VALUES ($1, $2)`, [id, userId]);
  return (await getConsent(userId))!;
}

export async function getConsent(userId: string): Promise<Consent | undefined> {
  return queryOne<Consent>(`SELECT * FROM consents WHERE user_id = $1`, [userId]);
}

export async function updateConsent(
  userId: string,
  phases: Partial<Pick<Consent, "phase2" | "phase3" | "phase4">>
): Promise<Consent> {
  await ensureConsent(userId);
  const current = (await getConsent(userId))!;
  const phase2 = phases.phase2 ?? current.phase2;
  let phase3 = phases.phase3 ?? current.phase3;
  let phase4 = phases.phase4 ?? current.phase4;
  if (!phase2) { phase3 = 0; phase4 = 0; }
  if (!phase3) phase4 = 0;
  await query(
    `UPDATE consents SET phase2=$1, phase3=$2, phase4=$3, updated_at=NOW() WHERE user_id=$4`,
    [phase2, phase3, phase4, userId]
  );
  return (await getConsent(userId))!;
}

// ── Seed pool ────────────────────────────────────────────────────────────
export async function getSeedPool(): Promise<SeedProfile[]> {
  return query<SeedProfile>(`SELECT * FROM seed_profiles`);
}

export async function countSeedProfiles(): Promise<number> {
  const row = await queryOne<{ c: string }>(`SELECT COUNT(*) as c FROM seed_profiles`);
  return row ? parseInt(row.c, 10) : 0;
}
