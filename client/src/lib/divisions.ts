export const DIVISIONS = {
  DAF: {
    name: "Direction des Affaires Financières",
    departments: {
      DSI: "Direction des Systèmes d'Information",
      DRHS: "Direction des Ressources Humaines et Sociales",
      DF: "Direction Financière"
    }
  },
  DPPAV: {
    name: "Direction de la Planification et des Politiques d'Aménagement et de Valorisation",
    departments: {
      DCSP: "Direction de la Coordination et du Suivi des Programmes",
      DSA: "Direction de la Stratégie et de l'Aménagement",
      DPV: "Direction de la Planification et de la Valorisation"
    }
  },
  DCPA: {
    name: "Direction de la Coordination des Projets et de l'Administration",
    departments: {
      DCPVOV: "Direction de la Coordination des Projets et de la Valorisation des Ouvrages Vertébraux",
      DPPA: "Direction de la Planification des Projets et de l'Administration",
      DSSPAAA: "Direction du Suivi et du Support des Projets d'Aménagement et d'Administration Avancée"
    }
  },
  DIL: {
    name: "Direction de l'Infrastructure et de la Logistique",
    departments: {
      DIC: "Direction de l'Infrastructure et de la Construction",
      DL: "Direction de la Logistique",
      DPIV: "Direction de la Planification de l'Infrastructure et de la Valorisation"
    }
  },
  DERAJ: {
    name: "Direction de l'Environnement, des Ressources et de l'Administration Juridique",
    departments: {
      DERSP: "Direction de l'Environnement et des Ressources Spécialisées",
      DNQSPS: "Direction de la Normalisation, de la Qualité et du Suivi des Procédures Spécialisées",
      DR: "Direction de la Réglementation"
    }
  },
  DCC: {
    name: "Direction du Contrôle et de la Conformité",
    departments: {
      DCC: "Direction du Contrôle et de la Conformité"
    }
  },
  DCGAI: {
    name: "Direction de la Coordination Générale et de l'Administration Intégrée",
    departments: {
      DCGAI: "Direction de la Coordination Générale et de l'Administration Intégrée"
    }
  }
} as const;

export type DivisionCode = keyof typeof DIVISIONS;
export type DepartmentCode = string;