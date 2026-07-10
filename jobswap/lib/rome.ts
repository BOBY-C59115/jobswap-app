// Sélection élargie de métiers ROME (France Travail), couvrant les 14
// grands domaines professionnels du référentiel officiel.
//
// IMPORTANT — limites de cette liste : le référentiel ROME officiel compte
// plusieurs centaines de fiches métiers (532 dans la version ROME 4.0
// d'origine, en augmentation continue). Cette liste reste une sélection
// large mais non exhaustive, construite à la main pour couvrir la plupart
// des familles de métiers courantes. Une exhaustivité totale et garantie
// nécessiterait de connecter l'API officielle "ROME 4.0 - Métiers" sur
// francetravail.io (compte déjà créé pour l'API Offres d'emploi — il
// faudrait y associer ce produit supplémentaire). Non fait à ce stade par
// prudence : je n'ai pas pu vérifier en conditions réelles l'URL exacte de
// cette API depuis mon environnement de développement.
//
// Le préfixe (1 lettre + 2 chiffres) définit la famille de métier utilisée
// pour le score de compatibilité (romeFamily).
export const ROME_CODES: { code: string; label: string }[] = [
  // Commerce, vente
  { code: "D1401", label: "Assistanat commercial" },
  { code: "D1402", label: "Relation commerciale grands comptes" },
  { code: "D1403", label: "Relation commerciale auprès de particuliers" },
  { code: "D1404", label: "Relation commerciale auprès d'entreprises" },
  { code: "D1406", label: "Management en force de vente" },
  { code: "D1407", label: "Relation technico-commerciale" },
  { code: "D1408", label: "Téléconseil et télévente" },
  { code: "D1214", label: "Vente en habillement et accessoires de la personne" },
  { code: "D1106", label: "Vente en alimentation" },

  // Communication, média
  { code: "E1103", label: "Communication" },
  { code: "E1104", label: "Conception de contenus multimédias" },
  { code: "E1106", label: "Journalisme et information média" },
  { code: "E1108", label: "Traduction, interprétariat" },

  // Banque, assurance, immobilier
  { code: "C1206", label: "Gestion de clientèle bancaire" },
  { code: "C1204", label: "Conseil en gestion de patrimoine financier" },
  { code: "C1103", label: "Courtage en assurances" },
  { code: "C1401", label: "Conception et développement produit d'assurance" },
  { code: "C1502", label: "Analyse de risques bancaires et financiers" },

  // Bâtiment, travaux publics
  { code: "F1101", label: "Architecture du BTP" },
  { code: "F1106", label: "Dessin BTP" },
  { code: "F1201", label: "Conduite de travaux du BTP" },
  { code: "F1202", label: "Réalisation de gros oeuvre" },
  { code: "F1301", label: "Conduite de travaux publics" },
  { code: "F1602", label: "Électricité bâtiment" },
  { code: "F1603", label: "Installation d'équipements sanitaires et thermiques" },
  { code: "F1604", label: "Montage d'agencements" },

  // Hôtellerie, restauration, tourisme
  { code: "G1402", label: "Personnel de cuisine" },
  { code: "G1501", label: "Personnel polyvalent en restauration" },
  { code: "G1602", label: "Personnel d'étage" },
  { code: "G1701", label: "Personnel de la réception" },
  { code: "G1803", label: "Guide accompagnateur touristique" },

  // Industrie
  { code: "H1102", label: "Management et ingénierie études, R&D industriel" },
  { code: "H1206", label: "Management et ingénierie Hygiène Sécurité Environnement" },
  { code: "H1502", label: "Management et ingénierie qualité industrielle" },
  { code: "H2102", label: "Conduite d'équipement de production industrielle" },
  { code: "H2504", label: "Installation et maintenance électronique" },
  { code: "H2909", label: "Pilotage d'unité élémentaire de production mécanique" },

  // Installation, maintenance
  { code: "I1301", label: "Installation et maintenance d'équipements industriels" },
  { code: "I1302", label: "Installation et maintenance d'ascenseurs" },
  { code: "I1310", label: "Maintenance mécanique industrielle" },
  { code: "I1401", label: "Installation et maintenance d'équipements de chauffage" },
  { code: "I1402", label: "Installation et maintenance d'équipements frigorifiques" },
  { code: "I1603", label: "Installation et maintenance télécoms et courants faibles" },

  // Santé
  { code: "J1201", label: "Aide-soignant" },
  { code: "J1301", label: "Biologie médicale" },
  { code: "J1409", label: "Soins infirmiers spécialisés" },
  { code: "J1501", label: "Médecine généraliste et spécialisée" },
  { code: "J1502", label: "Médecine de prévention" },

  // Social, RH, formation
  { code: "K1801", label: "Conseil en emploi et insertion socioprofessionnelle" },
  { code: "K1802", label: "Développement local" },
  { code: "K1206", label: "Intervention socioculturelle" },
  { code: "K1303", label: "Assistance auprès d'adultes" },
  { code: "K1304", label: "Assistance auprès d'enfants" },
  { code: "K2101", label: "Conception de contenus pédagogiques" },
  { code: "K2110", label: "Formation professionnelle des adultes" },

  // Support entreprise : gestion, comptabilité, achats
  { code: "M1101", label: "Achats" },
  { code: "M1102", label: "Direction des achats" },
  { code: "M1201", label: "Analyse et ingénierie financière" },
  { code: "M1202", label: "Audit et contrôle comptables et financiers" },
  { code: "M1203", label: "Comptabilité" },
  { code: "M1204", label: "Contrôle de gestion" },
  { code: "M1301", label: "Direction des services financiers, comptables" },
  { code: "M1402", label: "Conseil en organisation et management d'entreprise" },

  // Support entreprise : administratif, secrétariat
  { code: "M1602", label: "Opérations administratives" },
  { code: "M1604", label: "Assistanat de direction" },
  { code: "M1605", label: "Assistanat technique et administratif" },
  { code: "M1606", label: "Saisie de données" },
  { code: "M1607", label: "Secrétariat" },

  // Support entreprise : RH, marketing, vente B2B
  { code: "M1501", label: "Assistanat en ressources humaines" },
  { code: "M1502", label: "Développement des ressources humaines" },
  { code: "M1503", label: "Management des ressources humaines" },
  { code: "M1701", label: "Administration des ventes" },
  { code: "M1705", label: "Marketing" },

  // Support entreprise : systèmes d'information / IT
  { code: "M1802", label: "Expertise et support en systèmes d'information" },
  { code: "M1803", label: "Direction des systèmes d'information" },
  { code: "M1805", label: "Études et développement informatique" },
  { code: "M1806", label: "Conseil et maîtrise d'ouvrage en systèmes d'information" },
  { code: "M1810", label: "Production et exploitation de systèmes d'information" },

  // Transport, logistique
  { code: "N1101", label: "Conduite de transport de particuliers" },
  { code: "N1103", label: "Conduite de transport en commun sur route" },
  { code: "N1201", label: "Affrètement transport" },
  { code: "N1301", label: "Conduite de transport de marchandises" },
  { code: "N1303", label: "Intervention technique d'exploitation logistique" },
  { code: "N2101", label: "Gestion de trafic et transport de fret" },
  { code: "N2201", label: "Renseignement, orientation et vente de services de transport" },
  { code: "N4101", label: "Conduite et livraison par tournées" },
  { code: "N4102", label: "Magasinage et préparation de commandes" },
  { code: "N4104", label: "Direction de site logistique" },
  { code: "N4105", label: "Manutention manuelle de charges" },
];

export function romeFamily(code: string): string {
  // Les 2 premiers caractères désignent le grand domaine (ex: "N1", "M1")
  return code.slice(0, 2);
}
