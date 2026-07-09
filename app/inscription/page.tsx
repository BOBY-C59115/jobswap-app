"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function InscriptionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }
      router.push("/dashboard/profil?welcome=1");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ice flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="card w-full max-w-sm p-8">
        <div className="font-heading text-xl font-extrabold text-ink mb-1">
          Job<span className="text-sea2">Swap</span>
        </div>
        <p className="text-fog text-sm mb-6">
          Créez votre profil anonyme. Aucune donnée d&apos;identité n&apos;est
          demandée à ce stade.
        </p>

        {error && (
          <div className="bg-coralL text-coral text-sm rounded-sm px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <label className="block text-xs font-medium text-ink2 mb-1">
          E-mail
        </label>
        <input
          className="input mb-4"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.fr"
        />

        <label className="block text-xs font-medium text-ink2 mb-1">
          Mot de passe (8 caractères minimum)
        </label>
        <input
          className="input mb-6"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading ? "Création…" : "Créer mon compte"}
        </button>

        <p className="text-xs text-fog mt-4 text-center">
          Déjà inscrit ?{" "}
          <Link href="/connexion" className="text-sea font-medium">
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  );
}
