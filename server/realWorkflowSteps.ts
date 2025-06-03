import { db } from "./db";
import { workflowSteps } from "@shared/schema";

export async function initializeRealWorkflowSteps() {
  console.log("Initializing real workflow steps...");
  
  // Check if we already have the real workflow steps
  const existingSteps = await db.select().from(workflowSteps);
  if (existingSteps.length >= 50) {
    console.log("Real workflow steps already initialized");
    return;
  }
  
  // Clear existing workflow steps to rebuild with correct structure
  await db.delete(workflowSteps);

  // Phase 1: Préparation et Publication de l'Appel d'Offres (23 steps)
  const phase1Steps = [
    {
      phase: 1,
      stepNumber: 1,
      title: "DAO Envoyé par ST",
      description: "Le Service Technique élabore et envoie le Dossier d'Appel d'Offres",
      actorRole: "ST"
    },
    {
      phase: 1,
      stepNumber: 2,
      title: "DAO Étudié et Envoyé au CE",
      description: "Le Service Marchés étudie le dossier et l'envoie au Contrôle d'État",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 3,
      title: "DAO Revue par CE",
      description: "Le Contrôle d'État revoit le dossier d'appel d'offres",
      actorRole: "CE"
    },
    {
      phase: 1,
      stepNumber: 4,
      title: "Transmission des remarques CE",
      description: "Le Contrôle d'État transmet ses remarques au Service Technique",
      actorRole: "CE"
    },
    {
      phase: 1,
      stepNumber: 5,
      title: "Satisfaction des remarques CE",
      description: "Le Service Technique satisfait les remarques du Contrôle d'État",
      actorRole: "ST"
    },
    {
      phase: 1,
      stepNumber: 6,
      title: "DAO Vérifié et Envoyé au CE",
      description: "Le Service Marchés vérifie et envoie le DAO au Contrôle d'État",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 7,
      title: "DAO Validé par CE",
      description: "Le Contrôle d'État valide le dossier d'appel d'offres",
      actorRole: "CE"
    },
    {
      phase: 1,
      stepNumber: 8,
      title: "DAO est Transmis à la commission d'AO",
      description: "Le dossier est transmis à la commission d'appel d'offres",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 9,
      title: "Signature du DAO",
      description: "Signature officielle du dossier d'appel d'offres",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 10,
      title: "Projet AO publié",
      description: "Publication du projet d'appel d'offres",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 11,
      title: "Ouverture des plis",
      description: "Ouverture des plis des candidatures",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 12,
      title: "Jugement Définitif",
      description: "Jugement définitif des offres",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 13,
      title: "Information de l'attributaire",
      description: "Information du prestataire attributaire",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 14,
      title: "Établissement du Marché",
      description: "Établissement du contrat de marché",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 15,
      title: "Signature du Marché par La Direction Technique",
      description: "Signature du marché par la direction technique",
      actorRole: "ST"
    },
    {
      phase: 1,
      stepNumber: 16,
      title: "Remise du Marché au Prestataire",
      description: "Remise du marché signé au prestataire",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 17,
      title: "Transmission du Marché pour Engagement",
      description: "Transmission du marché pour engagement budgétaire",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 18,
      title: "Engagement du Marché",
      description: "Engagement budgétaire du marché",
      actorRole: "SB"
    },
    {
      phase: 1,
      stepNumber: 19,
      title: "Approbation du Marché",
      description: "Approbation finale du marché",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 20,
      title: "Visa du Marché",
      description: "Visa officiel du marché",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 21,
      title: "Notification de l'approbation du marché au titulaire",
      description: "Notification de l'approbation au titulaire du marché",
      actorRole: "SM"
    },
    {
      phase: 1,
      stepNumber: 22,
      title: "Dépôt de la caution définitive",
      description: "Le prestataire dépose la caution définitive",
      actorRole: "PRESTATAIRE"
    },
    {
      phase: 1,
      stepNumber: 23,
      title: "Élaboration de l'Ordre de Service",
      description: "Élaboration de l'ordre de service pour démarrage",
      actorRole: "SM"
    }
  ];

  // Phase 2: Exécution du Marché (19 steps)
  const phase2Steps = [
    {
      phase: 2,
      stepNumber: 1,
      title: "Information de la notification OS",
      description: "Information de la notification de l'Ordre de Service",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 2,
      title: "Demande de suspendre l'exécution des prestations",
      description: "Le Service Technique demande la suspension de l'exécution",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 3,
      title: "Transmission de l'Ordre d'arrêt",
      description: "Transmission de l'ordre d'arrêt au prestataire",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 4,
      title: "Transmission de l'Ordre d'arrêt",
      description: "Le prestataire reçoit l'ordre d'arrêt",
      actorRole: "PRESTATAIRE"
    },
    {
      phase: 2,
      stepNumber: 5,
      title: "Transmission de l'Ordre de reprise",
      description: "Transmission de l'ordre de reprise des travaux",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 6,
      title: "Transmission de l'Ordre de reprise",
      description: "Le prestataire reçoit l'ordre de reprise",
      actorRole: "PRESTATAIRE"
    },
    {
      phase: 2,
      stepNumber: 7,
      title: "Désignation de commission de réception",
      description: "Désignation de la commission de réception",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 8,
      title: "Réception des prestations",
      description: "Réception des prestations par la commission",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 9,
      title: "Constatation des manquements",
      description: "Constatation des manquements par le prestataire",
      actorRole: "PRESTATAIRE"
    },
    {
      phase: 2,
      stepNumber: 10,
      title: "Satisfaction des remarques",
      description: "Satisfaction des remarques du prestataire",
      actorRole: "PRESTATAIRE"
    },
    {
      phase: 2,
      stepNumber: 11,
      title: "Demande de Saisir le prestataire pour satisfaire les remarques",
      description: "Demande de saisir le prestataire pour corrections",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 12,
      title: "Saisir le prestataire pour Constatation des manquements",
      description: "Saisie du prestataire pour constatation des défauts",
      actorRole: "PRESTATAIRE"
    },
    {
      phase: 2,
      stepNumber: 13,
      title: "Élaboration de la lettre de Mise en Demeure",
      description: "Élaboration de la lettre de mise en demeure",
      actorRole: "SM"
    },
    {
      phase: 2,
      stepNumber: 14,
      title: "Répondre à la lettre de Mise en Demeure",
      description: "Réponse du prestataire à la mise en demeure",
      actorRole: "PRESTATAIRE"
    },
    {
      phase: 2,
      stepNumber: 15,
      title: "Demande de résiliation",
      description: "Demande de résiliation du marché",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 16,
      title: "Dépôt de Facture",
      description: "Le prestataire dépose sa facture",
      actorRole: "PRESTATAIRE"
    },
    {
      phase: 2,
      stepNumber: 17,
      title: "Établissement de la note de calcul / Décompte Provisoire",
      description: "Établissement du décompte provisoire",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 18,
      title: "Certification des Facture",
      description: "Certification des factures par le Service Technique",
      actorRole: "ST"
    },
    {
      phase: 2,
      stepNumber: 19,
      title: "Réception Définitive",
      description: "Réception définitive des prestations",
      actorRole: "ST"
    }
  ];

  // Phase 3: Paiement (17 steps)
  const phase3Steps = [
    {
      phase: 3,
      stepNumber: 1,
      title: "Transmission du Dossier de paiement",
      description: "Transmission du dossier de paiement au Service Ordonnancement",
      actorRole: "SM"
    },
    {
      phase: 3,
      stepNumber: 2,
      title: "Examen du Dossier de paiement",
      description: "Examen du dossier de paiement par le SOR",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 3,
      title: "Retour du Dossier de paiement",
      description: "Retour du dossier de paiement avec observations",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 4,
      title: "Transmission des remarques SOR",
      description: "Transmission des remarques SOR au Service Technique",
      actorRole: "SM"
    },
    {
      phase: 3,
      stepNumber: 5,
      title: "Satisfaction des remarques SOR",
      description: "Satisfaction des remarques du Service Ordonnancement",
      actorRole: "ST"
    },
    {
      phase: 3,
      stepNumber: 6,
      title: "Satisfaction des Rejets SOR",
      description: "Traitement des rejets du Service Ordonnancement",
      actorRole: "SM"
    },
    {
      phase: 3,
      stepNumber: 7,
      title: "Vérification du Dossier de paiement",
      description: "Vérification finale du dossier de paiement",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 8,
      title: "Établissement OP/OV",
      description: "Établissement de l'Ordre de Paiement/Ordre de Virement",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 9,
      title: "Transmission du Dossier de paiement",
      description: "Transmission du dossier au Trésor Public",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 10,
      title: "Rejet du Dossier de Paiement par le TP",
      description: "Rejet du dossier par le Trésor Public",
      actorRole: "TP"
    },
    {
      phase: 3,
      stepNumber: 11,
      title: "Retour du Dossier de paiement par le TP",
      description: "Retour du dossier de paiement par le TP",
      actorRole: "TP"
    },
    {
      phase: 3,
      stepNumber: 12,
      title: "Transmission des remarques TP",
      description: "Transmission des remarques du Trésor Public",
      actorRole: "SM"
    },
    {
      phase: 3,
      stepNumber: 13,
      title: "Satisfaction des remarques TP",
      description: "Satisfaction des remarques du Trésor Public",
      actorRole: "ST"
    },
    {
      phase: 3,
      stepNumber: 14,
      title: "Satisfaction des Rejets TP",
      description: "Traitement des rejets du Trésor Public",
      actorRole: "SM"
    },
    {
      phase: 3,
      stepNumber: 15,
      title: "Validation du Dossier de paiement",
      description: "Validation finale du dossier de paiement",
      actorRole: "TP"
    },
    {
      phase: 3,
      stepNumber: 16,
      title: "Signature du Dossier de Paiement par l'ordonnateur",
      description: "Signature par l'ordonnateur",
      actorRole: "SOR"
    },
    {
      phase: 3,
      stepNumber: 17,
      title: "Signature du Dossier de Paiement par le TP",
      description: "Signature finale par le Trésor Public",
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