import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getProfileByUserId, getSeedPool, getConsent } from "@/db/queries";
import { rankMatches, MatchCandidate, UserMobility } from "@/lib/matching";
import { FuelType } from "@/lib/bareme";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const consent = await getConsent(userId);
  if (consent && !consent.phase2) {
    return NextResponse.json({
      matches: [],
      disabled: true,
      reason:
        "Le matching est désactivé : le consentement de la phase 2 a été retiré dans vos préférences de confidentialité.",
    });
  }

  const profile = await getProfileByUserId(userId);
  if (!profile) {
    return NextResponse.json(
      { error: "Complétez votre profil avant de consulter vos matches." },
      { status: 400 }
    );
  }

  const seedPoolRaw = await getSeedPool();
  const seedPool = seedPoolRaw.map(
    (p): MatchCandidate => ({
      id: p.id,
      pseudonym: p.pseudonym,
      romeCode: p.rome_code,
      romeLabel: p.rome_label,
      secteurNaf: p.secteur_naf,
      classification: p.classification,
      contractType: p.contract_type,
      salaireBrutAnnuel: p.salaire_brut_annuel,
      mutuelleTauxEmployeur: p.mutuelle_taux_employeur,
      rttJours: p.rtt_jours,
      teleworkDaysPerWeek: p.telework_days_per_week,
      subjManagement: p.subj_management,
      subjValeurs: p.subj_valeurs,
      subjAmbiance: p.subj_ambiance,
      subjEvolution: p.subj_evolution,
      subjStress: p.subj_stress,
      workplaceCity: p.workplace_city,
      workplaceLat: p.workplace_lat,
      workplaceLng: p.workplace_lng,
    })
  );

  const mobility: UserMobility = {
    residenceLat: profile.residence_lat,
    residenceLng: profile.residence_lng,
    currentDistanceKm: profile.commute_distance_km,
    currentDurationMin: profile.commute_duration_min,
    commuteDaysPerWeek: profile.commute_days_per_week,
    vehicleType: profile.current_vehicle_type,
    fuelType: profile.current_fuel_type as FuelType,
    fiscalCv: profile.current_fiscal_cv,
    consumptionPer100km: profile.current_consumption,
    searchRadiusKm: profile.search_radius_km || 0,
    envisagedMode: profile.envisaged_mode as UserMobility["envisagedMode"],
    envisagedFuelType: (profile.envisaged_fuel_type || undefined) as FuelType | undefined,
    envisagedFiscalCv: profile.envisaged_fiscal_cv || undefined,
    envisagedConsumption: profile.envisaged_consumption || undefined,
  };

  const { results, excludedByRadius } = await rankMatches(
    profile.rome_code,
    profile.classification,
    profile.salaire_brut_annuel,
    mobility,
    seedPool,
    "self",
    15
  );

  return NextResponse.json({
    matches: results,
    disabled: false,
    searchRadiusKm: profile.search_radius_km || 0,
    excludedByRadius,
  });
}
