// Workflow step content and customizations for each phase and step
export interface WorkflowStepContent {
  title: string;
  description: string;
  instructions: string;
  actorRole: string;
  expectedActions: string[];
  requiredDocuments?: string[];
  deliverables?: string[];
  estimatedDuration?: string;
}

export const WORKFLOW_STEP_CONTENT: Record<string, WorkflowStepContent> = {
  // Phase 1: Préparation et Publication de l'Appel d'Offres
  "1-1": {
    title: "DAO Envoyé par ST",
    description: "Le Service Technique élabore et envoie le Dossier d'Appel d'Offres",
    instructions: "Vous devez finaliser la préparation du dossier d'appel d'offres et le transmettre au Service Marchés pour validation et traitement.",
    actorRole: "ST",
    expectedActions: [
      "Vérifier la complétude du dossier technique",
      "Valider les spécifications techniques",
      "Contrôler les plans et documents joints",
      "Transmettre le dossier au Service Marchés"
    ],
    requiredDocuments: [
      "Cahier des charges techniques",
      "Plans et spécifications",
      "Estimation budgétaire",
      "Analyse des besoins"
    ],
    deliverables: ["Dossier d'appel d'offres complet et validé"],
    estimatedDuration: "3-5 jours"
  },
  "1-2": {
    title: "DAO Étudié et Envoyé au CE",
    description: "Le Service Marchés étudie le dossier et l'envoie au Contrôle d'État",
    instructions: "Examinez le dossier d'appel d'offres reçu du Service Technique, vérifiez sa conformité administrative et transmettez-le au Contrôle d'État.",
    actorRole: "SM",
    expectedActions: [
      "Analyser la conformité administrative du dossier",
      "Vérifier le respect des procédures de marchés publics",
      "Contrôler la cohérence budgétaire",
      "Préparer la transmission au Contrôle d'État"
    ],
    requiredDocuments: [
      "Dossier technique du ST",
      "Grille d'analyse administrative",
      "Fiche de transmission CE"
    ],
    deliverables: ["Dossier vérifié et transmis au Contrôle d'État"],
    estimatedDuration: "5-7 jours"
  },
  "1-3": {
    title: "DAO Revue par CE",
    description: "Le Contrôle d'État revoit le dossier d'appel d'offres",
    instructions: "Procédez à l'examen réglementaire et juridique du dossier d'appel d'offres pour s'assurer de sa conformité aux textes en vigueur.",
    actorRole: "CE",
    expectedActions: [
      "Contrôler la conformité réglementaire",
      "Vérifier le respect du code des marchés publics",
      "Analyser la légalité des clauses contractuelles",
      "Formuler les observations nécessaires"
    ],
    requiredDocuments: [
      "Dossier d'appel d'offres",
      "Textes réglementaires de référence",
      "Grille de contrôle CE"
    ],
    deliverables: ["Rapport d'examen avec observations"],
    estimatedDuration: "2-3 jours"
  },
  
  // Phase 2: Exécution du Marché
  "2-1": {
    title: "Information de la notification OS",
    description: "Information de la notification de l'Ordre de Service",
    instructions: "Informez le Service Technique que l'ordre de service a été notifié au prestataire et que les travaux peuvent commencer.",
    actorRole: "SM",
    expectedActions: [
      "Confirmer la notification de l'ordre de service",
      "Informer le Service Technique du démarrage",
      "Transmettre les coordonnées du prestataire",
      "Planifier le suivi d'exécution"
    ],
    requiredDocuments: [
      "Ordre de service signé",
      "Accusé de réception du prestataire",
      "Planning prévisionnel des travaux"
    ],
    deliverables: ["Notification de démarrage officielle"],
    estimatedDuration: "1-2 jours"
  },
  "2-8": {
    title: "Réception des prestations",
    description: "Réception des prestations par la commission",
    instructions: "Procédez à la réception des prestations réalisées par le prestataire et établissez le procès-verbal de réception.",
    actorRole: "ST",
    expectedActions: [
      "Organiser la commission de réception",
      "Contrôler la conformité des prestations",
      "Identifier les éventuelles réserves",
      "Rédiger le procès-verbal de réception"
    ],
    requiredDocuments: [
      "Dossier technique des travaux réalisés",
      "Rapports de contrôle qualité",
      "Photos et constats visuels"
    ],
    deliverables: ["Procès-verbal de réception"],
    estimatedDuration: "3-5 jours"
  },
  
  // Phase 3: Paiement
  "3-1": {
    title: "Transmission du Dossier de paiement",
    description: "Transmission du dossier de paiement au Service Ordonnancement",
    instructions: "Préparez et transmettez le dossier de paiement complet au Service Ordonnancement pour traitement.",
    actorRole: "SM",
    expectedActions: [
      "Rassembler tous les documents de paiement",
      "Vérifier la cohérence des montants",
      "Contrôler les factures et décomptes",
      "Transmettre au Service Ordonnancement"
    ],
    requiredDocuments: [
      "Factures du prestataire",
      "Décomptes et situations",
      "Procès-verbal de réception",
      "Attestations fiscales et sociales"
    ],
    deliverables: ["Dossier de paiement complet"],
    estimatedDuration: "2-3 jours"
  },
  "3-2": {
    title: "Examen du Dossier de paiement",
    description: "Examen du dossier de paiement par le SOR",
    instructions: "Examinez la conformité administrative et financière du dossier de paiement reçu du Service Marchés.",
    actorRole: "SOR",
    expectedActions: [
      "Contrôler la complétude du dossier",
      "Vérifier les calculs et montants",
      "Valider les pièces justificatives",
      "Formuler les observations nécessaires"
    ],
    requiredDocuments: [
      "Dossier de paiement du SM",
      "Grille de contrôle SOR",
      "Références budgétaires"
    ],
    deliverables: ["Rapport d'examen avec avis"],
    estimatedDuration: "3-4 jours"
  }
};

export function getWorkflowStepContent(phase: number, step: number): WorkflowStepContent | null {
  const key = `${phase}-${step}`;
  return WORKFLOW_STEP_CONTENT[key] || null;
}

export function getPhaseTitle(phase: number): string {
  switch (phase) {
    case 1:
      return "Phase 1: Préparation et Publication de l'Appel d'Offres";
    case 2:
      return "Phase 2: Exécution du Marché";
    case 3:
      return "Phase 3: Paiement";
    default:
      return `Phase ${phase}`;
  }
}