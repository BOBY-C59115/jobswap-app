"use client";
import { useState } from "react";
import Link from "next/link";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ice flex items-center justify-center px-6">
      <div className="card w-full max-w-sm p-8">
        <div className="font-heading text-xl font-extrabold text-ink mb-1">
          Job<span className="text-sea2">Swap</span>
        </div>
        <p className="text-fog text-sm mb-6">Mot de passe oublié</p>

        {sent ? (
          <p className="text-sea text-sm">
            Si un compte existe avec cette adresse, un e-mail de
            réinitialisation vient de lui être envoyé. Vérifiez aussi vos
            spams. Le lien est valable 1 heure.
          </p>
        ) : (
          <form onSubmit={onSubmit}>
            <label className="block text-xs font-medium text-ink2 mb-1">E-mail</label>
            <input
              className="input mb-6"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
            />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Envoi…" : "Envoyer le lien de réinitialisation"}
            </button>
          </form>
        )}

        <p className="text-xs text-fog mt-4 text-center">
          <Link href="/connexion" className="text-sea font-medium">Retour à la connexion</Link>
        </p>
      </div>
    </main>
  );
}
