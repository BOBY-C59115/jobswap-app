import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import {
  getProfileByUserId,
  getSeedPool,
  getAllRealProfilesExcept,
  getConsent,
} from "@/db/queries";
import { rankMatches, MatchCandidate } from "@/lib/matching";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const consent = getConsent(userId);
  if (consent && !consent.phase2) {
    return NextResponse.json({
      matches: [],
      disabled: true,
      reason:
        "Le matching est désactivé : le consentement de la phase 2 a été retiré dans vos préférences de confidentialité.",
    });
  }

  const profile = getProfileByUserId(userId);
  if (!profile) {
    return NextResponse.json(
      { error: "Complétez votre profil avant de consulter vos matches." },
      { status: 400 }
    );
  }

  const userCandidate: MatchCandidate = {
    id: userId,
    pseudonym: profile.pseudonym,
    romeCode: profile.rome_code,
    romeLabel: profile.rome_label,
    classification: profile.classification,
    contractType: profile.contract_type,
    city: profile.city,
    lat: profile.lat,
    lng: profile.lng,
    commuteKm: profile.commute_km,
  };

  const realProfiles = getAllRealProfilesExcept(userId).map(
    (p): MatchCandidate => ({
      id: p.id,
      pseudonym: p.pseudonym,
      romeCode: p.rome_code,
      romeLabel: p.rome_label,
      classification: p.classification,
      contractType: p.contract_type,
      city: p.city,
      lat: p.lat,
      lng: p.lng,
      commuteKm: p.commute_km,
    })
  );

  const seedPool = getSeedPool().map(
    (p): MatchCandidate => ({
      id: p.id,
      pseudonym: p.pseudonym,
      romeCode: p.rome_code,
      romeLabel: p.rome_label,
      classification: p.classification,
      contractType: p.contract_type,
      city: p.city,
      lat: p.lat,
      lng: p.lng,
      commuteKm: p.commute_km,
    })
  );

  const pool = [...realProfiles, ...seedPool];
  const results = rankMatches(userCandidate, pool).slice(0, 20);

  return NextResponse.json({ matches: results, disabled: false });
}
