"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ReinitialiserForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Erreur."); return; }
      setDone(true);
      setTimeout(() => router.push("/connexion"), 2000);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="card w-full max-w-sm p-8">
        <p className="text-coral text-sm">
          Lien invalide. Refaites une demande depuis la page{" "}
          <Link href="/mot-de-passe-oublie" className="underline">mot de passe oublié</Link>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card w-full max-w-sm p-8">
      <div className="font-heading text-xl font-extrabold text-ink mb-1">
        Job<span className="text-sea2">Swap</span>
      </div>
      <p className="text-fog text-sm mb-6">Choisissez un nouveau mot de passe</p>

      {error && <div className="bg-coralL text-coral text-sm rounded-sm px-3 py-2 mb-4">{error}</div>}
      {done ? (
        <p className="text-sea text-sm">Mot de passe modifié. Redirection vers la connexion…</p>
      ) : (
        <>
          <label className="block text-xs font-medium text-ink2 mb-1">Nouveau mot de passe (8 caractères min.)</label>
          <input
            className="input mb-6"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Enregistrement…" : "Réinitialiser mon mot de passe"}
          </button>
        </>
      )}
    </form>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <main className="min-h-screen bg-ice flex items-center justify-center px-6">
      <Suspense fallback={null}>
        <ReinitialiserForm />
      </Suspense>
    </main>
  );
}
