import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getProfileByUserId } from "@/db/queries";
import { searchOffres } from "@/lib/francetravail";
import { countEtablissements } from "@/lib/entreprises";
import { ROME_CODES } from "@/lib/rome";
import { SECTEUR_NAF_SECTION, SECTEURS_NAF } from "@/lib/refdata";
import { CITIES } from "@/lib/geo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  let romeCode = searchParams.get("romeCode") || undefined;
  let secteurNaf = searchParams.get("secteurNaf") || undefined;
  let city = searchParams.get("city") || undefined;

  // Si aucun paramètre n'est fourni et que l'utilisateur est connecté avec
  // un profil complet, on utilise son propre profil (usage tableau de bord).
  if (!romeCode || !city) {
    const userId = await getSessionUserId();
    if (userId) {
      const profile = getProfileByUserId(userId);
      if (profile) {
        romeCode = romeCode || profile.rome_code;
        secteurNaf = secteurNaf || profile.secteur_naf;
        city = city || profile.workplace_city;
      }
    }
  }

  if (!romeCode || !city) {
    return NextResponse.json(
      { error: "Métier et ville requis (romeCode, city), ou profil complet requis." },
      { status: 400 }
    );
  }

  const rome = ROME_CODES.find((r) => r.code === romeCode);
  const cityData = CITIES[city as keyof typeof CITIES];
  if (!rome || !cityData) {
    return NextResponse.json({ error: "Métier ou ville invalide." }, { status: 400 });
  }

  const departement = cityData.postalCode.slice(0, 2);
  const section = secteurNaf ? SECTEUR_NAF_SECTION[secteurNaf] : undefined;

  const [offres, entreprises] = await Promise.all([
    searchOffres(rome.code, departement),
    section ? countEtablissements(section, cityData.postalCode) : Promise.resolve(null),
  ]);

  return NextResponse.json({
    romeCode: rome.code,
    romeLabel: rome.label,
    city,
    departement,
    secteurNaf: secteurNaf || null,
    offresEmploi: offres, // null si clé France Travail non configurée ou erreur
    entreprises, // null si secteur non fourni ou erreur
  });
}
