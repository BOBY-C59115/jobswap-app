import { haversineKm } from "./geo";

/**
 * Distance et durée de trajet routier réels entre deux points.
 *
 * Utilise l'API gratuite OpenRouteService si la variable d'environnement
 * ORS_API_KEY est configurée (clé gratuite en 2 minutes sur
 * openrouteservice.org). Sans clé, on utilise une estimation par
 * approximation : distance à vol d'oiseau × 1,3 (facteur de correction
 * routier moyen constaté en France), ce qui reste nettement plus réaliste
 * qu'une distance à vol d'oiseau brute, mais doit être remplacé par un vrai
 * calcul d'itinéraire dès que possible pour la mise en production.
 */
export type RouteResult = {
  distanceKm: number;
  durationMin: number;
  source: "openrouteservice" | "estimation";
};

const ROAD_FACTOR_FALLBACK = 1.3; // correction moyenne vol d'oiseau -> route en France
const AVG_SPEED_KMH_FALLBACK = 52; // vitesse moyenne mixte ville/route/autoroute

export async function getRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<RouteResult> {
  const apiKey = process.env.ORS_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car",
        {
          method: "POST",
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinates: [
              [fromLng, fromLat],
              [toLng, toLat],
            ],
          }),
          // Évite de bloquer indéfiniment si le service est indisponible
          signal: AbortSignal.timeout(6000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const summary = data?.routes?.[0]?.summary;
        if (summary) {
          return {
            distanceKm: Math.round((summary.distance / 1000) * 10) / 10,
            durationMin: Math.round(summary.duration / 60),
            source: "openrouteservice",
          };
        }
      }
    } catch {
      // silencieux : on retombe sur l'estimation ci-dessous
    }
  }

  const straightLine = haversineKm(fromLat, fromLng, toLat, toLng);
  const distanceKm = Math.round(straightLine * ROAD_FACTOR_FALLBACK * 10) / 10;
  const durationMin = Math.round((distanceKm / AVG_SPEED_KMH_FALLBACK) * 60);

  return { distanceKm, durationMin, source: "estimation" };
}
