import { storage } from "./storage";

// Detailed workflow structure based on the provided document
export async function initializeDetailedWorkflow() {
  try {
    console.log("Initializing detailed 59-step workflow...");

    // Phase 1: Preparation and Publication (23 steps)
    const phase1Steps = [
      // Steps 1-5: Technical Preparation
      { stepNumber: 1, phase: 1, actor: "st", title: "Identification des besoins", description: "Identification et évaluation des besoins techniques", estimatedDuration: 2 },
      { stepNumber: 2, phase: 1, actor: "st", title: "Élaboration du cahier des charges", description: "Élaboration du cahier des charges techniques détaillé", estimatedDuration: 5 },
      { stepNumber: 3, phase: 1, actor: "st", title: "Préparation du DAO", description: "Préparation du Dossier d'Appel d'Offres", estimatedDuration: 3 },
      { stepNumber: 4, phase: 1, actor: "st", title: "Constitution des annexes", description: "Constitution des annexes techniques", estimatedDuration: 2 },
      { stepNumber: 5, phase: 1, actor: "st", title: "Transmission vers SM", description: "Transmission du dossier vers le Service Marchés", estimatedDuration: 1 },

      // Steps 6-10: Administrative Validation
      { stepNumber: 6, phase: 1, actor: "sm", title: "Vérification conformité", description: "Vérification de la conformité administrative", estimatedDuration: 2 },
      { stepNumber: 7, phase: 1, actor: "sm", title: "Compilation du dossier", description: "Compilation du dossier complet", estimatedDuration: 2 },
      { stepNumber: 8, phase: 1, actor: "sm", title: "Pièces administratives", description: "Préparation des pièces administratives", estimatedDuration: 3 },
      { stepNumber: 9, phase: 1, actor: "sm", title: "Estimation budgétaire", description: "Estimation budgétaire préliminaire", estimatedDuration: 2 },
      { stepNumber: 10, phase: 1, actor: "sm", title: "Transmission vers CE", description: "Transmission vers le Contrôle d'État", estimatedDuration: 1 },

      // Steps 11-15: Regulatory Control
      { stepNumber: 11, phase: 1, actor: "ce", title: "Contrôle réglementaire", description: "Examen de la conformité réglementaire", estimatedDuration: 3 },
      { stepNumber: 12, phase: 1, actor: "ce", title: "Vérification budgétaire", description: "Vérification de l'adéquation budgétaire", estimatedDuration: 2 },
      { stepNumber: 13, phase: 1, actor: "ce", title: "Contrôle procédures", description: "Contrôle des procédures", estimatedDuration: 2 },
      { stepNumber: 14, phase: 1, actor: "ce", title: "Validation ou corrections", description: "Validation finale ou demande de corrections", estimatedDuration: 1 },
      { stepNumber: 15, phase: 1, actor: "ce", title: "Transmission vers SB", description: "Transmission vers le Service Budgétaire", estimatedDuration: 1 },

      // Steps 16-20: Budget Commitment
      { stepNumber: 16, phase: 1, actor: "sb", title: "Vérification disponibilité", description: "Vérification de la disponibilité budgétaire", estimatedDuration: 2 },
      { stepNumber: 17, phase: 1, actor: "sb", title: "Engagement crédits", description: "Engagement des crédits budgétaires", estimatedDuration: 2 },
      { stepNumber: 18, phase: 1, actor: "sb", title: "Validation financière", description: "Validation financière finale", estimatedDuration: 1 },
      { stepNumber: 19, phase: 1, actor: "sb", title: "Notification engagement", description: "Notification de l'engagement budgétaire", estimatedDuration: 1 },
      { stepNumber: 20, phase: 1, actor: "sb", title: "Retour vers SM", description: "Transmission du dossier validé vers SM", estimatedDuration: 1 },

      // Steps 21-23: Publication
      { stepNumber: 21, phase: 1, actor: "sm", title: "Publication portail", description: "Publication sur le portail des marchés publics", estimatedDuration: 1 },
      { stepNumber: 22, phase: 1, actor: "sm", title: "Publication presse", description: "Publication dans la presse spécialisée si requis", estimatedDuration: 2 },
      { stepNumber: 23, phase: 1, actor: "sm", title: "Mise à disposition DAO", description: "Mise à disposition du dossier d'appel d'offres", estimatedDuration: 1 }
    ];

    // Phase 2: Execution and Control (19 steps)
    const phase2Steps = [
      // Steps 24-28: Reception and Opening of Offers
      { stepNumber: 24, phase: 2, actor: "sm", title: "Réception des plis", description: "Réception des plis dans les délais", estimatedDuration: 1 },
      { stepNumber: 25, phase: 2, actor: "sm", title: "Organisation séance ouverture", description: "Organisation de la séance d'ouverture publique", estimatedDuration: 1 },
      { stepNumber: 26, phase: 2, actor: "sm", title: "Commission d'ouverture", description: "Constitution de la commission d'ouverture", estimatedDuration: 1 },
      { stepNumber: 27, phase: 2, actor: "sm", title: "Ouverture séquentielle", description: "Ouverture séquentielle (administratif → technique → financier)", estimatedDuration: 2 },
      { stepNumber: 28, phase: 2, actor: "sm", title: "PV d'ouverture", description: "Établissement du PV d'ouverture", estimatedDuration: 1 },

      // Steps 29-33: Offer Evaluation
      { stepNumber: 29, phase: 2, actor: "sm", title: "Examen administratif", description: "Examen administratif des offres", estimatedDuration: 3 },
      { stepNumber: 30, phase: 2, actor: "st", title: "Évaluation technique", description: "Évaluation technique et conformité", estimatedDuration: 5 },
      { stepNumber: 31, phase: 2, actor: "ce", title: "Contrôle évaluation", description: "Contrôle de la procédure d'évaluation", estimatedDuration: 2 },
      { stepNumber: 32, phase: 2, actor: "sm", title: "Analyse comparative", description: "Analyse comparative des offres", estimatedDuration: 3 },
      { stepNumber: 33, phase: 2, actor: "sm", title: "Classement soumissionnaires", description: "Classement des soumissionnaires", estimatedDuration: 2 },

      // Steps 34-38: Attribution and Approval
      { stepNumber: 34, phase: 2, actor: "sm", title: "PV de délibération", description: "Élaboration du PV de délibération", estimatedDuration: 2 },
      { stepNumber: 35, phase: 2, actor: "ce", title: "Validation attribution", description: "Validation de l'attribution par CE", estimatedDuration: 2 },
      { stepNumber: 36, phase: 2, actor: "sb", title: "Vérification budgétaire finale", description: "Vérification budgétaire finale", estimatedDuration: 1 },
      { stepNumber: 37, phase: 2, actor: "admin", title: "Approbation marché", description: "Approbation officielle du marché", estimatedDuration: 2 },
      { stepNumber: 38, phase: 2, actor: "sm", title: "Signature marché", description: "Signature du marché", estimatedDuration: 1 },

      // Steps 39-42: Notification and Start
      { stepNumber: 39, phase: 2, actor: "sm", title: "Notification titulaire", description: "Notification officielle au titulaire", estimatedDuration: 1 },
      { stepNumber: 40, phase: 2, actor: "sm", title: "Réception caution", description: "Réception de la caution définitive", estimatedDuration: 2 },
      { stepNumber: 41, phase: 2, actor: "sm", title: "Ordre de service", description: "Émission de l'ordre de service de commencer", estimatedDuration: 1 },
      { stepNumber: 42, phase: 2, actor: "st", title: "Démarrage prestations", description: "Démarrage effectif des prestations", estimatedDuration: 1 }
    ];

    // Phase 3: Payment Processing (17 steps)
    const phase3Steps = [
      // Steps 43-47: Reception and Control
      { stepNumber: 43, phase: 3, actor: "st", title: "Commission réception", description: "Constitution de la commission de réception", estimatedDuration: 1 },
      { stepNumber: 44, phase: 3, actor: "st", title: "Vérification conformité", description: "Vérification de la conformité des livraisons", estimatedDuration: 3 },
      { stepNumber: 45, phase: 3, actor: "st", title: "Contrôle qualité", description: "Contrôle qualité des prestations", estimatedDuration: 2 },
      { stepNumber: 46, phase: 3, actor: "st", title: "PV de réception", description: "Établissement du procès-verbal de réception", estimatedDuration: 1 },
      { stepNumber: 47, phase: 3, actor: "st", title: "Transmission vers SM", description: "Transmission du PV vers le Service Marchés", estimatedDuration: 1 },

      // Steps 48-52: Payment File Preparation
      { stepNumber: 48, phase: 3, actor: "sm", title: "Certification factures", description: "Certification des factures", estimatedDuration: 1 },
      { stepNumber: 49, phase: 3, actor: "sm", title: "Dossier de paiement", description: "Constitution du dossier de paiement", estimatedDuration: 2 },
      { stepNumber: 50, phase: 3, actor: "sm", title: "Vérification administrative", description: "Vérification administrative du dossier", estimatedDuration: 1 },
      { stepNumber: 51, phase: 3, actor: "sm", title: "Calcul montants", description: "Calcul des montants à payer", estimatedDuration: 1 },
      { stepNumber: 52, phase: 3, actor: "sm", title: "Transmission SOR", description: "Transmission vers le Service Ordonnancement", estimatedDuration: 1 },

      // Steps 53-56: Ordering
      { stepNumber: 53, phase: 3, actor: "sor", title: "Vérification dossier", description: "Vérification du dossier de paiement", estimatedDuration: 2 },
      { stepNumber: 54, phase: 3, actor: "sor", title: "Contrôle pièces", description: "Contrôle des pièces justificatives", estimatedDuration: 1 },
      { stepNumber: 55, phase: 3, actor: "sor", title: "Ordre de paiement", description: "Établissement de l'ordre de paiement", estimatedDuration: 1 },
      { stepNumber: 56, phase: 3, actor: "sor", title: "Transmission TP", description: "Transmission vers le Trésorier Payeur", estimatedDuration: 1 },

      // Steps 57-59: Final Payment
      { stepNumber: 57, phase: 3, actor: "tp", title: "Contrôle final", description: "Contrôle final des paiements", estimatedDuration: 2 },
      { stepNumber: 58, phase: 3, actor: "tp", title: "Validation ordres", description: "Validation des ordres de paiement", estimatedDuration: 1 },
      { stepNumber: 59, phase: 3, actor: "tp", title: "Décaissement", description: "Décaissement effectif des fonds", estimatedDuration: 1 }
    ];

    // Combine all steps
    const allSteps = [...phase1Steps, ...phase2Steps, ...phase3Steps];

    // Check if steps already exist
    const existingSteps = await storage.getWorkflowSteps();
    if (existingSteps.length >= 59) {
      console.log("Detailed workflow steps already exist");
      return;
    }

    // Create all workflow steps
    const { db } = await import("./db");
    const { workflowSteps } = await import("@shared/schema");
    
    for (const step of allSteps) {
      await db.insert(workflowSteps).values({
        phase: step.phase,
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
        actorRole: step.actor.toUpperCase(),
        estimatedDuration: step.estimatedDuration,
        maxDuration: step.estimatedDuration * 2, // Allow double the estimated time
        isInternal: step.actor === "admin" // Admin steps are internal
      }).onConflictDoNothing();
    }

    console.log("Successfully initialized detailed 59-step workflow!");

  } catch (error) {
    console.error("Error initializing detailed workflow:", error);
  }
}

// Actor role mappings for the detailed workflow
export const detailedActorRoles = {
  "st": "Service Technique", // Technical Service
  "sm": "Service Marchés", // Markets Service  
  "ce": "Contrôle d'État", // State Control
  "sb": "Service Budgétaire", // Budget Service
  "sor": "Service Ordonnancement", // Ordering Service
  "tp": "Trésorier Payeur", // Treasurer Payer
  "admin": "Administrateur" // Administrator
};

// Priority levels based on deadlines
export const priorityLevels = {
  urgent: { days: 1, color: "red", notification: "immediate" },
  important: { days: 3, color: "orange", notification: "daily" },
  normal: { days: 7, color: "green", notification: "weekly" }
};

// Workflow actions available at each step
export const workflowActions = {
  approve: "Approuver et transmettre",
  reject: "Rejeter avec commentaires", 
  requestModifications: "Demander des modifications",
  suspend: "Suspendre temporairement"
};