/**
 * Client pour l'API Recherche d'entreprises (api.gouv.fr / DINUM), qui
 * expose les données du répertoire Sirene de l'INSEE.
 *
 * Cette API est publique, gratuite, et ne nécessite AUCUNE clé ni compte —
 * ce qui la rend immédiatement disponible, contrairement à France Travail.
 * Licence : Licence Ouverte / Etalab (réutilisation libre avec mention de
 * la source).
 *
 * Documentation : https://recherche-entreprises.api.gouv.fr/docs/
 */

export type EntrepriseStats = {
  total: number;
  section: string;
  codePostal: string;
  source: "recherche-entreprises";
};

const BASE_URL = "https://recherche-entreprises.api.gouv.fr/search";

/**
 * Compte le nombre d'établissements actifs enregistrés au répertoire Sirene
 * pour une section d'activité (NAF) et un code postal donnés.
 *
 * Renvoie null en cas d'échec réseau — l'appelant doit alors masquer cette
 * statistique plutôt que d'afficher un chiffre incorrect.
 */
export async function countEtablissements(
  sectionNaf: string,
  codePostal: string
): Promise<EntrepriseStats | null> {
  try {
    const url = new URL(BASE_URL);
    url.searchParams.set("code_postal", codePostal);
    url.searchParams.set("section_activite_principale", sectionNaf);
    url.searchParams.set("etat_administratif", "A"); // établissements actifs uniquement
    url.searchParams.set("per_page", "1"); // on ne veut que le total, pas la liste

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(6000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const total = typeof data?.total_results === "number" ? data.total_results : null;
    if (total === null) return null;

    return { total, section: sectionNaf, codePostal, source: "recherche-entreprises" };
  } catch {
    return null;
  }
}
