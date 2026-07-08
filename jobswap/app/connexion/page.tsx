"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ConnexionForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        return;
      }
      router.push(params.get("from") || "/dashboard");
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
        <p className="text-fog text-sm mb-6">Connectez-vous à votre espace.</p>

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
          Mot de passe
        </label>
        <input
          className="input mb-6"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>

        <p className="text-xs text-fog mt-4 text-center">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-sea font-medium">
            Créer un profil
          </Link>
        </p>
      </form>
    </main>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <ConnexionForm />
    </Suspense>
  );
}
