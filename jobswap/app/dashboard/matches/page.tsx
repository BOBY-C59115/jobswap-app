"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Match = {
  id: string;
  pseudonym: string;
  romeLabel: string;
  romeCode: string;
  classification: string;
  city: string;
  score: number;
  distanceEconomyKm: number;
  breakdown: {
    metier: number;
    classification: number;
    contrat: number;
    proximite: number;
  };
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    fetch("/api/matches")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Erreur inconnue.");
          return;
        }
        if (data.disabled) {
          setDisabled(true);
          setError(data.reason);
          return;
        }
        setMatches(data.matches);
      })
      .catch(() => setError("Impossible de charger les matches."));
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink mb-1">
        Mes matches
      </h1>
      <p className="text-fog text-sm mb-8">
        Score de compatibilité calculé sur le métier, la classification, le
        type de contrat et la proximité géographique.
      </p>

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
        <div className="card p-6 text-sm text-fog">
          Aucun match pour le moment. Revenez bientôt.
        </div>
      )}

      <div className="space-y-3">
        {matches?.map((m) => (
          <div key={m.id} className="card p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-seaL flex items-center justify-center shrink-0">
              <span className="score-badge text-sea text-sm">{m.score}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-ink text-sm">
                {m.pseudonym}
              </div>
              <div className="text-xs text-fog">
                {m.romeLabel} · {m.classification} · {m.city}
              </div>
              <div className="text-xs text-sea2 mt-1">
                ~{m.distanceEconomyKm} km/jour économisés en cas d&apos;échange
              </div>
            </div>
            <div className="hidden sm:flex flex-col gap-0.5 text-[10px] text-fog font-mono text-right shrink-0">
              <span>métier {m.breakdown.metier}/40</span>
              <span>niveau {m.breakdown.classification}/20</span>
              <span>proximité {m.breakdown.proximite}/30</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
