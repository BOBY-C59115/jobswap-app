"use client";
import Link from "next/link";
import { useMe } from "@/lib/useMe";

export default function DashboardHome() {
  const { user, profile, loading } = useMe();

  if (loading) return <div className="text-fog text-sm">Chargement…</div>;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink mb-1">
        Bonjour {user?.email?.split("@")[0]}
      </h1>
      <p className="text-fog text-sm mb-8">
        Voici l&apos;état de votre profil JobSwap.
      </p>

      {!profile && (
        <div className="card p-6 mb-6 border border-amberL bg-amberL/40">
          <div className="font-semibold text-ink mb-1">
            Profil incomplet
          </div>
          <p className="text-sm text-ink2 mb-3">
            Complétez votre métier, votre zone géographique et votre trajet
            actuel pour recevoir vos premiers matches.
          </p>
          <Link href="/dashboard/profil" className="btn-primary px-4 py-2 inline-block text-sm">
            Compléter mon profil
          </Link>
        </div>
      )}

      {profile && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Pseudonyme public</div>
            <div className="font-mono text-sm text-ink">
              {profile.pseudonym}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Métier</div>
            <div className="text-sm text-ink">
              {profile.rome_label} ({profile.rome_code})
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Résidence → Travail</div>
            <div className="text-sm text-ink">
              {profile.residence_city} → {profile.workplace_city}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Trajet actuel (réel)</div>
            <div className="text-sm text-ink">
              {profile.commute_distance_km} km · {profile.commute_duration_min} min
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3 flex-wrap">
        <Link href="/dashboard/matches" className="btn-ghost px-4 py-2 text-sm">
          Voir mes matches
        </Link>
        <Link href="/dashboard/simulateur" className="btn-ghost px-4 py-2 text-sm">
          Simuler mon impact
        </Link>
      </div>
    </div>
  );
}
