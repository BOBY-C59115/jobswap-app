/**
 * Barème kilométrique fiscal 2026 (identique au barème 2025, non revalorisé).
 * Source : service-public.gouv.fr (à jour au 8 avril 2026) et urssaf.fr
 * (vérifié le 24/04/2026). Ce barème couvre déjà carburant, entretien,
 * assurance et dépréciation du véhicule — ne pas cumuler avec d'autres coûts.
 *
 * Majoration de +20 % pour les véhicules 100 % électriques (Urssaf/BOSS).
 */

type BaremeBracket = {
  maxCv: number;
  upTo5000: (km: number) => number;
  from5000to20000: (km: number) => number;
  above20000: (km: number) => number;
};

const CAR_BAREME: BaremeBracket[] = [
  {
    maxCv: 3,
    upTo5000: (km) => km * 0.529,
    from5000to20000: (km) => km * 0.316 + 1065,
    above20000: (km) => km * 0.37,
  },
  {
    maxCv: 4,
    upTo5000: (km) => km * 0.606,
    from5000to20000: (km) => km * 0.34 + 1330,
    above20000: (km) => km * 0.407,
  },
  {
    maxCv: 5,
    upTo5000: (km) => km * 0.636,
    from5000to20000: (km) => km * 0.357 + 1395,
    above20000: (km) => km * 0.427,
  },
  {
    maxCv: 6,
    upTo5000: (km) => km * 0.665,
    from5000to20000: (km) => km * 0.374 + 1457,
    above20000: (km) => km * 0.447,
  },
  {
    // 7 CV et plus
    maxCv: Infinity,
    upTo5000: (km) => km * 0.697,
    from5000to20000: (km) => km * 0.394 + 1515,
    above20000: (km) => km * 0.47,
  },
];

// Barème vélo : indemnité forfaitaire si l'employeur choisit ce mode de
// remboursement (source : fiche-paie.fr, mis à jour 07/07/2026)
export const VELO_INDEMNITY_PER_KM = 0.25;

// Forfait mobilités durables — plafonds en vigueur depuis janvier 2025
export const FMD_PLAFOND_SEUL = 600; // €/an, un seul mode doux
export const FMD_PLAFOND_CUMULE = 900; // €/an, cumulé avec abonnement TC

export type FuelType =
  | "sp95"
  | "sp98"
  | "diesel"
  | "e85"
  | "hybride"
  | "electrique"
  | "hydrogene";

/**
 * Calcule le coût annuel d'un trajet en voiture selon le barème kilométrique
 * fiscal officiel, à partir de la puissance fiscale (CV) et du kilométrage
 * professionnel annuel.
 */
export function bareme(
  fiscalCv: number,
  fuelType: FuelType,
  annualKm: number
): number {
  if (fuelType === "hybride" && annualKm === 0) return 0;

  const bracket =
    CAR_BAREME.find((b) => fiscalCv <= b.maxCv) ||
    CAR_BAREME[CAR_BAREME.length - 1];

  let cost: number;
  if (annualKm <= 5000) cost = bracket.upTo5000(annualKm);
  else if (annualKm <= 20000) cost = bracket.from5000to20000(annualKm);
  else cost = bracket.above20000(annualKm);

  if (fuelType === "electrique") cost *= 1.2; // majoration Urssaf/BOSS

  return Math.round(cost);
}

/**
 * Coût annuel selon le "mode" de déplacement retenu (peut être un mode doux
 * sans barème auto).
 */
export function annualTransportCost(
  mode:
    | "vehicule_identique"
    | "vehicule_electrique"
    | "vae"
    | "marche"
    | "transport_commun"
    | "covoiturage",
  fiscalCv: number,
  fuelType: FuelType,
  annualKm: number,
  publicTransportAnnualCost = 800
): number {
  switch (mode) {
    case "marche":
      return 0;
    case "vae":
      return Math.round(annualKm * VELO_INDEMNITY_PER_KM * 0); // coût réel quasi nul pour l'usager, hors amortissement vélo
    case "transport_commun":
      return publicTransportAnnualCost;
    case "vehicule_electrique":
      return bareme(fiscalCv, "electrique", annualKm);
    case "covoiturage":
      return Math.round(bareme(fiscalCv, fuelType, annualKm) * 0.5);
    case "vehicule_identique":
    default:
      return bareme(fiscalCv, fuelType, annualKm);
  }
}
