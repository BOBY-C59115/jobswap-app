CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Profil complet : identité anonymisée + critères de poste + mobilité
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pseudonym TEXT NOT NULL,

  rome_code TEXT NOT NULL,
  rome_label TEXT NOT NULL,
  secteur_naf TEXT NOT NULL DEFAULT '',
  convention_collective TEXT NOT NULL DEFAULT '',
  classification TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  work_time_pct INTEGER NOT NULL DEFAULT 100,

  salaire_brut_annuel REAL NOT NULL DEFAULT 0,
  part_variable_pct REAL NOT NULL DEFAULT 0,
  prime_anciennete INTEGER NOT NULL DEFAULT 0,
  interessement INTEGER NOT NULL DEFAULT 0,
  participation INTEGER NOT NULL DEFAULT 0,

  mutuelle_taux_employeur INTEGER NOT NULL DEFAULT 50,
  tickets_resto_montant REAL NOT NULL DEFAULT 0,
  rtt_jours INTEGER NOT NULL DEFAULT 0,
  cse INTEGER NOT NULL DEFAULT 0,
  vehicule_fonction INTEGER NOT NULL DEFAULT 0,
  telework_days_per_week INTEGER NOT NULL DEFAULT 0,

  horaires TEXT NOT NULL DEFAULT 'fixes',
  penibilite INTEGER NOT NULL DEFAULT 0,
  deplacements_frequence TEXT NOT NULL DEFAULT 'aucun',

  diplome_requis TEXT NOT NULL DEFAULT '',
  experience_annees INTEGER NOT NULL DEFAULT 0,
  certifications TEXT NOT NULL DEFAULT '',
  permis TEXT NOT NULL DEFAULT '',
  langues TEXT NOT NULL DEFAULT '',

  subj_management INTEGER NOT NULL DEFAULT 3,
  subj_valeurs INTEGER NOT NULL DEFAULT 3,
  subj_ambiance INTEGER NOT NULL DEFAULT 3,
  subj_evolution INTEGER NOT NULL DEFAULT 3,
  subj_stress INTEGER NOT NULL DEFAULT 3,

  residence_city TEXT NOT NULL,
  residence_postal_code TEXT NOT NULL,
  residence_lat REAL NOT NULL,
  residence_lng REAL NOT NULL,
  workplace_city TEXT NOT NULL,
  workplace_postal_code TEXT NOT NULL,
  workplace_lat REAL NOT NULL,
  workplace_lng REAL NOT NULL,

  commute_distance_km REAL NOT NULL DEFAULT 0,
  commute_duration_min REAL NOT NULL DEFAULT 0,
  commute_days_per_week INTEGER NOT NULL DEFAULT 5,

  current_vehicle_type TEXT NOT NULL DEFAULT 'berline',
  current_fuel_type TEXT NOT NULL DEFAULT 'sp98',
  current_fiscal_cv INTEGER NOT NULL DEFAULT 6,
  current_consumption REAL NOT NULL DEFAULT 7,
  current_vehicle_age INTEGER NOT NULL DEFAULT 5,

  carpool_passengers INTEGER NOT NULL DEFAULT 0,
  public_transport_pass INTEGER NOT NULL DEFAULT 0,

  envisaged_mode TEXT NOT NULL DEFAULT 'vehicule_identique',
  envisaged_vehicle_type TEXT NOT NULL DEFAULT '',
  envisaged_fuel_type TEXT NOT NULL DEFAULT '',
  envisaged_fiscal_cv INTEGER NOT NULL DEFAULT 0,
  envisaged_consumption REAL NOT NULL DEFAULT 0,

  open_to_remote INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consents (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phase1 INTEGER NOT NULL DEFAULT 1,
  phase2 INTEGER NOT NULL DEFAULT 1,
  phase3 INTEGER NOT NULL DEFAULT 1,
  phase4 INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bassin de profils fictifs utilisé pour alimenter le matching de démonstration.
CREATE TABLE IF NOT EXISTS seed_profiles (
  id TEXT PRIMARY KEY,
  pseudonym TEXT NOT NULL,
  rome_code TEXT NOT NULL,
  rome_label TEXT NOT NULL,
  secteur_naf TEXT NOT NULL DEFAULT '',
  classification TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  salaire_brut_annuel REAL NOT NULL DEFAULT 0,
  mutuelle_taux_employeur INTEGER NOT NULL DEFAULT 50,
  rtt_jours INTEGER NOT NULL DEFAULT 0,
  telework_days_per_week INTEGER NOT NULL DEFAULT 0,
  subj_management INTEGER NOT NULL DEFAULT 3,
  subj_valeurs INTEGER NOT NULL DEFAULT 3,
  subj_ambiance INTEGER NOT NULL DEFAULT 3,
  subj_evolution INTEGER NOT NULL DEFAULT 3,
  subj_stress INTEGER NOT NULL DEFAULT 3,
  workplace_city TEXT NOT NULL,
  workplace_postal_code TEXT NOT NULL,
  workplace_lat REAL NOT NULL,
  workplace_lng REAL NOT NULL
);
