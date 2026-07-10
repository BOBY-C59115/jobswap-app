export const CLASSIFICATIONS = [
  "Employé",
  "Agent de maîtrise",
  "Technicien",
  "Cadre N1",
  "Cadre N2",
  "Cadre N3",
];

// Nomenclature NAF rév. 2 (INSEE) — les 21 sections (A à U) sont ici
// listées de façon EXHAUSTIVE (il n'existe pas de 22e section). C'est le
// niveau le plus agrégé de la nomenclature officielle ; les niveaux plus
// fins (88 divisions, 732 codes) ne sont pas repris ici pour rester
// lisibles dans un formulaire.
export const SECTEURS_NAF = [
  "Agriculture, sylviculture et pêche",
  "Industries extractives",
  "Industrie manufacturière",
  "Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné",
  "Production et distribution d'eau, assainissement, gestion des déchets et dépollution",
  "Construction",
  "Commerce ; réparation d'automobiles et de motocycles",
  "Transports et entreposage",
  "Hébergement et restauration",
  "Information et communication",
  "Activités financières et d'assurance",
  "Activités immobilières",
  "Activités spécialisées, scientifiques et techniques",
  "Activités de services administratifs et de soutien",
  "Administration publique",
  "Enseignement",
  "Santé humaine et action sociale",
  "Arts, spectacles et activités récréatives",
  "Autres activités de services",
  "Activités des ménages en tant qu'employeurs",
  "Activités extra-territoriales",
];

export const CONVENTIONS_COLLECTIVES = [
  "Métallurgie (IDCC 3248)",
  "Commerce de gros (IDCC 573)",
  "Transport routier (IDCC 16)",
  "Bureaux d'études techniques - Syntec (IDCC 1486)",
  "Commerces de détail non alimentaires (IDCC 1517)",
  "Industries chimiques (IDCC 44)",
  "Aucune convention / non applicable",
];

export const HORAIRES = [
  { value: "fixes", label: "Horaires fixes" },
  { value: "variables", label: "Horaires variables / flexibles" },
  { value: "decales", label: "Horaires décalés" },
  { value: "nuit", label: "Travail de nuit" },
  { value: "forfait_jour", label: "Forfait jours (cadre autonome)" },
];

export const DEPLACEMENTS = [
  { value: "aucun", label: "Aucun déplacement" },
  { value: "occasionnel", label: "Occasionnels (quelques jours/mois)" },
  { value: "frequent", label: "Fréquents (chaque semaine)" },
  { value: "permanent", label: "Poste itinérant" },
];

export const VEHICLE_TYPES = [
  { value: "citadine", label: "Citadine" },
  { value: "berline", label: "Berline / compacte" },
  { value: "suv", label: "SUV" },
  { value: "utilitaire", label: "Utilitaire" },
  { value: "deux_roues", label: "Deux-roues motorisé" },
  { value: "velo", label: "Vélo classique" },
  { value: "vae", label: "Vélo à assistance électrique" },
];

export const FUEL_TYPES = [
  { value: "sp95", label: "Essence SP95" },
  { value: "sp98", label: "Essence SP98" },
  { value: "diesel", label: "Diesel" },
  { value: "e85", label: "E85 / bioéthanol" },
  { value: "hybride", label: "Hybride" },
  { value: "electrique", label: "100 % électrique" },
  { value: "hydrogene", label: "Hydrogène" },
];

export const ENVISAGED_MODES = [
  { value: "vehicule_identique", label: "Même véhicule, trajet plus court" },
  { value: "vehicule_electrique", label: "Passage à un véhicule électrique" },
  { value: "vae", label: "Vélo à assistance électrique" },
  { value: "marche", label: "Marche à pied" },
  { value: "transport_commun", label: "Transport en commun" },
  { value: "covoiturage", label: "Covoiturage" },
];

// Correspondance secteur (libellé affiché) -> section NAF (lettre A-U),
// utilisée pour interroger l'API Recherche d'entreprises (INSEE Sirene).
// Référentiel NAF rév. 2 (INSEE) — mapping exhaustif des 21 sections.
export const SECTEUR_NAF_SECTION: Record<string, string> = {
  "Agriculture, sylviculture et pêche": "A",
  "Industries extractives": "B",
  "Industrie manufacturière": "C",
  "Production et distribution d'électricité, de gaz, de vapeur et d'air conditionné": "D",
  "Production et distribution d'eau, assainissement, gestion des déchets et dépollution": "E",
  "Construction": "F",
  "Commerce ; réparation d'automobiles et de motocycles": "G",
  "Transports et entreposage": "H",
  "Hébergement et restauration": "I",
  "Information et communication": "J",
  "Activités financières et d'assurance": "K",
  "Activités immobilières": "L",
  "Activités spécialisées, scientifiques et techniques": "M",
  "Activités de services administratifs et de soutien": "N",
  "Administration publique": "O",
  "Enseignement": "P",
  "Santé humaine et action sociale": "Q",
  "Arts, spectacles et activités récréatives": "R",
  "Autres activités de services": "S",
  "Activités des ménages en tant qu'employeurs": "T",
  "Activités extra-territoriales": "U",
};
