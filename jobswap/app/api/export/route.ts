import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getUserById, getProfileByUserId, getConsent } from "@/db/queries";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const user = getUserById(userId);
  const profile = getProfileByUserId(userId);
  const consent = getConsent(userId);

  const payload = {
    compte: { email: user?.email, cree_le: user?.created_at },
    profil: profile
      ? {
          pseudonyme: profile.pseudonym,
          metier_rome: `${profile.rome_code} — ${profile.rome_label}`,
          classification: profile.classification,
          type_contrat: profile.contract_type,
          zone: `${profile.city} (${profile.postal_code})`,
          trajet_quotidien_km: profile.commute_km,
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
