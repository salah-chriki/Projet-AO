export const ACTOR_ROLES = {
  ST: {
    code: "ST",
    name: "Service Technique",
    color: "059669", // green-600
    bgColor: "ecfdf5", // green-50
    textColor: "065f46", // green-800
  },
  SM: {
    code: "SM", 
    name: "Service Marchés",
    color: "dc2626", // red-600
    bgColor: "fef2f2", // red-50
    textColor: "991b1b", // red-800
  },
  CE: {
    code: "CE",
    name: "Contrôle d'État",
    color: "7c3aed", // violet-600
    bgColor: "f3f4f6", // violet-50
    textColor: "5b21b6", // violet-800
  },
  SB: {
    code: "SB",
    name: "Service Budgétaire", 
    color: "ea580c", // orange-600
    bgColor: "fff7ed", // orange-50
    textColor: "c2410c", // orange-700
  },
  SOR: {
    code: "SOR",
    name: "Service Ordonnancement",
    color: "0891b2", // cyan-600
    bgColor: "ecfeff", // cyan-50  
    textColor: "155e75", // cyan-800
  },
  TP: {
    code: "TP",
    name: "Trésorier Payeur",
    color: "be123c", // rose-700
    bgColor: "fdf2f8", // rose-50
    textColor: "9f1239", // rose-800
  },
  ADMIN: {
    code: "ADMIN",
    name: "Administrateur",
    color: "1f2937", // gray-800
    bgColor: "f9fafb", // gray-50
    textColor: "111827", // gray-900
  }
} as const;

export const PHASES = {
  1: {
    name: "Phase 1: Préparation",
    color: "blue",
    bgColor: "dbeafe", // blue-100
    textColor: "1e40af", // blue-800
  },
  2: {
    name: "Phase 2: Exécution", 
    color: "orange",
    bgColor: "fed7aa", // orange-100
    textColor: "c2410c", // orange-700
  },
  3: {
    name: "Phase 3: Paiements",
    color: "green", 
    bgColor: "dcfce7", // green-100
    textColor: "166534", // green-800
  }
} as const;

export const TENDER_STATUS = {
  active: {
    name: "Actif",
    color: "green",
    bgColor: "dcfce7",
    textColor: "166534",
  },
  completed: {
    name: "Terminé",
    color: "blue",
    bgColor: "dbeafe", 
    textColor: "1e40af",
  },
  cancelled: {
    name: "Annulé",
    color: "red",
    bgColor: "fecaca",
    textColor: "991b1b",
  }
} as const;
