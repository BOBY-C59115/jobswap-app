import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getUserById, getProfileByUserId, getConsent } from "@/db/queries";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const user = await getUserById(userId);
  const profile = await getProfileByUserId(userId);
  const consent = await getConsent(userId);

  const payload = {
    compte: { email: user?.email, cree_le: user?.created_at },
    profil: profile
      ? {
          pseudonyme: profile.pseudonym,
          metier_rome: `${profile.rome_code} — ${profile.rome_label}`,
          secteur: profile.secteur_naf,
          classification: profile.classification,
          type_contrat: profile.contract_type,
          salaire_brut_annuel: profile.salaire_brut_annuel,
          residence: `${profile.residence_city} (${profile.residence_postal_code})`,
          lieu_travail: `${profile.workplace_city} (${profile.workplace_postal_code})`,
          trajet_quotidien_km: profile.commute_distance_km,
          trajet_quotidien_min: profile.commute_duration_min,
          vehicule_actuel: `${profile.current_vehicle_type} / ${profile.current_fuel_type} / ${profile.current_fiscal_cv} CV`,
        }
      : null,
    consentements: consent
      ? {
          inscription_anonyme: true,
          matching_ia: !!consent.phase2,
          mise_en_relation_rh: !!consent.phase3,
          partage_donnees_statistiques: !!consent.phase4,
        }
      : null,
    export_genere_le: new Date().toISOString(),
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=jobswap-mes-donnees.json",
    },
  });
}
