import { haversineKm } from "./geo";
import { romeFamily } from "./rome";
import { getRoute } from "./routing";
import { annualTransportCost, FuelType } from "./bareme";
import { emissionsForMode } from "./emissions";

export type MatchCandidate = {
  id: string;
  pseudonym: string;
  romeCode: string;
  romeLabel: string;
  secteurNaf: string;
  classification: string;
  contractType: string;
  salaireBrutAnnuel: number;
  mutuelleTauxEmployeur: number;
  rttJours: number;
  teleworkDaysPerWeek: number;
  subjManagement: number;
  subjValeurs: number;
  subjAmbiance: number;
  subjEvolution: number;
  subjStress: number;
  workplaceCity: string;
  workplaceLat: number;
  workplaceLng: number;
};

export type UserMobility = {
  residenceLat: number;
  residenceLng: number;
  currentDistanceKm: number;
  currentDurationMin: number;
  commuteDaysPerWeek: number;
  vehicleType: string;
  fuelType: FuelType;
  fiscalCv: number;
  consumptionPer100km: number;
  searchRadiusKm: number; // 0 = pas de limite
  envisagedMode:
    | "vehicule_identique"
    | "vehicule_electrique"
    | "vae"
    | "marche"
    | "transport_commun"
    | "covoiturage";
  envisagedFuelType?: FuelType;
  envisagedFiscalCv?: number;
  envisagedConsumption?: number;
};

export type MatchGains = {
  newDistanceKm: number;
  newDurationMin: number;
  distanceSavedKmPerDay: number;
  timeSavedMinPerDay: number;
  timeSavedHoursPerYear: number;
  economicGainPerYear: number;
  co2SavedKgPerYear: number;
  routeSource: "openrouteservice" | "estimation";
};

export type MatchResult = MatchCandidate & {
  score: number;
  breakdown: {
    metier: number;
    classification: number;
    contrat: number;
    remuneration: number;
    attractivite: number;
    distance: number;
    temps: number;
  };
  gains: MatchGains;
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

function cheapPreScore(
  userRome: string,
  userClassification: string,
  userSalaire: number,
  residenceLat: number,
  residenceLng: number,
  candidate: MatchCandidate
): { score: number; haversineDistanceKm: number } {
  let metier = 0;
  if (userRome === candidate.romeCode) metier = 30;
  else if (romeFamily(userRome) === romeFamily(candidate.romeCode)) metier = 18;
  else metier = 4;

  const classDist = classificationDistance(userClassification, candidate.classification);
  const classification = Math.max(0, 15 - classDist * 5);

  const salaireEcart = userSalaire > 0
    ? Math.abs(userSalaire - candidate.salaireBrutAnnuel) / userSalaire
    : 0;
  const remuneration = Math.max(0, 10 - salaireEcart * 30);

  const haversineDistanceKm = haversineKm(residenceLat, residenceLng, candidate.workplaceLat, candidate.workplaceLng);
  const proximite = Math.max(0, 20 - haversineDistanceKm / 6);

  return { score: metier + classification + remuneration + proximite, haversineDistanceKm };
}

/**
 * Calcule les gains réels (distance routière, temps, coût, CO2) pour un
 * candidat donné, du point de vue de l'utilisateur (son domicile ne change
 * pas, seul son lieu de travail changerait).
 */
export async function computeGains(
  mobility: UserMobility,
  candidate: MatchCandidate
): Promise<MatchGains> {
  const route = await getRoute(
    mobility.residenceLat,
    mobility.residenceLng,
    candidate.workplaceLat,
    candidate.workplaceLng
  );

  const daysPerYear = mobility.commuteDaysPerWeek * 47; // ~47 semaines travaillées/an
  const currentAnnualKm = mobility.currentDistanceKm * 2 * daysPerYear;
  const newAnnualKm = route.distanceKm * 2 * daysPerYear;

  const currentCost = annualTransportCost(
    "vehicule_identique",
    mobility.fiscalCv,
    mobility.fuelType,
    currentAnnualKm
  );
  const newCost = annualTransportCost(
    mobility.envisagedMode,
    mobility.envisagedFiscalCv || mobility.fiscalCv,
    mobility.envisagedFuelType || mobility.fuelType,
    newAnnualKm
  );

  const currentEmissions = emissionsForMode(
    "vehicule_identique",
    mobility.fuelType,
    mobility.consumptionPer100km,
    currentAnnualKm
  );
  const newEmissions = emissionsForMode(
    mobility.envisagedMode,
    mobility.envisagedFuelType || mobility.fuelType,
    mobility.envisagedConsumption || mobility.consumptionPer100km,
    newAnnualKm
  );

  const distanceSavedKmPerDay = (mobility.currentDistanceKm - route.distanceKm) * 2;
  const timeSavedMinPerDay = (mobility.currentDurationMin - route.durationMin) * 2;

  return {
    newDistanceKm: route.distanceKm,
    newDurationMin: route.durationMin,
    distanceSavedKmPerDay: Math.round(distanceSavedKmPerDay * 10) / 10,
    timeSavedMinPerDay: Math.round(timeSavedMinPerDay),
    timeSavedHoursPerYear: Math.round((timeSavedMinPerDay * daysPerYear) / 60),
    economicGainPerYear: Math.round(currentCost - newCost),
    co2SavedKgPerYear: Math.round(currentEmissions - newEmissions),
    routeSource: route.source,
  };
}

export async function rankMatches(
  userRome: string,
  userClassification: string,
  userSalaire: number,
  mobility: UserMobility,
  pool: MatchCandidate[],
  excludeId: string,
  limit = 15
): Promise<{ results: MatchResult[]; excludedByRadius: number }> {
  const radius = mobility.searchRadiusKm || 0;

  // Filtre de repli (bon marché, à vol d'oiseau) : on élimine large, la marge
  // de sécurité de +30% couvre l'écart entre vol d'oiseau et route réelle.
  const withPreScore = pool
    .filter((c) => c.id !== excludeId)
    .map((c) => ({
      candidate: c,
      ...cheapPreScore(userRome, userClassification, userSalaire, mobility.residenceLat, mobility.residenceLng, c),
    }));

  const withinRoughRadius = radius > 0
    ? withPreScore.filter((c) => c.haversineDistanceKm <= radius * 1.3)
    : withPreScore;

  const preScored = withinRoughRadius
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(limit * 2, 30));

  const results: MatchResult[] = [];
  let excludedByRadius = 0;

  for (const { candidate } of preScored) {
    const gains = await computeGains(mobility, candidate);

    // Filtre définitif sur la distance routière réelle (le vrai rayon demandé)
    if (radius > 0 && gains.newDistanceKm > radius) {
      excludedByRadius++;
      continue;
    }

    let metier = 0;
    if (userRome === candidate.romeCode) metier = 30;
    else if (romeFamily(userRome) === romeFamily(candidate.romeCode)) metier = 18;
    else metier = 4;

    const classDist = classificationDistance(userClassification, candidate.classification);
    const classification = Math.max(0, 15 - classDist * 5);
    const contrat = 5;

    const salaireEcart = userSalaire > 0
      ? Math.abs(userSalaire - candidate.salaireBrutAnnuel) / userSalaire
      : 0;
    const remuneration = Math.max(0, 10 - salaireEcart * 30);

    const attractiviteRaw =
      (candidate.subjManagement +
        candidate.subjValeurs +
        candidate.subjAmbiance +
        candidate.subjEvolution +
        (6 - candidate.subjStress)) /
      5;
    const attractivite = Math.round((attractiviteRaw / 5) * 15);

    // Gain de distance (12 pts) et gain de TEMPS (13 pts, légèrement
    // prépondérant) : le temps récupéré sur le trajet domicile-travail est
    // le moteur principal du bien-être visé par JobSwap, pas seulement
    // l'économie kilométrique.
    const distance = Math.round(Math.max(0, Math.min(12, (gains.distanceSavedKmPerDay / 40) * 12)));
    const temps = Math.round(Math.max(0, Math.min(13, (gains.timeSavedMinPerDay / 45) * 13)));

    const score = Math.min(
      100,
      Math.round(metier + classification + contrat + remuneration + attractivite + distance + temps)
    );

    results.push({
      ...candidate,
      score,
      breakdown: { metier, classification, contrat, remuneration, attractivite, distance, temps },
      gains,
    });
  }

  return {
    results: results.sort((a, b) => b.score - a.score).slice(0, limit),
    excludedByRadius,
  };
}
