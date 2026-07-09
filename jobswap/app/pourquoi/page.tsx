"use client";
import { useState } from "react";
import Link from "next/link";
import { MarketStats } from "@/components/MarketStats";
import { ROME_CODES } from "@/lib/rome";

const CITIES = [
  "Lyon", "Roanne", "Villeurbanne", "Saint-Étienne", "Lille", "Roubaix",
  "Tourcoing", "Douai", "Valenciennes", "Arras", "Paris", "Nantes", "Rennes",
  "Bordeaux", "Toulouse", "Marseille", "Grenoble",
];

const STATS = [
  {
    chiffre: "6,8/10 vs 6,4/10",
    label: "Note de bien-être au travail : salariés à trajet court vs salariés à plus d'1h de trajet",
    source: "Étude Paris Workplace / IFOP, 2018",
  },
  {
    chiffre: "88 %",
    label: "des actifs déclarent que la durée de leur trajet influence significativement leurs choix de changement de poste",
    source: "Étude OpinionWay pour Newton Offices, 2024",
  },
  {
    chiffre: "54 %",
    label: "des actifs redoutent quotidiennement les problèmes de trajet domicile-travail",
    source: "Étude OpinionWay pour Newton Offices, 2024",
  },
  {
    chiffre: "-16 min",
    label: "de présence au bureau par jour au-delà de 40 minutes de trajet (fatigue, retards)",
    source: "Étude Paris Workplace / IFOP, 2018",
  },
];

export default function PourquoiPage() {
  const [romeCode, setRomeCode] = useState("N1301");
  const [city, setCity] = useState("Roanne");

  return (
    <main className="min-h-screen bg-ice">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <Link href="/" className="text-sm text-sea font-medium">← Retour à l'accueil</Link>

        <h1 className="font-heading text-3xl font-bold text-ink mt-4 mb-2">
          Pourquoi le trajet domicile-travail compte
        </h1>
        <p className="text-fog text-sm mb-10">
          Des données publiques, vérifiables, pour comprendre ce que peut
          changer un échange de poste — pas des promesses en l'air.
        </p>

        <section className="mb-12">
          <h2 className="font-heading text-lg font-bold text-ink mb-4">
            Ce que disent les études sur trajet et bien-être
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="card p-5">
                <div className="font-heading text-2xl font-bold text-sea2">{s.chiffre}</div>
                <div className="text-sm text-ink2 mt-1">{s.label}</div>
                <div className="text-[11px] text-fog mt-2">Source : {s.source}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-fog mt-3">
            Ces statistiques portent sur les trajets domicile-travail en général
            (durée, mode de transport). Il n'existe pas aujourd'hui de donnée
            publique détaillant le bien-être par métier précis — l'enquête de
            référence sur ce sujet (Insee/Dares, "Conditions de travail et
            risques psychosociaux") publie ses premiers résultats à partir de
            2026. Nous mettrons cette page à jour dès leur publication.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg font-bold text-ink mb-1">
            Le marché de l'emploi près de chez vous, en direct
          </h2>
          <p className="text-fog text-sm mb-4">
            Choisissez un métier et une ville pour voir des chiffres réels et
            actuels — pas une estimation.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <select className="input" value={romeCode} onChange={(e) => setRomeCode(e.target.value)}>
              {ROME_CODES.map((r) => (
                <option key={r.code} value={r.code}>{r.label}</option>
              ))}
            </select>
            <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <MarketStats romeCode={romeCode} city={city} />
        </section>

        <div className="mt-12 text-center">
          <Link href="/inscription" className="btn-primary px-6 py-3 inline-block">
            Créer mon profil anonyme
          </Link>
        </div>
      </div>
    </main>
  );
}
