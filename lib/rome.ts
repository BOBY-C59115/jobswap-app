// Sélection de métiers ROME (France Travail) représentatifs de postes
// comparables inter-entreprises. Le préfixe (2 lettres + 1 chiffre)
// définit la famille de métier utilisée pour le score de compatibilité.
export const ROME_CODES: { code: string; label: string }[] = [
  { code: "N1301", label: "Conduite de transport de marchandises" },
  { code: "N1303", label: "Intervention technique d'exploitation logistique" },
  { code: "M1607", label: "Secrétariat" },
  { code: "M1203", label: "Comptabilité" },
  { code: "M1204", label: "Contrôle de gestion" },
  { code: "M1701", label: "Administration des ventes" },
  { code: "M1705", label: "Marketing" },
  { code: "D1401", label: "Assistanat commercial" },
  { code: "D1402", label: "Relation commerciale grands comptes" },
  { code: "H1102", label: "Management et ingénierie études, recherche et développement industriel" },
  { code: "H2102", label: "Conduite d'équipement de production industrielle" },
  { code: "H2504", label: "Installation et maintenance électronique" },
  { code: "I1310", label: "Maintenance mécanique industrielle" },
  { code: "K1802", label: "Développement local" },
  { code: "M1502", label: "Développement des ressources humaines" },
  { code: "M1503", label: "Management des ressources humaines" },
];

export function romeFamily(code: string): string {
  // Les 2 premiers caractères désignent le grand domaine (ex: "N1", "M1")
  return code.slice(0, 2);
}
