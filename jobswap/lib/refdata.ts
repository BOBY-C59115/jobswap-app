export const CLASSIFICATIONS = [
  "Employé",
  "Agent de maîtrise",
  "Technicien",
  "Cadre N1",
  "Cadre N2",
  "Cadre N3",
];

export const SECTEURS_NAF = [
  "Industrie manufacturière",
  "Commerce de gros et détail",
  "Transport et logistique",
  "Construction / BTP",
  "Information et communication",
  "Activités financières et d'assurance",
  "Activités spécialisées, scientifiques et techniques",
  "Administration publique",
  "Santé humaine et action sociale",
  "Enseignement",
  "Hébergement et restauration",
  "Agriculture, sylviculture, pêche",
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
