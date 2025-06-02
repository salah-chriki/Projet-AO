import { db } from "./db";
import { workflowSteps } from "@shared/schema";

export async function initializeRealWorkflowSteps() {
  console.log("Initializing real workflow steps...");
  
  // Check if we already have the real workflow steps
  const existingSteps = await db.select().from(workflowSteps);
  if (existingSteps.length >= 59) { // We expect 59 total steps (23+19+17)
    console.log("Real workflow steps already initialized");
    return;
  }
  
  // Clear existing data carefully
  const { tenderStepHistory, tenders } = await import("@shared/schema");
  await db.delete(tenderStepHistory);
  await db.delete(tenders);
  await db.delete(workflowSteps);

  // Phase 1: Préparation et Publication de l'Appel d'Offres (23 étapes)
  const phase1Steps = [
    {
      phase: 1,
      stepNumber: 1,
      title: "Envoi du DAO",
      description: "Le Service Technique élabore le Dossier d'Appel d'Offres comprenant le cahier des charges techniques, les spécifications, les plans et le transmet au Service Marchés",
      actorRole: "ST"
    },
    {
      phase: 1,
      stepNumber: 2,
      title: "Étude et Envoi au CE",
      description: "Le Service Marchés examine le dossier, vérifie la conformité administrative et juridique puis le transmet au Contrôle d'État pour validation",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 3,
      title: "Revue par CE",
      description: "Le Contrôle d'État examine le dossier pour s'assurer de la conformité réglementaire, budgétaire et procédurale",
      actorRole: "CE"
    },
    {
      phase: 1,
      stepNumber: 4,
      title: "Transmission des remarques CE",
      description: "Le Contrôle d'État formule ses observations et demandes de corrections techniques qu'il transmet au Service Technique",
      actorRole: "CE"
    },
    {
      phase: 1,
      stepNumber: 5,
      title: "Satisfaction des remarques CE",
      description: "Le Service Technique apporte les corrections et modifications demandées puis retourne le dossier corrigé au Service Marchés",
      actorRole: "ST"
    },
    {
      phase: 1,
      stepNumber: 6,
      title: "Vérification et Envoi au CE",
      description: "Le Service Marchés vérifie l'intégration des corrections et retransmet le dossier au Contrôle d'État pour validation finale",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 7,
      title: "Validation par CE",
      description: "Le Contrôle d'État donne son accord définitif et valide le dossier d'appel d'offres",
      actorRole: "CE"
    },
    {
      phase: 1,
      stepNumber: 8,
      title: "Transmission à la commission d'AO",
      description: "Le Service Marchés informe le Service Technique que le dossier est validé et peut être soumis à la commission d'appel d'offres",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 9,
      title: "Signature du DAO",
      description: "Le Service Marchés fait signer le dossier d'appel d'offres par l'autorité compétente",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 10,
      title: "Projet AO publié",
      description: "Publication de l'avis d'appel d'offres dans la presse spécialisée et sur les plateformes officielles",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 11,
      title: "Ouverture des plis",
      description: "Réception et ouverture publique des offres des soumissionnaires à la date limite",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 12,
      title: "Jugement Définitif",
      description: "Évaluation des offres par la commission, analyse technique et financière, et désignation de l'attributaire",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 13,
      title: "Information de l'attributaire",
      description: "Notification officielle au Contrôle d'État de l'identité de l'entreprise retenue",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 14,
      title: "Établissement du Marché",
      description: "Le Contrôle d'État demande au Service Technique d'établir le contrat définitif avec l'attributaire",
      actorRole: "CE"
    },
    {
      phase: 1,
      stepNumber: 15,
      title: "Signature du Marché par la Direction Technique",
      description: "La Direction Technique signe le marché et le retourne au Service Marchés",
      actorRole: "ST"
    },
    {
      phase: 1,
      stepNumber: 16,
      title: "Remise du Marché au Prestataire",
      description: "Le Service Marchés remet officiellement le marché signé au prestataire retenu",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 17,
      title: "Transmission du Marché pour Engagement",
      description: "Le Service Marchés transmet le marché au Service Budgétaire pour engagement des crédits",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 18,
      title: "Engagement du Marché",
      description: "Le Service Budgétaire procède à l'engagement budgétaire et confirme la disponibilité des fonds",
      actorRole: "SB"
    },
    {
      phase: 1,
      stepNumber: 19,
      title: "Approbation du Marché",
      description: "Le Service Marchés obtient l'approbation finale de l'autorité de tutelle",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 20,
      title: "Visa du Marché",
      description: "Apposition du visa réglementaire sur le marché approuvé",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 21,
      title: "Notification de l'approbation du marché au titulaire",
      description: "Information officielle au Contrôle d'État de l'approbation définitive du marché",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 22,
      title: "Dépôt de la caution définitive",
      description: "Le Contrôle d'État confirme la réception de la garantie de bonne exécution du prestataire",
      actorRole: "CE"
    },
    {
      phase: 1,
      stepNumber: 23,
      title: "Élaboration de l'Ordre de Service",
      description: "Le Service Marchés prépare l'ordre de service de commencement des travaux",
      actorRole: "SM"
    }
  ];

  // Phase 2: Exécution et Contrôle des Prestations (19 étapes)
  const phase2Steps = [
    {
      phase: 2,
      stepNumber: 1,
      title: "Information de la notification OS",
      description: "Le Service Marchés informe le Service Technique de l'émission de l'ordre de service pour démarrer les prestations",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 2,
      title: "Demande de suspendre l'exécution des prestations",
      description: "Le Service Technique demande l'arrêt temporaire des travaux en cas de problème technique ou de non-conformité",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 3,
      title: "Transmission de l'Ordre d'arrêt",
      description: "Le Service Marchés notifie officiellement au prestataire l'ordre d'arrêt des prestations",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 4,
      title: "Confirmation de l'Ordre d'arrêt",
      description: "Le Service Marchés confirme au Service Technique que l'ordre d'arrêt a été transmis",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 5,
      title: "Transmission de l'Ordre de reprise",
      description: "Une fois les problèmes résolus, le Service Marchés notifie l'ordre de reprise des travaux",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 6,
      title: "Confirmation de l'Ordre de reprise",
      description: "Le Service Marchés informe le Service Technique de la reprise effective des prestations",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 7,
      title: "Désignation de commission de réception",
      description: "Le Service Technique constitue et désigne la commission chargée de réceptionner les prestations",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 8,
      title: "Réception des prestations",
      description: "Le Service Technique procède à la réception des travaux et établit le procès-verbal de réception",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 9,
      title: "Constatation des manquements",
      description: "Le Service Marchés notifie au prestataire les défauts et non-conformités constatés",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 10,
      title: "Satisfaction des remarques",
      description: "Le prestataire corrige les défauts signalés et informe de la levée des réserves",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 11,
      title: "Demande de Saisir le prestataire pour satisfaire les remarques",
      description: "Le Service Marchés demande au Service Technique d'intervenir auprès du prestataire",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 12,
      title: "Saisir le prestataire pour Constatation des manquements",
      description: "Le Service Technique contacte directement le prestataire pour les corrections",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 13,
      title: "Élaboration de la lettre de Mise en Demeure",
      description: "Le Service Marchés rédige une mise en demeure formelle en cas de retard ou défaillance",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 14,
      title: "Répondre à la lettre de Mise en Demeure",
      description: "Le prestataire répond à la mise en demeure et propose un planning de rattrapage",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 15,
      title: "Demande de résiliation",
      description: "Le Service Technique demande la résiliation du marché en cas de défaillance grave",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 16,
      title: "Dépôt de Facture",
      description: "Le prestataire soumet ses factures pour les prestations réalisées",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 17,
      title: "Établissement de la note de calcul / Décompte Provisoire",
      description: "Le Service Marchés établit le décompte et demande vérification au Service Technique",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 18,
      title: "Certification des Facture",
      description: "Le Service Technique certifie la conformité des prestations facturées",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 19,
      title: "Réception Définitive",
      description: "Le Service Technique prononce la réception définitive après expiration du délai de garantie",
      actorRole: "ST"
    }
  ];

  // Phase 3: Traitement des Paiements (17 étapes)
  const phase3Steps = [
    {
      phase: 3,
      stepNumber: 1,
      title: "Transmission du Dossier de paiement",
      description: "Le Service Marchés transmet le dossier complet (factures, décomptes, certificats) au Service Ordonnancement",
      actorRole: "SM"
    },
    {
      phase: 3,
      stepNumber: 2,
      title: "Examen du Dossier de paiement",
      description: "Le Service Ordonnancement vérifie la conformité administrative et financière du dossier",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 3,
      title: "Retour du Dossier de paiement",
      description: "Le Service Ordonnancement retourne le dossier au Service Marchés avec ses observations",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 4,
      title: "Transmission des remarques SOR",
      description: "Le Service Ordonnancement transmet ses remarques techniques au Service Technique",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 5,
      title: "Satisfaction des remarques SOR",
      description: "Le Service Technique apporte les corrections demandées et retourne le dossier",
      actorRole: "ST"
    },
    {
      phase: 3,
      stepNumber: 6,
      title: "Satisfaction des Rejets SOR",
      description: "Le Service Marchés corrige les points rejetés et retransmet le dossier",
      actorRole: "SM"
    },
    {
      phase: 3,
      stepNumber: 7,
      title: "Vérification du Dossier de paiement",
      description: "Le Service Ordonnancement procède à une vérification finale du dossier corrigé",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 8,
      title: "Établissement OP/OV",
      description: "Le Service Ordonnancement établit l'Ordre de Paiement ou l'Ordre de Virement",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 9,
      title: "Transmission du Dossier de paiement au TP",
      description: "Le Service Ordonnancement transmet le dossier complet au Trésorier Payeur",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 10,
      title: "Rejet du Dossier de Paiement par le TP",
      description: "Le Trésorier Payeur rejette le dossier s'il constate des irrégularités",
      actorRole: "TP"
    },
    {
      phase: 3,
      stepNumber: 11,
      title: "Retour du Dossier de paiement par le TP",
      description: "Le Service Ordonnancement retourne le dossier rejeté au Service Marchés",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 12,
      title: "Transmission des remarques TP",
      description: "Le Trésorier Payeur communique ses observations au Service Technique",
      actorRole: "TP"
    },
    {
      phase: 3,
      stepNumber: 13,
      title: "Satisfaction des remarques TP",
      description: "Le Service Technique apporte les corrections demandées par le Trésorier",
      actorRole: "ST"
    },
    {
      phase: 3,
      stepNumber: 14,
      title: "Satisfaction des Rejets TP",
      description: "Le Service Marchés corrige les rejets et retransmet le dossier",
      actorRole: "SM"
    },
    {
      phase: 3,
      stepNumber: 15,
      title: "Validation du Dossier de paiement",
      description: "Le Service Ordonnancement valide définitivement le dossier de paiement",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 16,
      title: "Signature du Dossier de Paiement par l'Ordonnateur",
      description: "L'Ordonnateur signe le dossier et l'autorise pour paiement",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 17,
      title: "Signature du Dossier de Paiement par le TP",
      description: "Le Trésorier Payeur vise le dossier et procède au paiement effectif",
      actorRole: "TP"
    }
  ];

  // Insert all steps
  const allSteps = [...phase1Steps, ...phase2Steps, ...phase3Steps];
  
  for (const step of allSteps) {
    await db.insert(workflowSteps).values(step);
  }

  console.log(`Initialized ${allSteps.length} real workflow steps successfully!`);
}