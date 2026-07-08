export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const CITIES: Record<
  string,
  { lat: number; lng: number; postalCode: string }
> = {
  Lyon: { lat: 45.764, lng: 4.8357, postalCode: "69002" },
  Roanne: { lat: 46.0369, lng: 4.0708, postalCode: "42300" },
  Villeurbanne: { lat: 45.7667, lng: 4.88, postalCode: "69100" },
  "Saint-Étienne": { lat: 45.4397, lng: 4.3872, postalCode: "42000" },
  Lille: { lat: 50.6292, lng: 3.0573, postalCode: "59000" },
  Roubaix: { lat: 50.6942, lng: 3.1746, postalCode: "59100" },
  Tourcoing: { lat: 50.7236, lng: 3.1611, postalCode: "59200" },
  Douai: { lat: 50.371, lng: 3.0794, postalCode: "59500" },
  Valenciennes: { lat: 50.3574, lng: 3.5234, postalCode: "59300" },
  Arras: { lat: 50.2919, lng: 2.7772, postalCode: "62000" },
  Paris: { lat: 48.8566, lng: 2.3522, postalCode: "75001" },
  Nantes: { lat: 47.2184, lng: -1.5536, postalCode: "44000" },
  Rennes: { lat: 48.1173, lng: -1.6778, postalCode: "35000" },
  Bordeaux: { lat: 44.8378, lng: -0.5792, postalCode: "33000" },
  Toulouse: { lat: 43.6047, lng: 1.4442, postalCode: "31000" },
  Marseille: { lat: 43.2965, lng: 5.3698, postalCode: "13001" },
  Grenoble: { lat: 45.1885, lng: 5.7245, postalCode: "38000" },
};
