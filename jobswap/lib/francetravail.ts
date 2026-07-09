/**
 * Client pour l'API Offres d'emploi de France Travail (francetravail.io).
 *
 * Nécessite un compte gratuit sur francetravail.io et la création d'une
 * application associée à l'API "Offres d'emploi", qui fournit un
 * identifiant client et une clé secrète (voir .env.example).
 *
 * Licence de réutilisation : voir la licence de réutilisation de la base
 * de données des offres d'emploi de France Travail (mention de la source
 * obligatoire, ne pas laisser croire à un partenariat officiel).
 *
 * Sans clé configurée, les fonctions renvoient null : l'appelant doit
 * masquer la statistique plutôt que d'afficher un chiffre inventé.
 */

const TOKEN_URL =
  "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire";
const API_BASE = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.FT_CLIENT_ID;
  const clientSecret = process.env.FT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.value;
  }

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "api_offresdemploiv2 o2dsoffre",
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.access_token) return null;

    cachedToken = {
      value: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 1200) * 1000,
    };
    return cachedToken.value;
  } catch {
    return null;
  }
}

export type OffreResume = {
  intitule: string;
  entreprise: string;
  ville: string;
  typeContrat: string;
};

export type OffresStats = {
  total: number;
  echantillon: OffreResume[];
  romeCode: string;
  departement: string;
  source: "france-travail";
};

// Cache mémoire simple (10 minutes) pour éviter de solliciter l'API à
// chaque affichage — bonne pratique vis-à-vis d'un service public partagé.
const cache = new Map<string, { data: OffresStats; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function searchOffres(
  romeCode: string,
  departement: string
): Promise<OffresStats | null> {
  const cacheKey = `${romeCode}:${departement}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const token = await getAccessToken();
  if (!token) return null;

  try {
    const url = new URL(API_BASE);
    url.searchParams.set("codeROME", romeCode);
    url.searchParams.set("departement", departement);
    url.searchParams.set("range", "0-4"); // 5 offres d'exemple, on ne veut pas tout rapatrier

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });

    // 204 = aucune offre trouvée pour ces critères
    if (res.status === 204) {
      const empty: OffresStats = { total: 0, echantillon: [], romeCode, departement, source: "france-travail" };
      cache.set(cacheKey, { data: empty, expiresAt: Date.now() + CACHE_TTL_MS });
      return empty;
    }
    if (!res.ok) return null;

    const contentRange = res.headers.get("Content-Range"); // format: "offres 0-4/1234"
    const total = contentRange ? parseInt(contentRange.split("/")[1], 10) : 0;

    const data = await res.json();
    const echantillon: OffreResume[] = (data?.resultats || [])
      .slice(0, 5)
      .map((o: any) => ({
        intitule: o.intitule || "",
        entreprise: o.entreprise?.nom || "Entreprise non communiquée",
        ville: o.lieuTravail?.libelle || "",
        typeContrat: o.typeContrat || "",
      }));

    const result: OffresStats = {
      total: Number.isFinite(total) ? total : echantillon.length,
      echantillon,
      romeCode,
      departement,
      source: "france-travail",
    };
    cache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  } catch {
    return null;
  }
}
