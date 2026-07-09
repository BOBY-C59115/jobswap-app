import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-ink text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full py-20">
        <div className="font-heading text-3xl font-extrabold tracking-tight mb-2">
          Job<span className="text-sea2">Swap</span>
        </div>
        <p className="text-mist font-mono text-xs mb-10">
          Bourse d&apos;échanges de postes entre salariés
        </p>

        <h1 className="font-heading text-4xl font-bold leading-tight mb-5">
          Chaque matin, des salariés de postes identiques
          <br />
          se croisent sans le savoir.
        </h1>
        <p className="text-mist text-base leading-relaxed mb-10">
          JobSwap rapproche les salariés de leur lieu de travail en
          identifiant des échanges de poste réciproques, à métier et
          classification comparables, entre entreprises différentes.
        </p>

        <div className="flex gap-3">
          <Link
            href="/inscription"
            className="btn-primary px-6 py-3 inline-block"
          >
            Créer un profil anonyme
          </Link>
          <Link
            href="/connexion"
            className="btn-ghost px-6 py-3 inline-block"
          >
            J&apos;ai déjà un compte
          </Link>
        </div>
        <div className="mt-4">
          <Link href="/pourquoi" className="text-mist text-xs underline">
            Voir les données réelles sur le trajet et le marché de l&apos;emploi
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-4 text-center">
          <div className="card p-4">
            <div className="font-heading text-2xl font-bold text-ink">1</div>
            <div className="text-xs text-fog mt-1">
              Inscription anonyme, profil chiffré
            </div>
          </div>
          <div className="card p-4">
            <div className="font-heading text-2xl font-bold text-ink">2</div>
            <div className="text-xs text-fog mt-1">
              Matching multi-critères
            </div>
          </div>
          <div className="card p-4">
            <div className="font-heading text-2xl font-bold text-ink">3</div>
            <div className="text-xs text-fog mt-1">
              Mise en relation RH encadrée
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
