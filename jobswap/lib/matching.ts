import { haversineKm } from "./geo";
import { romeFamily } from "./rome";

export type MatchCandidate = {
  id: string;
  pseudonym: string;
  romeCode: string;
  romeLabel: string;
  classification: string;
  contractType: string;
  city: string;
  lat: number;
  lng: number;
  commuteKm: number;
};

export type MatchResult = MatchCandidate & {
  score: number;
  distanceEconomyKm: number; // km/jour économisés en moyenne si l'échange se fait
  breakdown: {
    metier: number;
    classification: number;
    contrat: number;
    proximite: number;
  };
};

const CLASSIFICATION_ORDER = [
  "Employé",
  "Agent de maîtrise",
  "Technicien",
  "Cadre N1",
  "Cadre N2",
  "Cadre N3",
];

function classificationDistance(a: string, b: string): number {
  const ia = CLASSIFICATION_ORDER.indexOf(a);
  const ib = CLASSIFICATION_ORDER.indexOf(b);
  if (ia === -1 || ib === -1) return 2;
  return Math.abs(ia - ib);
}

/**
 * Calcule un score de compatibilité 0-100 entre le profil de l'utilisateur
 * et un candidat, sur 4 critères pondérés :
 *  - métier (ROME) : 40 pts
 *  - classification : 20 pts
 *  - type de contrat : 10 pts
 *  - proximité géographique inversée (le candidat doit être situé
 *    près du DOMICILE probable de l'utilisateur, donc typiquement dans
 *    la ville où l'utilisateur travaille et vice-versa) : 30 pts
 */
export function scoreMatch(
  user: MatchCandidate,
  candidate: MatchCandidate
): MatchResult {
  let metier = 0;
  if (user.romeCode === candidate.romeCode) metier = 40;
  else if (romeFamily(user.romeCode) === romeFamily(candidate.romeCode))
    metier = 26;
  else metier = 6;

  const classDist = classificationDistance(
    user.classification,
    candidate.classification
  );
  const classification = Math.max(0, 20 - classDist * 7);

  const contrat = user.contractType === candidate.contractType ? 10 : 4;

  // Distance entre les deux lieux de travail : plus les entreprises sont
  // proches du domicile "opposé" de l'autre, plus l'échange réduit les
  // trajets combinés. On modélise via la distance entre les deux villes.
  const distKm = haversineKm(user.lat, user.lng, candidate.lat, candidate.lng);
  const proximite = Math.max(0, 30 - distKm / 8);

  const score = Math.round(metier + classification + contrat + proximite);

  // Estimation du gain journalier si les deux salariés échangent de poste :
  // hypothèse que chacun retrouverait un trajet proche de son propre
  // "commuteKm" divisé par un facteur d'éloignement actuel.
  const distanceEconomyKm = Math.max(
    0,
    Math.round(((user.commuteKm + candidate.commuteKm) / 2) * 0.75)
  );

  return {
    ...candidate,
    score: Math.min(100, score),
    distanceEconomyKm,
    breakdown: { metier, classification, contrat, proximite: Math.round(proximite) },
  };
}

export function rankMatches(
  user: MatchCandidate,
  pool: MatchCandidate[]
): MatchResult[] {
  return pool
    .filter((c) => c.id !== user.id)
    .map((c) => scoreMatch(user, c))
    .sort((a, b) => b.score - a.score);
}
