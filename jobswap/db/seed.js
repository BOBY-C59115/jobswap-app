const Database = require("better-sqlite3");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const DB_PATH = path.join(process.cwd(), "db", "jobswap.sqlite3");
const db = new Database(DB_PATH);
db.exec(fs.readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf-8"));

const CITIES = {
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

const ROME = [
  { code: "N1301", label: "Conduite de transport de marchandises" },
  { code: "N1303", label: "Intervention technique d'exploitation logistique" },
  { code: "M1607", label: "Secrétariat" },
  { code: "M1203", label: "Comptabilité" },
  { code: "M1204", label: "Contrôle de gestion" },
  { code: "M1701", label: "Administration des ventes" },
  { code: "M1705", label: "Marketing" },
  { code: "D1401", label: "Assistanat commercial" },
  { code: "D1402", label: "Relation commerciale grands comptes" },
  { code: "H1102", label: "Management et ingénierie études, R&D industriel" },
  { code: "H2102", label: "Conduite d'équipement de production industrielle" },
  { code: "H2504", label: "Installation et maintenance électronique" },
  { code: "I1310", label: "Maintenance mécanique industrielle" },
  { code: "K1802", label: "Développement local" },
  { code: "M1502", label: "Développement des ressources humaines" },
  { code: "M1503", label: "Management des ressources humaines" },
];

const CLASSIFICATIONS = [
  "Employé",
  "Agent de maîtrise",
  "Technicien",
  "Cadre N1",
  "Cadre N2",
  "Cadre N3",
];
const CONTRACTS = ["CDI", "CDD"];

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(arr, i) {
  return arr[i % arr.length];
}

const rand = mulberry32(42);
const cityNames = Object.keys(CITIES);

db.prepare(`DELETE FROM seed_profiles`).run();
const insert = db.prepare(
  `INSERT INTO seed_profiles (id, pseudonym, rome_code, rome_label, classification,
   contract_type, city, postal_code, lat, lng, commute_km) VALUES (?,?,?,?,?,?,?,?,?,?,?)`
);

const insertMany = db.transaction((rows) => {
  for (const r of rows) insert.run(...r);
});

const rows = [];
for (let i = 0; i < 90; i++) {
  const city = pick(cityNames, i + Math.floor(rand() * cityNames.length));
  const rome = pick(ROME, i + Math.floor(rand() * ROME.length));
  const classification = pick(
    CLASSIFICATIONS,
    i + Math.floor(rand() * CLASSIFICATIONS.length)
  );
  const contractType = pick(CONTRACTS, Math.floor(rand() * 2));
  const c = CITIES[city];
  rows.push([
    crypto.randomUUID(),
    `Salarié ${rome.code}-${c.postalCode.slice(0, 2)}${i}`,
    rome.code,
    rome.label,
    classification,
    contractType,
    city,
    c.postalCode,
    c.lat + (rand() - 0.5) * 0.05,
    c.lng + (rand() - 0.5) * 0.05,
    Math.round(8 + rand() * 70),
  ]);
}
insertMany(rows);
console.log(`Seed terminé : ${rows.length} profils de démonstration créés.`);
