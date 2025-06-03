export const DIRECTIONS = {
  DAF: { name: "Direction Administrative et Financière", code: "DAF" },
  DPPAV: { name: "Direction de la Planification, de la Programmation et de l'Aménagement du Village", code: "DPPAV" },
  DCPA: { name: "Direction du Contrôle et de la Performance Administrative", code: "DCPA" },
  DIL: { name: "Direction de l'Informatique et de la Logistique", code: "DIL" },
  DERAJ: { name: "Direction des Études, de la Recherche et de l'Appui Juridique", code: "DERAJ" },
  DCC: { name: "Direction de la Communication et de la Coopération", code: "DCC" },
  DCGAI: { name: "Direction du Contrôle Général et de l'Audit Interne", code: "DCGAI" }
} as const;

export const DIVISIONS = {
  DSI: { name: "Division des Systèmes d'Information", code: "DSI" },
  DRHS: { name: "Division des Ressources Humaines et Sociales", code: "DRHS" },
  DF: { name: "Division Financière", code: "DF" },
  DCSP: { name: "Division du Contrôle et du Suivi des Projets", code: "DCSP" },
  DSA: { name: "Division des Services Administratifs", code: "DSA" },
  DPV: { name: "Division de la Planification Villageoise", code: "DPV" },
  DCPVOV: { name: "Division de la Coordination des Projets Villageois et des Organisations Villageoises", code: "DCPVOV" },
  DPPA: { name: "Division de la Programmation et du Pilotage des Activités", code: "DPPA" },
  DSSPAAA: { name: "Division du Suivi-Supervision des Projets et de l'Appui aux Autres Acteurs", code: "DSSPAAA" },
  DIC: { name: "Division de l'Information et de la Communication", code: "DIC" },
  DL: { name: "Division de la Logistique", code: "DL" },
  DPIV: { name: "Division de la Promotion des Investissements Villageois", code: "DPIV" },
  DERSP: { name: "Division des Études et de la Recherche de Solutions aux Problèmes", code: "DERSP" },
  DNQSPS: { name: "Division des Normes, de la Qualité et du Suivi des Prestations de Services", code: "DNQSPS" },
  DR: { name: "Division de la Réglementation", code: "DR" }
} as const;

export type DirectionCode = keyof typeof DIRECTIONS;
export type DivisionCode = keyof typeof DIVISIONS;

// Division to Direction mapping based on organizational structure
export const DIVISION_TO_DIRECTION: Record<DivisionCode, DirectionCode> = {
  // DAF contains: DSI, DRHS, DF
  DSI: 'DAF',
  DRHS: 'DAF', 
  DF: 'DAF',
  
  // DPPAV contains: DCSP, DSA, DPV
  DCSP: 'DPPAV',
  DSA: 'DPPAV',
  DPV: 'DPPAV',
  
  // DCPA contains: DCPVOV, DPPA, DSSPAAA
  DCPVOV: 'DCPA',
  DPPA: 'DCPA',
  DSSPAAA: 'DCPA',
  
  // DIL contains: DIC, DL, DPIV
  DIC: 'DIL',
  DL: 'DIL',
  DPIV: 'DIL',
  
  // DERAJ contains: DERSP, DNQSPS, DR
  DERSP: 'DERAJ',
  DNQSPS: 'DERAJ',
  DR: 'DERAJ'
};

// Helper function to get direction from division
export function getDirectionFromDivision(division: DivisionCode): DirectionCode {
  return DIVISION_TO_DIRECTION[division] || division as DirectionCode;
}

// Get divisions for a specific direction
export function getDivisionsForDirection(direction: DirectionCode): DivisionCode[] {
  return Object.entries(DIVISION_TO_DIRECTION)
    .filter(([_, dir]) => dir === direction)
    .map(([div, _]) => div as DivisionCode);
}