"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Consent = {
  phase1: number;
  phase2: number;
  phase3: number;
  phase4: number;
};

export default function ConfidentialitePage() {
  const router = useRouter();
  const [consent, setConsent] = useState<Consent | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/consent")
      .then((r) => r.json())
      .then((d) => setConsent(d.consent));
  }, []);

  async function toggle(phase: "phase2" | "phase3" | "phase4", value: boolean) {
    const res = await fetch("/api/consent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [phase]: value }),
    });
    const data = await res.json();
    if (res.ok) setConsent(data.consent);
  }

  async function exportData() {
    const res = await fetch("/api/export");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobswap-mes-donnees.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    setDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } finally {
      setDeleting(false);
    }
  }

  if (!consent) return <div className="text-fog text-sm">Chargement…</div>;

  return (
    <div className="max-w-lg">
      <h1 className="font-heading text-2xl font-bold text-ink mb-1">
        Confidentialité &amp; RGPD
      </h1>
      <p className="text-fog text-sm mb-8">
        Gérez vos consentements phase par phase. Retirer le consentement
        d&apos;une phase verrouille automatiquement les phases suivantes.
      </p>

      <div className="card p-6 space-y-5 mb-6">
        <label className="flex items-start gap-3">
          <input type="checkbox" checked disabled className="mt-1" />
          <div>
            <div className="text-sm font-medium text-ink">
              Phase 1 — Inscription anonyme
            </div>
            <div className="text-xs text-fog">
              Obligatoire pour utiliser JobSwap. Profil chiffré, aucune
              identité.
            </div>
          </div>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={!!consent.phase2}
            onChange={(e) => toggle("phase2", e.target.checked)}
            className="mt-1"
          />
          <div>
            <div className="text-sm font-medium text-ink">
              Phase 2 — Matching IA multi-critères
            </div>
            <div className="text-xs text-fog">
              Autorise le calcul de vos scores de compatibilité avec
              d&apos;autres profils.
            </div>
          </div>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={!!consent.phase3}
            disabled={!consent.phase2}
            onChange={(e) => toggle("phase3", e.target.checked)}
            className="mt-1"
          />
          <div>
            <div className="text-sm font-medium text-ink">
              Phase 3 — Mise en relation RH
            </div>
            <div className="text-xs text-fog">
              Autorise le partage de votre pseudonyme aux RH des deux
              entreprises en cas de match validé.
            </div>
          </div>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={!!consent.phase4}
            disabled={!consent.phase3}
            onChange={(e) => toggle("phase4", e.target.checked)}
            className="mt-1"
          />
          <div>
            <div className="text-sm font-medium text-ink">
              Phase 4 — Partage statistique anonymisé
            </div>
            <div className="text-xs text-fog">
              Contribue aux statistiques d&apos;impact carbone et RH
              agrégées, sans identification possible.
            </div>
          </div>
        </label>
      </div>

      <div className="card p-6 mb-6">
        <div className="font-medium text-ink text-sm mb-1">
          Exporter mes données
        </div>
        <p className="text-xs text-fog mb-3">
          Téléchargez une copie de toutes vos données au format JSON
          (portabilité, art. 20 RGPD).
        </p>
        <button onClick={exportData} className="btn-ghost px-4 py-2 text-sm">
          Télécharger mes données
        </button>
      </div>

      <div className="card p-6 border border-coralL">
        <div className="font-medium text-coral text-sm mb-1">
          Supprimer mon compte
        </div>
        <p className="text-xs text-fog mb-3">
          Suppression définitive et immédiate de votre profil et de vos
          consentements (droit à l&apos;effacement, art. 17 RGPD). Cette
          action est irréversible.
        </p>
        {!confirmOpen ? (
          <button
            onClick={() => setConfirmOpen(true)}
            className="text-coral text-sm font-medium underline"
          >
            Supprimer mon compte
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={deleteAccount}
              disabled={deleting}
              className="bg-coral text-white rounded-full px-4 py-2 text-sm font-semibold"
            >
              {deleting ? "Suppression…" : "Confirmer la suppression"}
            </button>
            <button
              onClick={() => setConfirmOpen(false)}
              className="btn-ghost px-4 py-2 text-sm"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 card p-5">
        <div className="text-xs font-medium text-ink mb-1">
          Délégué à la Protection des Données
        </div>
        <div className="text-xs text-fog">
          dpo@jobswap.fr — réponse sous 5 jours ouvrés. Vous pouvez également
          saisir la CNIL (cnil.fr) si votre demande reste sans réponse
          satisfaisante.
        </div>
      </div>
    </div>
  );
}
