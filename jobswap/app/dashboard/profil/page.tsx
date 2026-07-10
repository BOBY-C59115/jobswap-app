"use client";
import { useEffect, useState } from "react";
import { useMe } from "@/lib/useMe";
import { ROME_CODES } from "@/lib/rome";
import {
  CLASSIFICATIONS,
  SECTEURS_NAF,
  CONVENTIONS_COLLECTIVES,
  HORAIRES,
  DEPLACEMENTS,
  VEHICLE_TYPES,
  FUEL_TYPES,
  ENVISAGED_MODES,
} from "@/lib/refdata";

const CITIES = [
  "Lyon", "Roanne", "Villeurbanne", "Saint-Étienne", "Lille", "Roubaix",
  "Tourcoing", "Douai", "Valenciennes", "Arras", "Paris", "Nantes", "Rennes",
  "Bordeaux", "Toulouse", "Marseille", "Grenoble",
];

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 space-y-4">
      <div>
        <h2 className="font-heading text-base font-bold text-ink">{title}</h2>
        {subtitle && <p className="text-xs text-fog mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink2 mb-1">{label}</label>
      {children}
    </div>
  );
}

const initial = {
  romeCode: "N1301",
  secteurNaf: SECTEURS_NAF[0],
  conventionCollective: CONVENTIONS_COLLECTIVES[0],
  classification: "Employé",
  contractType: "CDI",
  workTimePct: 100,

  salaireBrutAnnuel: 28000,
  partVariablePct: 0,
  primeAnciennete: false,
  interessement: false,
  participation: false,

  mutuelleTauxEmployeur: 50,
  ticketsRestoMontant: 9,
  rttJours: 0,
  cse: false,
  vehiculeFonction: false,
  teleworkDaysPerWeek: 0,

  horaires: "fixes",
  penibilite: 1,
  deplacementsFrequence: "aucun",

  diplomeRequis: "",
  experienceAnnees: 2,
  certifications: "",
  permis: "B",
  langues: "",

  subjManagement: 3,
  subjValeurs: 3,
  subjAmbiance: 3,
  subjEvolution: 3,
  subjStress: 3,

  residenceCity: "Roanne",
  workplaceCity: "Lyon",
  commuteDaysPerWeek: 5,
  searchRadiusKm: 0,

  currentVehicleType: "berline",
  currentFuelType: "sp98",
  currentFiscalCv: 6,
  currentConsumption: 6.5,
  currentVehicleAge: 5,
  carpoolPassengers: 0,
  publicTransportPass: false,

  envisagedMode: "vehicule_identique",
  envisagedVehicleType: "",
  envisagedFuelType: "",
  envisagedFiscalCv: 0,
  envisagedConsumption: 0,

  openToRemote: false,
};

export default function ProfilPage() {
  const { profile, loading, refresh } = useMe();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    if (!profile) return;
    setForm({
      romeCode: profile.rome_code,
      secteurNaf: profile.secteur_naf || SECTEURS_NAF[0],
      conventionCollective: profile.convention_collective || CONVENTIONS_COLLECTIVES[0],
      classification: profile.classification,
      contractType: profile.contract_type,
      workTimePct: profile.work_time_pct,
      salaireBrutAnnuel: profile.salaire_brut_annuel,
      partVariablePct: profile.part_variable_pct,
      primeAnciennete: !!profile.prime_anciennete,
      interessement: !!profile.interessement,
      participation: !!profile.participation,
      mutuelleTauxEmployeur: profile.mutuelle_taux_employeur,
      ticketsRestoMontant: profile.tickets_resto_montant,
      rttJours: profile.rtt_jours,
      cse: !!profile.cse,
      vehiculeFonction: !!profile.vehicule_fonction,
      teleworkDaysPerWeek: profile.telework_days_per_week,
      horaires: profile.horaires,
      penibilite: profile.penibilite,
      deplacementsFrequence: profile.deplacements_frequence,
      diplomeRequis: profile.diplome_requis,
      experienceAnnees: profile.experience_annees,
      certifications: profile.certifications,
      permis: profile.permis,
      langues: profile.langues,
      subjManagement: profile.subj_management,
      subjValeurs: profile.subj_valeurs,
      subjAmbiance: profile.subj_ambiance,
      subjEvolution: profile.subj_evolution,
      subjStress: profile.subj_stress,
      residenceCity: profile.residence_city,
      workplaceCity: profile.workplace_city,
      commuteDaysPerWeek: profile.commute_days_per_week,
      searchRadiusKm: profile.search_radius_km,
      currentVehicleType: profile.current_vehicle_type,
      currentFuelType: profile.current_fuel_type,
      currentFiscalCv: profile.current_fiscal_cv,
      currentConsumption: profile.current_consumption,
      currentVehicleAge: profile.current_vehicle_age,
      carpoolPassengers: profile.carpool_passengers,
      publicTransportPass: !!profile.public_transport_pass,
      envisagedMode: profile.envisaged_mode,
      envisagedVehicleType: profile.envisaged_vehicle_type,
      envisagedFuelType: profile.envisaged_fuel_type,
      envisagedFiscalCv: profile.envisaged_fiscal_cv,
      envisagedConsumption: profile.envisaged_consumption,
      openToRemote: !!profile.open_to_remote,
    });
  }, [profile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(null);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'enregistrement.");
        return;
      }
      setSaved(
        data.routeSource === "openrouteservice"
          ? "Profil enregistré — distance calculée par itinéraire routier réel."
          : "Profil enregistré — distance estimée (aucune clé OpenRouteService configurée, voir README)."
      );
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-fog text-sm">Chargement…</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-ink mb-1">Mon profil</h1>
      <p className="text-fog text-sm mb-8">
        Ces informations sont anonymisées côté matching (seul un pseudonyme
        métier + zone est visible des autres utilisateurs).
      </p>

      {error && (
        <div className="bg-coralL text-coral text-sm rounded-sm px-3 py-2 mb-4">{error}</div>
      )}
      {saved && (
        <div className="bg-seaL text-sea text-sm rounded-sm px-3 py-2 mb-4">{saved}</div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <Section title="Poste et contrat">
          <Field label="Métier (code ROME)">
            <select className="input" value={form.romeCode} onChange={(e) => set("romeCode", e.target.value)}>
              {ROME_CODES.map((r) => (
                <option key={r.code} value={r.code}>{r.label} — {r.code}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Secteur d'activité (NAF)">
              <select className="input" value={form.secteurNaf} onChange={(e) => set("secteurNaf", e.target.value)}>
                {SECTEURS_NAF.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Convention collective">
              <select className="input" value={form.conventionCollective} onChange={(e) => set("conventionCollective", e.target.value)}>
                {CONVENTIONS_COLLECTIVES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Classification">
              <select className="input" value={form.classification} onChange={(e) => set("classification", e.target.value)}>
                {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Type de contrat">
              <select className="input" value={form.contractType} onChange={(e) => set("contractType", e.target.value)}>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
              </select>
            </Field>
            <Field label="Temps de travail (%)">
              <input type="number" min={20} max={100} className="input" value={form.workTimePct}
                onChange={(e) => set("workTimePct", Number(e.target.value))} />
            </Field>
          </div>
        </Section>

        <Section title="Rémunération">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Salaire brut annuel (€)">
              <input type="number" min={0} className="input" value={form.salaireBrutAnnuel}
                onChange={(e) => set("salaireBrutAnnuel", Number(e.target.value))} />
            </Field>
            <Field label="Part variable (%)">
              <input type="number" min={0} max={100} className="input" value={form.partVariablePct}
                onChange={(e) => set("partVariablePct", Number(e.target.value))} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-ink2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.primeAnciennete} onChange={(e) => set("primeAnciennete", e.target.checked)} />
              Prime d'ancienneté
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.interessement} onChange={(e) => set("interessement", e.target.checked)} />
              Intéressement
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.participation} onChange={(e) => set("participation", e.target.checked)} />
              Participation
            </label>
          </div>
        </Section>

        <Section title="Avantages sociaux">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mutuelle — prise en charge employeur (%)">
              <input type="number" min={0} max={100} className="input" value={form.mutuelleTauxEmployeur}
                onChange={(e) => set("mutuelleTauxEmployeur", Number(e.target.value))} />
            </Field>
            <Field label="Ticket restaurant (montant unitaire €)">
              <input type="number" min={0} step={0.1} className="input" value={form.ticketsRestoMontant}
                onChange={(e) => set("ticketsRestoMontant", Number(e.target.value))} />
            </Field>
            <Field label="RTT (jours/an)">
              <input type="number" min={0} max={30} className="input" value={form.rttJours}
                onChange={(e) => set("rttJours", Number(e.target.value))} />
            </Field>
            <Field label="Télétravail (jours/semaine)">
              <input type="number" min={0} max={5} className="input" value={form.teleworkDaysPerWeek}
                onChange={(e) => set("teleworkDaysPerWeek", Number(e.target.value))} />
            </Field>
          </div>
          <div className="flex gap-4 text-sm text-ink2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.cse} onChange={(e) => set("cse", e.target.checked)} />
              CSE actif
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.vehiculeFonction} onChange={(e) => set("vehiculeFonction", e.target.checked)} />
              Véhicule de fonction
            </label>
          </div>
        </Section>

        <Section title="Conditions de travail et prérequis">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Horaires">
              <select className="input" value={form.horaires} onChange={(e) => set("horaires", e.target.value)}>
                {HORAIRES.map((h) => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
            </Field>
            <Field label="Fréquence des déplacements">
              <select className="input" value={form.deplacementsFrequence} onChange={(e) => set("deplacementsFrequence", e.target.value)}>
                {DEPLACEMENTS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label={`Pénibilité perçue : ${form.penibilite}/5`}>
            <input type="range" min={0} max={5} className="w-full accent-sea2" value={form.penibilite}
              onChange={(e) => set("penibilite", Number(e.target.value))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Diplôme requis">
              <input className="input" value={form.diplomeRequis} onChange={(e) => set("diplomeRequis", e.target.value)} placeholder="ex. Bac+2 logistique" />
            </Field>
            <Field label="Expérience minimale (années)">
              <input type="number" min={0} className="input" value={form.experienceAnnees} onChange={(e) => set("experienceAnnees", Number(e.target.value))} />
            </Field>
            <Field label="Certifications / habilitations">
              <input className="input" value={form.certifications} onChange={(e) => set("certifications", e.target.value)} placeholder="ex. CACES 3, habilitation électrique" />
            </Field>
            <Field label="Permis requis">
              <input className="input" value={form.permis} onChange={(e) => set("permis", e.target.value)} placeholder="ex. B, C" />
            </Field>
          </div>
          <Field label="Langues">
            <input className="input" value={form.langues} onChange={(e) => set("langues", e.target.value)} placeholder="ex. Anglais courant" />
          </Field>
        </Section>

        <Section title="Votre ressenti sur le poste actuel" subtitle="Auto-évaluation, sert à décrire aux autres à quoi ressemble votre poste (échelle 1 à 5).">
          {([
            ["subjManagement", "Qualité du management"],
            ["subjValeurs", "Adhésion aux valeurs de l'entreprise"],
            ["subjAmbiance", "Ambiance d'équipe"],
            ["subjEvolution", "Perspectives d'évolution"],
            ["subjStress", "Niveau de stress (5 = élevé)"],
          ] as const).map(([key, label]) => (
            <Field key={key} label={`${label} : ${form[key]}/5`}>
              <input type="range" min={1} max={5} className="w-full accent-sea2" value={form[key]}
                onChange={(e) => set(key, Number(e.target.value))} />
            </Field>
          ))}
        </Section>

        <Section title="Votre trajet actuel" subtitle="La distance est calculée par itinéraire routier réel, pas à vol d'oiseau.">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ville de résidence">
              <select className="input" value={form.residenceCity} onChange={(e) => set("residenceCity", e.target.value)}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Ville de votre lieu de travail actuel">
              <select className="input" value={form.workplaceCity} onChange={(e) => set("workplaceCity", e.target.value)}>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label={`Jours travaillés sur site / semaine : ${form.commuteDaysPerWeek}`}>
            <input type="range" min={0} max={5} className="w-full accent-sea2" value={form.commuteDaysPerWeek}
              onChange={(e) => set("commuteDaysPerWeek", Number(e.target.value))} />
          </Field>
          <Field label="Rayon de recherche souhaité autour de votre domicile">
            <select className="input" value={form.searchRadiusKm} onChange={(e) => set("searchRadiusKm", Number(e.target.value))}>
              <option value={0}>Pas de limite</option>
              <option value={15}>15 km</option>
              <option value={25}>25 km</option>
              <option value={40}>40 km</option>
              <option value={60}>60 km</option>
              <option value={100}>100 km</option>
            </select>
            <p className="text-[11px] text-fog mt-1">
              Les matches dont le nouveau trajet dépasserait ce rayon ne vous seront pas proposés.
            </p>
          </Field>
        </Section>

        <Section title="Votre véhicule actuel">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type de véhicule">
              <select className="input" value={form.currentVehicleType} onChange={(e) => set("currentVehicleType", e.target.value)}>
                {VEHICLE_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </Field>
            <Field label="Motorisation / carburant">
              <select className="input" value={form.currentFuelType} onChange={(e) => set("currentFuelType", e.target.value)}>
                {FUEL_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </Field>
            <Field label="Puissance fiscale (CV, carte grise case P.6)">
              <input type="number" min={1} max={20} className="input" value={form.currentFiscalCv}
                onChange={(e) => set("currentFiscalCv", Number(e.target.value))} />
            </Field>
            <Field label="Consommation réelle (L ou kWh /100km)">
              <input type="number" min={0} step={0.1} className="input" value={form.currentConsumption}
                onChange={(e) => set("currentConsumption", Number(e.target.value))} />
            </Field>
            <Field label="Âge du véhicule (années)">
              <input type="number" min={0} className="input" value={form.currentVehicleAge}
                onChange={(e) => set("currentVehicleAge", Number(e.target.value))} />
            </Field>
            <Field label="Passagers habituels en covoiturage">
              <input type="number" min={0} max={4} className="input" value={form.carpoolPassengers}
                onChange={(e) => set("carpoolPassengers", Number(e.target.value))} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink2">
            <input type="checkbox" checked={form.publicTransportPass} onChange={(e) => set("publicTransportPass", e.target.checked)} />
            J'ai déjà un abonnement transport en commun
          </label>
        </Section>

        <Section title="Mobilité envisagée après un échange" subtitle="Comment comptez-vous vous déplacer une fois plus proche ?">
          <Field label="Mode envisagé">
            <select className="input" value={form.envisagedMode} onChange={(e) => set("envisagedMode", e.target.value)}>
              {ENVISAGED_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          {form.envisagedMode === "vehicule_electrique" && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Puissance fiscale du futur véhicule">
                <input type="number" min={1} max={20} className="input" value={form.envisagedFiscalCv}
                  onChange={(e) => set("envisagedFiscalCv", Number(e.target.value))} />
              </Field>
              <Field label="Consommation (kWh/100km)">
                <input type="number" min={0} step={0.1} className="input" value={form.envisagedConsumption}
                  onChange={(e) => set("envisagedConsumption", Number(e.target.value))} />
              </Field>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-ink2">
            <input type="checkbox" checked={form.openToRemote} onChange={(e) => set("openToRemote", e.target.checked)} />
            Ouvert à un poste en partie télétravaillable
          </label>
        </Section>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? "Enregistrement…" : "Enregistrer mon profil"}
        </button>
      </form>
    </div>
  );
}
