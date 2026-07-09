/**
 * Facteurs d'émission CO2 — sources ADEME (calculateur d'émissions de
 * trajets, Base Empreinte®, Car Labelling ADEME), vérifiés le 08/07/2026.
 */
import { FuelType } from "./bareme";

// kg de CO2 par litre de carburant consommé
export const FUEL_CO2_PER_LITER: Record<string, number> = {
  sp95: 2.31,
  sp98: 2.31,
  diesel: 2.68,
  e85: 1.65, // bioéthanol majoritaire, facteur réduit
};

// g CO2e/km à l'usage pour l'électrique (mix électrique français, très décarboné)
export const ELECTRIC_USAGE_G_PER_KM = 12;

// g CO2e/km amorti sur la durée de vie pour la fabrication du véhicule
export const MANUFACTURING_G_PER_KM_THERMAL = 40;
export const MANUFACTURING_G_PER_KM_ELECTRIC = 84;

export type VehicleEmissionInput = {
  fuelType: FuelType;
  consumptionPer100km: number; // L/100km ou kWh/100km selon le carburant
  annualKm: number;
};

/**
 * Émissions annuelles en kg CO2e pour un trajet en véhicule motorisé,
 * carburant + fabrication amortie inclus.
 */
export function annualEmissionsKg(input: VehicleEmissionInput): number {
  const { fuelType, consumptionPer100km, annualKm } = input;

  if (fuelType === "electrique") {
    const usage = (annualKm * ELECTRIC_USAGE_G_PER_KM) / 1000;
    const manufacturing = (annualKm * MANUFACTURING_G_PER_KM_ELECTRIC) / 1000;
    return usage + manufacturing;
  }

  if (fuelType === "hydrogene") {
    // Hydrogène : émissions d'usage quasi nulles (électrolyse non comptée ici),
    // fabrication assimilée à un véhicule électrique par prudence
    return (annualKm * MANUFACTURING_G_PER_KM_ELECTRIC) / 1000;
  }

  const litersConsumed = (annualKm / 100) * consumptionPer100km;
  const factor = FUEL_CO2_PER_LITER[fuelType] ?? FUEL_CO2_PER_LITER.sp98;
  const fuelEmissions = litersConsumed * factor;
  const manufacturing = (annualKm * MANUFACTURING_G_PER_KM_THERMAL) / 1000;

  return fuelEmissions + manufacturing;
}

/**
 * Émissions annuelles selon le mode de déplacement retenu (gère aussi les
 * modes doux, à émissions nulles à l'usage).
 */
export function emissionsForMode(
  mode:
    | "vehicule_identique"
    | "vehicule_electrique"
    | "vae"
    | "marche"
    | "transport_commun"
    | "covoiturage",
  fuelType: FuelType,
  consumptionPer100km: number,
  annualKm: number
): number {
  switch (mode) {
    case "marche":
    case "vae":
      return 0;
    case "transport_commun":
      // Moyenne transport en commun ~ 3-5x moins émetteur qu'une voiture seule
      return annualEmissionsKg({ fuelType: "sp98", consumptionPer100km: 6, annualKm }) * 0.2;
    case "vehicule_electrique":
      return annualEmissionsKg({ fuelType: "electrique", consumptionPer100km: 15, annualKm });
    case "covoiturage":
      return (
        annualEmissionsKg({ fuelType, consumptionPer100km, annualKm }) / 2
      );
    case "vehicule_identique":
    default:
      return annualEmissionsKg({ fuelType, consumptionPer100km, annualKm });
  }
}

export function fmtCO2Kg(kg: number): string {
  return kg >= 1000
    ? (kg / 1000).toFixed(2).replace(".", ",") + " t CO2e"
    : Math.round(kg) + " kg CO2e";
}
