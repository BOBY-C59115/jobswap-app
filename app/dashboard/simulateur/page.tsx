"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMe } from "@/lib/useMe";
import { annualTransportCost, FuelType } from "@/lib/bareme";
import { emissionsForMode, fmtCO2Kg } from "@/lib/emissions";
import { FUEL_TYPES, ENVISAGED_MODES } from "@/lib/refdata";

function fmtEUR(n: number) {
  return Math.abs(n) >= 1000
    ? (n / 1000).toFixed(1).replace(".", ",") + " K€"
    : Math.round(n) + " €";
}

export default function SimulateurPage() {
  const { profile, loading } = useMe();

  // Trajets par jour : 1 aller-retour (par défaut) ou 2 (ex. retour le midi)
  const [tripsPerDay, setTripsPerDay] = useState(1);
  const [distanceKm, setDistanceKm] = useState(0); // distance réelle aller (un seul sens)
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [fuelType, setFuelType] = useState<FuelType>("sp98");
  const [fiscalCv, setFiscalCv] = useState(6);
  const [consumption, setConsumption] = useState(6.5);

  const [envisagedMode, setEnvisagedMode] = useState<
    "vehicule_identique" | "vehicule_electrique" | "vae" | "marche" | "transport_commun" | "covoiturage"
  >("vehicule_identique");
  const [envisagedDistanceKm, setEnvisagedDistanceKm] = useState(0);

  // Pré-remplissage depuis le vrai profil (distance réelle calculée par itinéraire routier)
  useEffect(() => {
    if (!profile) return;
    setDistanceKm(profile.commute_distance_km || 0);
    setDaysPerWeek(profile.commute_days_per_week || 5);
    setFuelType((profile.current_fuel_type || "sp98") as FuelType);
    setFiscalCv(profile.current_fiscal_cv || 6);
    setConsumption(profile.current_consumption || 6.5);
    setEnvisagedMode((profile.envisaged_mode || "vehicule_identique") as any);
    // Par défaut, hypothèse d'un nouveau trajet 3x plus court pour explorer un scénario
    setEnvisagedDistanceKm(Math.round((profile.commute_distance_km || 10) / 3));
  }, [profile]);

  const result = useMemo(() => {
    const daysPerYear = daysPerWeek * 47;
    const annualKmCurrent = distanceKm * 2 * tripsPerDay * daysPerYear;
    const annualKmEnvisaged = envisagedDistanceKm * 2 * tripsPerDay * daysPerYear;

    const currentCost = annualTransportCost("vehicule_identique", fiscalCv, fuelType, annualKmCurrent);
    const envisagedCost = annualTransportCost(envisagedMode, fiscalCv, fuelType, annualKmEnvisaged);

    const currentEmissions = emissionsForMode("vehicule_identique", fuelType, consumption, annualKmCurrent);
    const envisagedEmissions = emissionsForMode(envisagedMode, fuelType, consumption, annualKmEnvisaged);

    const avgSpeedKmh = 52;
    const currentHours = annualKmCurrent / avgSpeedKmh;
    const envisagedHours = annualKmEnvisaged / avgSpeedKmh;

    return {
      annualKmCurrent: Math.round(annualKmCurrent),
      annualKmEnvisaged: Math.round(annualKmEnvisaged),
      currentCost,
      envisagedCost,
      economicGain: currentCost - envisagedCost,
      currentEmissions,
      envisagedEmissions,
      co2Gain: currentEmissions - envisagedEmissions,
      currentHours: Math.round(currentHours),
      envisagedHours: Math.round(envisagedHours),
      timeGainHours: Math.round(currentHours - envisagedHours),
    };
  }, [distanceKm, envisagedDistanceKm, tripsPerDay, daysPerWeek, fuelType, fiscalCv, consumption, envisagedMode]);

  if (loading) return <div className="text-fog text-sm">Chargement…</div>;

  if (!profile) {
    return (
      <div className="card p-6">
        <p className="text-sm text-ink2 mb-3">
          Complétez votre profil (ville de résidence, ville de travail, véhicule) pour utiliser le simulateur avec vos vraies données.
        </p>
        <Link href="/dashboard/profil" className="btn-primary px-4 py-2 inline-block text-sm">
          Compléter mon profil
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink mb-1">Simulateur d&apos;impact</h1>
      <p className="text-fog text-sm mb-2">
        Pré-rempli avec votre profil : {profile.residence_city} → {profile.workplace_city}
        {" "}({profile.commute_distance_km} km réels par itinéraire routier). Modifiable pour explorer d&apos;autres scénarios.
      </p>
      <p className="text-[11px] text-fog mb-8">
        Calculs basés sur le barème kilométrique fiscal officiel et les facteurs d&apos;émission ADEME
        (les mêmes que ceux utilisés pour vos matches).
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-5">
          <h2 className="font-heading text-sm font-bold text-ink">Votre trajet actuel</h2>

          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Distance aller (un seul sens) : {distanceKm} km
            </label>
            <input type="range" min={1} max={150} value={distanceKm}
              onChange={(e) => setDistanceKm(Number(e.target.value))} className="w-full accent-sea2" />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">Trajets par jour</label>
            <select className="input" value={tripsPerDay} onChange={(e) => setTripsPerDay(Number(e.target.value))}>
              <option value={1}>1 aller-retour (trajet classique)</option>
              <option value={2}>2 aller-retours (ex. retour le midi)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Jours travaillés sur site : {daysPerWeek} / semaine
            </label>
            <input type="range" min={1} max={5} value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))} className="w-full accent-sea2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink2 mb-1">Motorisation actuelle</label>
              <select className="input" value={fuelType} onChange={(e) => setFuelType(e.target.value as FuelType)}>
                {FUEL_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink2 mb-1">Puissance fiscale (CV)</label>
              <input type="number" min={1} max={20} className="input" value={fiscalCv}
                onChange={(e) => setFiscalCv(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Consommation réelle : {consumption} {fuelType === "electrique" ? "kWh" : "L"}/100km
            </label>
            <input type="range" min={0} max={20} step={0.5} value={consumption}
              onChange={(e) => setConsumption(Number(e.target.value))} className="w-full accent-sea2" />
          </div>

          <h2 className="font-heading text-sm font-bold text-ink pt-2 border-t border-ice2">
            Scénario envisagé après échange
          </h2>
          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">Mode envisagé</label>
            <select className="input" value={envisagedMode} onChange={(e) => setEnvisagedMode(e.target.value as any)}>
              {ENVISAGED_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Nouvelle distance aller : {envisagedDistanceKm} km
            </label>
            <input type="range" min={0} max={150} value={envisagedDistanceKm}
              onChange={(e) => setEnvisagedDistanceKm(Number(e.target.value))} className="w-full accent-sea2" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Kilométrage annuel actuel → envisagé</div>
            <div className="font-heading text-lg font-bold text-ink">
              {result.annualKmCurrent.toLocaleString("fr-FR")} km → {result.annualKmEnvisaged.toLocaleString("fr-FR")} km
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Coût annuel (barème fiscal officiel)</div>
            <div className="font-heading text-lg font-bold text-ink">
              {fmtEUR(result.currentCost)} → {fmtEUR(result.envisagedCost)}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Temps de trajet estimé</div>
            <div className="font-heading text-lg font-bold text-ink">
              {result.currentHours} h/an → {result.envisagedHours} h/an
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Émissions CO2 (facteurs ADEME)</div>
            <div className="font-heading text-lg font-bold text-ink">
              {fmtCO2Kg(result.currentEmissions)} → {fmtCO2Kg(result.envisagedEmissions)}
            </div>
          </div>

          <div className="card p-5 border border-seaL bg-seaL/40">
            <div className="text-xs text-sea mb-1">Gain estimé si ce scénario se réalise</div>
            <div className="font-heading text-xl font-bold text-sea">
              {result.economicGain >= 0 ? "+" : ""}{fmtEUR(result.economicGain)}/an ·{" "}
              {result.co2Gain >= 0 ? "-" : "+"}{fmtCO2Kg(Math.abs(result.co2Gain))}/an ·{" "}
              {result.timeGainHours >= 0 ? "+" : ""}{result.timeGainHours} h/an
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
