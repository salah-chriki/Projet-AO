import { storage } from "./storage";

// IT Equipment Procurement Workflow Implementation
export async function createITEquipmentTender() {
  try {
    console.log("Creating IT Equipment procurement tender with detailed workflow...");

    // Create a specific IT equipment tender
    const itTender = await storage.createTender({
      reference: "AO-IT-2024-001",
      title: "Acquisition d'équipements informatiques - Direction des Systèmes d'Information",
      description: "Fourniture et installation de 50 ordinateurs portables, 10 imprimantes multifonctions, 5 serveurs de données et licences logicielles pour moderniser l'infrastructure informatique de la DSI",
      amount: "850000",
      direction: "DSI",
      division: "DSI",
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      createdById: "st1"
    });

    // Create detailed step history showing IT equipment workflow progression
    const workflowSteps = [
      {
        tenderId: itTender.id,
        stepNumber: 1,
        phase: 1,
        actorId: "st1",
        action: "started",
        comments: "Étape 1: Évaluation des besoins IT - Analyse des besoins en ordinateurs (50 portables), imprimantes (10 multifonctions), serveurs (5 unités) et logiciels",
        status: "completed"
      },
      {
        tenderId: itTender.id,
        stepNumber: 2,
        phase: 1,
        actorId: "st1",
        action: "in_progress",
        comments: "Étape 2: Consultation des utilisateurs - Collecte des besoins spécifiques auprès du département IT et des utilisateurs finaux",
        status: "in_progress"
      },
      {
        tenderId: itTender.id,
        stepNumber: 3,
        phase: 1,
        actorId: "st1",
        action: "pending",
        comments: "Étape 3: Spécifications techniques - Élaboration du cahier des charges technique (DAO) avec spécifications détaillées pour chaque équipement",
        status: "pending"
      }
    ];

    // Create step history entries
    for (const step of workflowSteps) {
      await storage.createStepHistory(step);
    }

    // Create initial comments showing stakeholder input
    await storage.createComment({
      tenderId: itTender.id,
      authorId: "st1",
      content: "Phase de préparation démarrée - Besoins identifiés:\n• 50 ordinateurs portables (Core i7, 16GB RAM, 512GB SSD)\n• 10 imprimantes multifonctions (A4/A3, recto-verso, réseau)\n• 5 serveurs (Dell PowerEdge ou équivalent)\n• Licences Microsoft Office 365 et antivirus",
      isPublic: true
    });

    await storage.createComment({
      tenderId: itTender.id,
      authorId: "admin1",
      content: "Workflow IT Equipment activé - 59 étapes planifiées selon la procédure des marchés publics. Coordination entre ST (spécifications), SM (procédure), CE (contrôle), SB (budget), SOR (ordonnancement) et TP (paiement).",
      isPublic: false
    });

    console.log(`Created IT Equipment tender: ${itTender.reference}`);
    return itTender;

  } catch (error) {
    console.error("Error creating IT equipment tender:", error);
    throw error;
  }
}

// Create detailed workflow step definitions for IT equipment procurement
export const itEquipmentWorkflowSteps = {
  phase1: {
    title: "Phase 1: Préparation et Publication",
    steps: [
      { step: 1, actor: "ST", title: "Évaluation des besoins", description: "Évaluer les besoins IT (ordinateurs, imprimantes, serveurs, logiciels)", duration: 2 },
      { step: 2, actor: "ST", title: "Consultation utilisateurs", description: "Consulter les utilisateurs finaux et le département IT", duration: 3 },
      { step: 3, actor: "ST", title: "Spécifications techniques", description: "Élaborer les spécifications techniques (DAO)", duration: 5 },
      { step: 4, actor: "ST", title: "Préparation documents", description: "Préparer les annexes techniques et plans", duration: 2 },
      { step: 5, actor: "ST", title: "Transmission vers SM", description: "Transmettre les spécifications complètes vers SM", duration: 1 },
      
      { step: 6, actor: "SM", title: "Documents administratifs", description: "Préparer les pièces administratives", duration: 2 },
      { step: 7, actor: "SM", title: "Clauses spéciales", description: "Rédiger le CPS (Cahier des Prescriptions Spéciales)", duration: 3 },
      { step: 8, actor: "SM", title: "Clauses générales", description: "Inclure le CCAG-Fournitures", duration: 1 },
      { step: 9, actor: "SM", title: "Estimation budgétaire", description: "Déterminer le budget estimé", duration: 2 },
      { step: 10, actor: "SM", title: "Méthode d'achat", description: "Choisir la méthode de passation", duration: 1 },
      
      { step: 11, actor: "CE", title: "Contrôle réglementaire", description: "Examiner la conformité réglementaire", duration: 3 },
      { step: 12, actor: "CE", title: "Vérification budgétaire", description: "Vérifier l'adéquation budgétaire", duration: 2 },
      { step: 13, actor: "CE", title: "Alignement technique", description: "Revoir l'alignement des spécifications techniques", duration: 2 },
      { step: 14, actor: "CE", title: "Recommandations", description: "Formuler des recommandations", duration: 1 },
      { step: 15, actor: "CE", title: "Décision validation", description: "Approuver ou demander modifications", duration: 1 },
      
      { step: 16, actor: "SB", title: "Vérification disponibilité", description: "Vérifier la disponibilité budgétaire", duration: 2 },
      { step: 17, actor: "SB", title: "Engagement crédits", description: "Engager les crédits nécessaires", duration: 2 },
      { step: 18, actor: "SB", title: "Validation financière", description: "Valider le cadre financier", duration: 1 },
      { step: 19, actor: "SB", title: "Notification engagement", description: "Notifier l'engagement budgétaire", duration: 1 },
      { step: 20, actor: "SB", title: "Retour vers SM", description: "Transmettre le dossier validé", duration: 1 },
      
      { step: 21, actor: "SM", title: "Publication portail", description: "Publier sur marchespublics.gov.ma", duration: 1 },
      { step: 22, actor: "SM", title: "Publication légale", description: "Publication dans les journaux", duration: 2 },
      { step: 23, actor: "SM", title: "Distribution documents", description: "Mettre les documents à disposition", duration: 1 }
    ]
  },
  
  phase2: {
    title: "Phase 2: Exécution et Contrôle",
    steps: [
      { step: 24, actor: "SM", title: "Réception des offres", description: "Recevoir les plis (électronique/physique)", duration: 1 },
      { step: 25, actor: "SM", title: "Organisation commission", description: "Organiser la séance d'ouverture publique", duration: 1 },
      { step: 26, actor: "SM", title: "Coordination commission", description: "Coordonner la commission des marchés", duration: 1 },
      { step: 27, actor: "SM", title: "Ouverture séquentielle", description: "Ouverture: administratif → technique → financier", duration: 2 },
      { step: 28, actor: "SM", title: "Vérification documents", description: "Vérifier les documents requis", duration: 1 },
      
      { step: 29, actor: "SM", title: "Contrôle éligibilité", description: "Vérifier l'éligibilité des soumissionnaires", duration: 3 },
      { step: 30, actor: "ST", title: "Évaluation technique", description: "Évaluer la conformité technique des équipements", duration: 5 },
      { step: 31, actor: "CE", title: "Validation conformité", description: "Valider la conformité légale", duration: 2 },
      { step: 32, actor: "SM", title: "Analyse comparative", description: "Analyser et comparer les offres", duration: 3 },
      { step: 33, actor: "SM", title: "Classement", description: "Classer les soumissionnaires", duration: 2 },
      
      { step: 34, actor: "SM", title: "PV délibération", description: "Élaborer le PV de délibération", duration: 2 },
      { step: 35, actor: "CE", title: "Validation attribution", description: "Valider l'attribution", duration: 2 },
      { step: 36, actor: "SB", title: "Vérification finale", description: "Vérification budgétaire finale", duration: 1 },
      { step: 37, actor: "ADMIN", title: "Approbation", description: "Approbation officielle du marché", duration: 2 },
      { step: 38, actor: "SM", title: "Signature", description: "Signature du marché", duration: 1 },
      
      { step: 39, actor: "SM", title: "Notification", description: "Notification officielle au titulaire", duration: 1 },
      { step: 40, actor: "SM", title: "Caution définitive", description: "Réception de la caution définitive", duration: 2 },
      { step: 41, actor: "SM", title: "Ordre de service", description: "Émission ordre de service", duration: 1 },
      { step: 42, actor: "ST", title: "Démarrage", description: "Démarrage effectif des prestations", duration: 1 }
    ]
  },
  
  phase3: {
    title: "Phase 3: Traitement des Paiements",
    steps: [
      { step: 43, actor: "ST", title: "Commission réception", description: "Constituer la commission de réception", duration: 1 },
      { step: 44, actor: "ST", title: "Vérification conformité", description: "Vérifier la conformité des équipements", duration: 3 },
      { step: 45, actor: "ST", title: "Tests équipements", description: "Tester la fonctionnalité des équipements", duration: 2 },
      { step: 46, actor: "ST", title: "PV réception", description: "Établir le PV de réception", duration: 1 },
      { step: 47, actor: "ST", title: "Transmission SM", description: "Transmettre le PV vers SM", duration: 1 },
      
      { step: 48, actor: "SM", title: "Certification factures", description: "Certifier les factures", duration: 1 },
      { step: 49, actor: "SM", title: "Dossier paiement", description: "Constituer le dossier de paiement", duration: 2 },
      { step: 50, actor: "SM", title: "Vérification administrative", description: "Vérifier administrativement", duration: 1 },
      { step: 51, actor: "SM", title: "Calcul montants", description: "Calculer les montants à payer", duration: 1 },
      { step: 52, actor: "SM", title: "Transmission SOR", description: "Transmettre vers SOR", duration: 1 },
      
      { step: 53, actor: "SOR", title: "Vérification dossier", description: "Vérifier le dossier de paiement", duration: 2 },
      { step: 54, actor: "SOR", title: "Contrôle pièces", description: "Contrôler les pièces justificatives", duration: 1 },
      { step: 55, actor: "SOR", title: "Ordre paiement", description: "Établir l'ordre de paiement", duration: 1 },
      { step: 56, actor: "SOR", title: "Transmission TP", description: "Transmettre vers TP", duration: 1 },
      
      { step: 57, actor: "TP", title: "Contrôle final", description: "Contrôle final des paiements", duration: 2 },
      { step: 58, actor: "TP", title: "Validation ordres", description: "Valider les ordres de paiement", duration: 1 },
      { step: 59, actor: "TP", title: "Décaissement", description: "Décaissement effectif des fonds", duration: 1 }
    ]
  }
};

// Status indicators for the workflow dashboard
export const workflowStatusIndicators = {
  "en_cours": { color: "green", label: "🟢 En cours" },
  "en_attente": { color: "orange", label: "🟠 En attente" },
  "transmitted": { color: "blue", label: "✅ Transmis" },
  "validated": { color: "green", label: "✅ Validé" },
  "corrections_required": { color: "red", label: "🔴 Corrections requises" },
  "budget_committed": { color: "green", label: "✅ Budget engagé" },
  "published": { color: "blue", label: "🔵 Publié" },
  "bids_received": { color: "purple", label: "🟣 Offres reçues" },
  "evaluation_complete": { color: "green", label: "✅ Évaluation terminée" },
  "contract_signed": { color: "green", label: "✅ Contrat signé" },
  "provisionally_accepted": { color: "orange", label: "🟠 Accepté provisoirement" },
  "payment_processing": { color: "orange", label: "🟠 Paiement en cours" },
  "completed": { color: "green", label: "✅ Terminé" }
};