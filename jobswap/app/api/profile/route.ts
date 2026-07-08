import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { upsertProfile } from "@/db/queries";
import { CITIES } from "@/lib/geo";
import { ROME_CODES } from "@/lib/rome";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId)
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { romeCode, classification, contractType, city, commuteKm, openToRemote } =
    body || {};

  const rome = ROME_CODES.find((r) => r.code === romeCode);
  const cityData = city ? CITIES[city as keyof typeof CITIES] : undefined;

  if (!rome) {
    return NextResponse.json({ error: "Métier invalide." }, { status: 400 });
  }
  if (!cityData) {
    return NextResponse.json({ error: "Ville invalide." }, { status: 400 });
  }
  const validClassifications = [
    "Employé",
    "Agent de maîtrise",
    "Technicien",
    "Cadre N1",
    "Cadre N2",
    "Cadre N3",
  ];
  if (!validClassifications.includes(classification)) {
    return NextResponse.json(
      { error: "Classification invalide." },
      { status: 400 }
    );
  }
  if (!["CDI", "CDD"].includes(contractType)) {
    return NextResponse.json(
      { error: "Type de contrat invalide." },
      { status: 400 }
    );
  }
  const km = Number(commuteKm);
  if (!Number.isFinite(km) || km < 0 || km > 300) {
    return NextResponse.json(
      { error: "Distance de trajet invalide." },
      { status: 400 }
    );
  }

  // Pseudonyme anonymisé : aucune identité, uniquement métier + zone
  const pseudonym = `Salarié ${rome.code}-${cityData.postalCode.slice(0, 2)}`;

  const profile = upsertProfile(userId, {
    pseudonym,
    rome_code: rome.code,
    rome_label: rome.label,
    classification,
    contract_type: contractType,
    city,
    postal_code: cityData.postalCode,
    lat: cityData.lat,
    lng: cityData.lng,
    commute_km: km,
    open_to_remote: openToRemote ? 1 : 0,
  });

  return NextResponse.json({ ok: true, profile });
}
