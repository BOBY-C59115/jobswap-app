"use client";
import { useEffect, useState } from "react";
import { useMe } from "@/lib/useMe";

const ROME_CODES = [
  { code: "N1301", label: "Conduite de transport de marchandises" },
  { code: "N1303", label: "Intervention technique d'exploitation logistique" },
  { code: "M1607", label: "Secrétariat" },
  { code: "M1203", label: "Comptabilité" },
  { code: "M1204", label: "Contrôle de gestion" },
  { code: "M1701", label: "Administration des ventes" },
  { code: "M1705", label: "Marketing" },
  { code: "D1401", label: "Assistanat commercial" },
  { code: "D1402", label: "Relation commerciale grands comptes" },
  { code: "H1102", label: "Management et ingénierie études, R&D industriel" },
  { code: "H2102", label: "Conduite d'équipement de production industrielle" },
  { code: "H2504", label: "Installation et maintenance électronique" },
  { code: "I1310", label: "Maintenance mécanique industrielle" },
  { code: "K1802", label: "Développement local" },
  { code: "M1502", label: "Développement des ressources humaines" },
  { code: "M1503", label: "Management des ressources humaines" },
];

const CITIES = [
  "Lyon",
  "Roanne",
  "Villeurbanne",
  "Saint-Étienne",
  "Lille",
  "Roubaix",
  "Tourcoing",
  "Douai",
  "Valenciennes",
  "Arras",
  "Paris",
  "Nantes",
  "Rennes",
  "Bordeaux",
  "Toulouse",
  "Marseille",
  "Grenoble",
];

const CLASSIFICATIONS = [
  "Employé",
  "Agent de maîtrise",
  "Technicien",
  "Cadre N1",
  "Cadre N2",
  "Cadre N3",
];

export default function ProfilPage() {
  const { profile, loading, refresh } = useMe();
  const [romeCode, setRomeCode] = useState("N1301");
  const [classification, setClassification] = useState("Employé");
  const [contractType, setContractType] = useState("CDI");
  const [city, setCity] = useState("Lyon");
  const [commuteKm, setCommuteKm] = useState(20);
  const [openToRemote, setOpenToRemote] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setRomeCode(profile.rome_code);
      setClassification(profile.classification);
      setContractType(profile.contract_type);
      setCity(profile.city);
      setCommuteKm(profile.commute_km);
      setOpenToRemote(!!profile.open_to_remote);
    }
  }, [profile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          romeCode,
          classification,
          contractType,
          city,
          commuteKm,
          openToRemote,
        }),
      });
      if (res.ok) {
        setSaved(true);
        await refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-fog text-sm">Chargement…</div>;

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-bold text-ink mb-1">
        Mon profil
      </h1>
      <p className="text-fog text-sm mb-8">
        Ces informations sont anonymisées : aucune identité n&apos;est
        associée à votre profil de matching.
      </p>

      <form onSubmit={onSubmit} className="card p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-ink2 mb-1">
            Métier (code ROME)
          </label>
          <select
            className="input"
            value={romeCode}
            onChange={(e) => setRomeCode(e.target.value)}
          >
            {ROME_CODES.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label} — {r.code}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Classification
            </label>
            <select
              className="input"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
            >
              {CLASSIFICATIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Type de contrat
            </label>
            <select
              className="input"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
            >
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink2 mb-1">
            Ville de votre lieu de travail actuel
          </label>
          <select
            className="input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink2 mb-1">
            Trajet domicile-travail actuel : {commuteKm} km / jour
          </label>
          <input
            type="range"
            min={0}
            max={150}
            value={commuteKm}
            onChange={(e) => setCommuteKm(Number(e.target.value))}
            className="w-full accent-sea2"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink2">
          <input
            type="checkbox"
            checked={openToRemote}
            onChange={(e) => setOpenToRemote(e.target.checked)}
          />
          Ouvert à un poste en partie télétravaillable
        </label>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full py-3"
        >
          {saving ? "Enregistrement…" : "Enregistrer mon profil"}
        </button>
        {saved && (
          <p className="text-sea text-sm text-center">
            Profil enregistré. Vos matches ont été recalculés.
          </p>
        )}
      </form>
    </div>
  );
}
