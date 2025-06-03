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
  DR: { name: "Division de la Réglementation", code: "DR" },
  DCC: { name: "Direction de la Communication et de la Coopération", code: "DCC" },
  DCGAI: { name: "Direction du Contrôle Général et de l'Audit Interne", code: "DCGAI" }
} as const;

export type DivisionCode = keyof typeof DIVISIONS;