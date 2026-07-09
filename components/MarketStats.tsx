"use client";
import { useEffect, useState } from "react";

type MarketData = {
  romeLabel: string;
  city: string;
  departement: string;
  offresEmploi: {
    total: number;
    echantillon: { intitule: string; entreprise: string; ville: string; typeContrat: string }[];
  } | null;
  entreprises: { total: number } | null;
} | null;

export function MarketStats({
  romeCode,
  city,
  secteurNaf,
}: {
  romeCode?: string;
  city?: string;
  secteurNaf?: string;
}) {
  const [data, setData] = useState<MarketData>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (romeCode) params.set("romeCode", romeCode);
    if (city) params.set("city", city);
    if (secteurNaf) params.set("secteurNaf", secteurNaf);

    fetch(`/api/marche?${params.toString()}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) { setError(json.error || "Erreur."); return; }
        setData(json);
      })
      .catch(() => setError("Impossible de charger les données de marché."))
      .finally(() => setLoading(false));
  }, [romeCode, city, secteurNaf]);

  if (loading) return <div className="text-fog text-sm">Consultation des données publiques en cours…</div>;
  if (error) return <div className="text-coral text-sm">{error}</div>;
  if (!data) return null;

  const noKeyConfigured = data.offresEmploi === null;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="card p-5">
        <div className="text-xs text-fog mb-1">
          Offres d'emploi ouvertes — {data.romeLabel}, département {data.departement}
        </div>
        {noKeyConfigured ? (
          <div className="text-sm text-fog italic">
            Non disponible (clé France Travail non configurée sur ce déploiement)
          </div>
        ) : (
          <>
            <div className="font-heading text-2xl font-bold text-ink">
              {data.offresEmploi!.total}
            </div>
            <div className="text-[11px] text-fog mt-1">
              Source : France Travail, en temps réel — francetravail.fr
            </div>
          </>
        )}
      </div>

      <div className="card p-5">
        <div className="text-xs text-fog mb-1">
          Établissements du secteur — {data.city}
        </div>
        {data.entreprises === null ? (
          <div className="text-sm text-fog italic">Non disponible pour ce secteur</div>
        ) : (
          <>
            <div className="font-heading text-2xl font-bold text-ink">
              {data.entreprises.total}
            </div>
            <div className="text-[11px] text-fog mt-1">
              Source : INSEE (répertoire Sirene), via recherche-entreprises.api.gouv.fr
            </div>
          </>
        )}
      </div>

      {data.offresEmploi && data.offresEmploi.echantillon.length > 0 && (
        <div className="sm:col-span-2 card p-5">
          <div className="text-xs text-fog mb-2">Exemples d'offres actuellement en ligne</div>
          <div className="space-y-2">
            {data.offresEmploi.echantillon.map((o, i) => (
              <div key={i} className="text-sm text-ink2 border-b border-ice2 last:border-0 pb-2 last:pb-0">
                <span className="font-medium text-ink">{o.intitule}</span>
                {" — "}{o.entreprise} · {o.ville} · {o.typeContrat}
              </div>
            ))}
          </div>
          <div className="text-[11px] text-fog mt-3">
            Ces offres proviennent de France Travail et ne sont pas des profils JobSwap.
            Consultez-les sur{" "}
            <a href="https://www.francetravail.fr" target="_blank" rel="noopener noreferrer" className="text-sea underline">
              francetravail.fr
            </a>.
          </div>
        </div>
      )}
    </div>
  );
}
