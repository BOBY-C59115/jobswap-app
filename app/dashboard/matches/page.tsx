"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Match = {
  id: string;
  pseudonym: string;
  romeLabel: string;
  romeCode: string;
  classification: string;
  secteurNaf: string;
  salaireBrutAnnuel: number;
  rttJours: number;
  teleworkDaysPerWeek: number;
  workplaceCity: string;
  score: number;
  breakdown: {
    metier: number;
    classification: number;
    contrat: number;
    remuneration: number;
    attractivite: number;
    distance: number;
    temps: number;
  };
  gains: {
    newDistanceKm: number;
    newDurationMin: number;
    distanceSavedKmPerDay: number;
    timeSavedMinPerDay: number;
    timeSavedHoursPerYear: number;
    economicGainPerYear: number;
    co2SavedKgPerYear: number;
    routeSource: "openrouteservice" | "estimation";
  };
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchRadiusKm, setSearchRadiusKm] = useState(0);
  const [excludedByRadius, setExcludedByRadius] = useState(0);

  useEffect(() => {
    fetch("/api/matches")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Erreur inconnue."); return; }
        if (data.disabled) { setDisabled(true); setError(data.reason); return; }
        setMatches(data.matches);
        setSearchRadiusKm(data.searchRadiusKm || 0);
        setExcludedByRadius(data.excludedByRadius || 0);
      })
      .catch(() => setError("Impossible de charger les matches."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink mb-1">Mes matches</h1>
      <p className="text-fog text-sm mb-2">
        Score de compatibilité (métier, classification, rémunération,
        attractivité du poste, gain de distance ET gain de temps réel) et
        estimation du gain économique/écologique si vous échangez avec ce
        profil.
      </p>
      {searchRadiusKm > 0 && (
        <p className="text-[11px] text-fog mb-8">
          Recherche limitée à {searchRadiusKm} km autour de votre domicile
          {excludedByRadius > 0 && ` (${excludedByRadius} profil${excludedByRadius > 1 ? "s" : ""} écarté${excludedByRadius > 1 ? "s" : ""} car trop loin)`}
          {" — "}
          <Link href="/dashboard/profil" className="text-sea underline">modifier ce rayon</Link>
        </p>
      )}
      {searchRadiusKm === 0 && <div className="mb-8" />}

      {loading && <div className="text-fog text-sm">Calcul des matches en cours…</div>}

      {error && (
        <div className="card p-6 border border-coralL bg-coralL/40 text-coral text-sm mb-6">
          {error}
          {disabled && (
            <div className="mt-3">
              <Link href="/dashboard/confidentialite" className="btn-primary px-4 py-2 inline-block text-xs">
                Gérer mes consentements
              </Link>
            </div>
          )}
        </div>
      )}

      {matches && matches.length === 0 && !error && (
        <div className="card p-6 text-sm text-fog">Aucun match pour le moment. Revenez bientôt.</div>
      )}

      <div className="space-y-4">
        {matches?.map((m) => (
          <div key={m.id} className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-seaL flex items-center justify-center shrink-0">
                <span className="score-badge text-sea text-sm">{m.score}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink text-sm">{m.pseudonym}</div>
                <div className="text-xs text-fog">
                  {m.romeLabel} · {m.classification} · {m.secteurNaf} · {m.workplaceCity}
                </div>
                <div className="text-xs text-fog mt-0.5">
                  {m.salaireBrutAnnuel.toLocaleString("fr-FR")} € brut/an · {m.rttJours} RTT ·
                  {" "}{m.teleworkDaysPerWeek}j télétravail/sem.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-ice2">
              <div>
                <div className="text-[10px] text-fog uppercase">Nouveau trajet</div>
                <div className="text-sm font-medium text-ink">{m.gains.newDistanceKm} km · {m.gains.newDurationMin} min</div>
              </div>
              <div>
                <div className="text-[10px] text-fog uppercase">Gain distance/jour</div>
                <div className="text-sm font-medium text-sea2">
                  {m.gains.distanceSavedKmPerDay > 0 ? `-${m.gains.distanceSavedKmPerDay} km` : "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-fog uppercase">Gain temps/jour</div>
                <div className="text-sm font-medium text-sea2">
                  {m.gains.timeSavedMinPerDay > 0 ? `-${m.gains.timeSavedMinPerDay} min` : "—"}
                  {m.gains.timeSavedHoursPerYear > 0 && (
                    <span className="text-[10px] text-fog"> ({m.gains.timeSavedHoursPerYear} h/an)</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-fog uppercase">Gain économique/an</div>
                <div className="text-sm font-medium text-sea2">
                  {m.gains.economicGainPerYear > 0 ? `+${m.gains.economicGainPerYear} €` : `${m.gains.economicGainPerYear} €`}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-fog uppercase">CO2 évité/an</div>
                <div className="text-sm font-medium text-sea2">
                  {m.gains.co2SavedKgPerYear > 0 ? `-${m.gains.co2SavedKgPerYear} kg` : "—"}
                </div>
              </div>
            </div>
            {m.gains.routeSource === "estimation" && (
              <div className="text-[10px] text-fog mt-2">
                Distance estimée (clé OpenRouteService non configurée) — voir README pour activer le calcul d'itinéraire réel.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
