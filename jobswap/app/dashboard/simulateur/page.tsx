"use client";
import { useMemo, useState } from "react";

const CONSUMPTION: Record<string, number> = {
  small: 5,
  medium: 7,
  suv: 9,
  utility: 10,
  electric: 0,
  hydrogen: 0,
};
const ELEC_CONSO = 15;
const ELEC_PRICE = 0.2;
const H2_PRICE = 12;

const CO2_PER_KM: Record<string, number> = {
  sp98: 185,
  sp95: 175,
  diesel: 150,
  e85: 50,
  elec: 0,
  hydro: 0,
};

function fmt(n: number) {
  return n >= 1000
    ? (n / 1000).toFixed(1).replace(".", ",") + " K€"
    : Math.round(n) + " €";
}
function fmtCO2(t: number) {
  return t >= 1 ? t.toFixed(2) + " t" : Math.round(t * 1000) + " kg";
}

export default function SimulateurPage() {
  const [dist, setDist] = useState(84);
  const [price, setPrice] = useState(2.18);
  const [days, setDays] = useState(210);
  const [size, setSize] = useState("medium");
  const [motor, setMotor] = useState("sp98");
  const [future, setFuture] = useState("none");

  const isElec = motor === "elec";
  const isH2 = motor === "hydro";

  const result = useMemo(() => {
    const annKm = dist * days;

    let fuelCost;
    if (isElec) fuelCost = (annKm / 100) * ELEC_CONSO * ELEC_PRICE;
    else if (isH2) fuelCost = (annKm / 100) * 1 * H2_PRICE;
    else fuelCost = (annKm / 100) * (CONSUMPTION[size] || 7) * price;

    const extraCost = annKm * 0.08;
    const totalCost = fuelCost + extraCost;

    const avgSpeed = 52;
    const annHours = annKm / avgSpeed;

    const co2gKm = CO2_PER_KM[motor] || 185;
    const co2Ton = (annKm * co2gKm) / 1_000_000;

    const newKm = 8 * 2 * days;
    let newFuelCost;
    if (future === "vae" || future === "marche") newFuelCost = 0;
    else if (future === "tc")
      newFuelCost = (newKm / 100) * 13 * ELEC_PRICE * 5;
    else if (future === "elec")
      newFuelCost = (newKm / 100) * ELEC_CONSO * ELEC_PRICE;
    else {
      const conso = CONSUMPTION[size] || 7;
      const p = isElec ? ELEC_PRICE : price;
      const c2 = isElec ? ELEC_CONSO / 100 : conso / 100;
      newFuelCost = newKm * c2 * p;
    }
    const saving = fuelCost + extraCost - (newFuelCost + newKm * 0.04);
    const newCo2 = (newKm * co2gKm) / 1_000_000;

    let futureLbl = "Hypothèse trajet réduit à 8 km";
    if (future === "vae") futureLbl = "Passage au VAE · 0 carburant";
    if (future === "tc") futureLbl = "Transport en commun";
    if (future === "elec") futureLbl = "Passage électrique";
    if (future === "marche") futureLbl = "Marche à pied · 0 émission";

    return {
      fuelCost,
      totalCost,
      annHours,
      co2Ton,
      newCo2,
      saving,
      futureLbl,
    };
  }, [dist, price, days, size, motor, future, isElec, isH2]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink mb-1">
        Simulateur d&apos;impact
      </h1>
      <p className="text-fog text-sm mb-8">
        Estimez le coût, le temps et les émissions liés à votre trajet actuel,
        et le gain potentiel après un échange de poste.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Distance : {dist} km / jour
            </label>
            <input
              type="range"
              min={1}
              max={150}
              value={dist}
              onChange={(e) => setDist(Number(e.target.value))}
              className="w-full accent-sea2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Jours travaillés : {days} jours / an
            </label>
            <input
              type="range"
              min={100}
              max={260}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-sea2"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Gabarit du véhicule
            </label>
            <select
              className="input"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              <option value="small">Citadine</option>
              <option value="medium">Berline / compacte</option>
              <option value="suv">SUV</option>
              <option value="utility">Utilitaire</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Motorisation
            </label>
            <select
              className="input"
              value={motor}
              onChange={(e) => setMotor(e.target.value)}
            >
              <option value="sp98">Essence SP98</option>
              <option value="sp95">Essence SP95</option>
              <option value="diesel">Diesel</option>
              <option value="e85">E85</option>
              <option value="elec">Électrique</option>
              <option value="hydro">Hydrogène</option>
            </select>
          </div>
          {!isElec && !isH2 && (
            <div>
              <label className="block text-xs font-medium text-ink2 mb-1">
                Prix carburant : {price.toFixed(2)} €/L
              </label>
              <input
                type="range"
                min={100}
                max={250}
                value={Math.round(price * 100)}
                onChange={(e) => setPrice(Number(e.target.value) / 100)}
                className="w-full accent-sea2"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-ink2 mb-1">
              Après échange de poste
            </label>
            <select
              className="input"
              value={future}
              onChange={(e) => setFuture(e.target.value)}
            >
              <option value="none">Trajet réduit (voiture, 8 km)</option>
              <option value="vae">Vélo à assistance électrique</option>
              <option value="marche">Marche à pied</option>
              <option value="tc">Transport en commun</option>
              <option value="elec">Véhicule électrique</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Coût carburant</div>
            <div className="font-heading text-xl font-bold text-ink">
              -{fmt(result.fuelCost)}/an
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Coût total trajet</div>
            <div className="font-heading text-xl font-bold text-ink">
              {fmt(result.totalCost)}/an
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Temps passé</div>
            <div className="font-heading text-xl font-bold text-ink">
              {Math.round(result.annHours)} h/an
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-fog mb-1">Émissions CO₂</div>
            <div className="font-heading text-xl font-bold text-ink">
              {fmtCO2(result.co2Ton)}/an
            </div>
            <div className="mt-2 h-2 bg-ice2 rounded-full overflow-hidden">
              <div
                className="h-full bg-sea2"
                style={{
                  width: `${Math.max(
                    5,
                    (result.newCo2 / Math.max(result.co2Ton, 0.01)) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className="card p-5 border border-seaL bg-seaL/40">
            <div className="text-xs text-sea mb-1">
              Gain estimé après échange — {result.futureLbl}
            </div>
            <div className="font-heading text-xl font-bold text-sea">
              +{fmt(result.saving)}/an
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
