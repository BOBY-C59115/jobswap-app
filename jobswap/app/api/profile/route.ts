import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { upsertProfile, ProfileInput } from "@/db/queries";
import { CITIES } from "@/lib/geo";
import { ROME_CODES } from "@/lib/rome";
import { getRoute } from "@/lib/routing";
import {
  CLASSIFICATIONS,
  SECTEURS_NAF,
  VEHICLE_TYPES,
  FUEL_TYPES,
  ENVISAGED_MODES,
} from "@/lib/refdata";

function isIn(list: { value: string }[] | string[], v: string) {
  return list.some((x: any) => (typeof x === "string" ? x === v : x.value === v));
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });

  const rome = ROME_CODES.find((r) => r.code === body.romeCode);
  if (!rome) return NextResponse.json({ error: "Métier invalide." }, { status: 400 });
  if (!CLASSIFICATIONS.includes(body.classification))
    return NextResponse.json({ error: "Classification invalide." }, { status: 400 });
  if (!["CDI", "CDD"].includes(body.contractType))
    return NextResponse.json({ error: "Type de contrat invalide." }, { status: 400 });
  if (!SECTEURS_NAF.includes(body.secteurNaf))
    return NextResponse.json({ error: "Secteur d'activité invalide." }, { status: 400 });

  const residenceCity = CITIES[body.residenceCity as keyof typeof CITIES];
  const workplaceCity = CITIES[body.workplaceCity as keyof typeof CITIES];
  if (!residenceCity) return NextResponse.json({ error: "Ville de résidence invalide." }, { status: 400 });
  if (!workplaceCity) return NextResponse.json({ error: "Ville de travail invalide." }, { status: 400 });

  if (!isIn(VEHICLE_TYPES, body.currentVehicleType))
    return NextResponse.json({ error: "Type de véhicule actuel invalide." }, { status: 400 });
  if (!isIn(FUEL_TYPES, body.currentFuelType))
    return NextResponse.json({ error: "Motorisation actuelle invalide." }, { status: 400 });
  if (!isIn(ENVISAGED_MODES, body.envisagedMode))
    return NextResponse.json({ error: "Mode envisagé invalide." }, { status: 400 });

  const fiscalCv = Number(body.currentFiscalCv);
  if (!Number.isFinite(fiscalCv) || fiscalCv < 1 || fiscalCv > 20)
    return NextResponse.json({ error: "Puissance fiscale invalide." }, { status: 400 });

  // Distance/temps réels : calcul via l'API de routage (ou estimation de repli)
  const route = await getRoute(
    residenceCity.lat,
    residenceCity.lng,
    workplaceCity.lat,
    workplaceCity.lng
  );

  const pseudonym = `Salarié ${rome.code}-${workplaceCity.postalCode.slice(0, 2)}`;

  const profileInput: ProfileInput = {
    pseudonym,
    rome_code: rome.code,
    rome_label: rome.label,
    secteur_naf: body.secteurNaf,
    convention_collective: body.conventionCollective || "",
    classification: body.classification,
    contract_type: body.contractType,
    work_time_pct: Number(body.workTimePct) || 100,

    salaire_brut_annuel: Number(body.salaireBrutAnnuel) || 0,
    part_variable_pct: Number(body.partVariablePct) || 0,
    prime_anciennete: body.primeAnciennete ? 1 : 0,
    interessement: body.interessement ? 1 : 0,
    participation: body.participation ? 1 : 0,

    mutuelle_taux_employeur: Number(body.mutuelleTauxEmployeur) || 0,
    tickets_resto_montant: Number(body.ticketsRestoMontant) || 0,
    rtt_jours: Number(body.rttJours) || 0,
    cse: body.cse ? 1 : 0,
    vehicule_fonction: body.vehiculeFonction ? 1 : 0,
    telework_days_per_week: Number(body.teleworkDaysPerWeek) || 0,

    horaires: body.horaires || "fixes",
    penibilite: Number(body.penibilite) || 0,
    deplacements_frequence: body.deplacementsFrequence || "aucun",

    diplome_requis: body.diplomeRequis || "",
    experience_annees: Number(body.experienceAnnees) || 0,
    certifications: body.certifications || "",
    permis: body.permis || "",
    langues: body.langues || "",

    subj_management: Number(body.subjManagement) || 3,
    subj_valeurs: Number(body.subjValeurs) || 3,
    subj_ambiance: Number(body.subjAmbiance) || 3,
    subj_evolution: Number(body.subjEvolution) || 3,
    subj_stress: Number(body.subjStress) || 3,

    residence_city: body.residenceCity,
    residence_postal_code: residenceCity.postalCode,
    residence_lat: residenceCity.lat,
    residence_lng: residenceCity.lng,
    workplace_city: body.workplaceCity,
    workplace_postal_code: workplaceCity.postalCode,
    workplace_lat: workplaceCity.lat,
    workplace_lng: workplaceCity.lng,

    commute_distance_km: route.distanceKm,
    commute_duration_min: route.durationMin,
    commute_days_per_week: Number(body.commuteDaysPerWeek) || 5,

    current_vehicle_type: body.currentVehicleType,
    current_fuel_type: body.currentFuelType,
    current_fiscal_cv: fiscalCv,
    current_consumption: Number(body.currentConsumption) || 6,
    current_vehicle_age: Number(body.currentVehicleAge) || 0,

    carpool_passengers: Number(body.carpoolPassengers) || 0,
    public_transport_pass: body.publicTransportPass ? 1 : 0,

    envisaged_mode: body.envisagedMode,
    envisaged_vehicle_type: body.envisagedVehicleType || "",
    envisaged_fuel_type: body.envisagedFuelType || "",
    envisaged_fiscal_cv: Number(body.envisagedFiscalCv) || 0,
    envisaged_consumption: Number(body.envisagedConsumption) || 0,

    open_to_remote: body.openToRemote ? 1 : 0,
  };

  const profile = upsertProfile(userId, profileInput);
  return NextResponse.json({ ok: true, profile, routeSource: route.source });
}
