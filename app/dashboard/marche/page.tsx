"use client";
import { useMe } from "@/lib/useMe";
import { MarketStats } from "@/components/MarketStats";
import Link from "next/link";

export default function MarchePage() {
  const { profile, loading } = useMe();

  if (loading) return <div className="text-fog text-sm">Chargement…</div>;

  if (!profile) {
    return (
      <div className="card p-6">
        <p className="text-sm text-ink2 mb-3">Complétez votre profil pour voir le marché de l'emploi autour de vous.</p>
        <Link href="/dashboard/profil" className="btn-primary px-4 py-2 inline-block text-sm">
          Compléter mon profil
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink mb-1">Marché de l'emploi</h1>
      <p className="text-fog text-sm mb-8">
        Données publiques en temps réel pour votre métier ({profile.rome_label}) et votre secteur, autour de {profile.workplace_city}.
      </p>
      <MarketStats romeCode={profile.rome_code} city={profile.workplace_city} secteurNaf={profile.secteur_naf} />

      <p className="text-[11px] text-fog mt-6">
        Ces chiffres décrivent le marché de l'emploi général (offres ouvertes,
        établissements recensés), pas le nombre de salariés inscrits sur
        JobSwap prêts à échanger — cette dernière donnée dépend uniquement de
        la croissance de la communauté.
      </p>
    </div>
  );
}
