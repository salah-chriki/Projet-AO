import { storage } from "./storage";

export async function seedExampleTenders() {
  // Check if tenders already exist
  const existingTenders = await storage.getAllTenders();
  if (existingTenders.length > 0) {
    console.log("Example tenders already exist, skipping seed");
    return;
  }

  const exampleTenders = [
    {
      title: "Construction d'un centre culturel municipal",
      description: "Conception et construction d'un centre culturel de 2000 m² comprenant une salle de spectacle de 400 places, des salles de répétition et des espaces d'exposition.",
      amount: "2850000",
      division: "DCPA",
      department: "DCPVOV",
      createdById: "admin1",
    },
    {
      title: "Rénovation énergétique de l'école primaire Jean Jaurès",
      description: "Travaux d'isolation thermique, remplacement du système de chauffage et installation de panneaux solaires pour l'école primaire de 15 classes.",
      amount: "450000",
      division: "DIL",
      department: "DIC",
      createdById: "admin1",
    },
    {
      title: "Aménagement de la place du marché",
      description: "Réaménagement complet de la place du marché avec création d'espaces verts, installation de mobilier urbain et réfection des voiries.",
      amount: "680000",
      division: "DPPAV",
      department: "DSA",
      createdById: "admin1",
    },
    {
      title: "Acquisition de véhicules électriques pour la flotte municipale",
      description: "Achat de 12 véhicules électriques et installation de 8 bornes de recharge pour renouveler la flotte municipale.",
      amount: "320000",
      division: "DIL",
      department: "DL",
      createdById: "admin1",
    },
    {
      title: "Système de gestion électronique des documents",
      description: "Mise en place d'un système de GED pour la dématérialisation des procédures administratives et l'archivage numérique.",
      amount: "185000",
      division: "DAF",
      department: "DSI",
      createdById: "admin1",
    },
    {
      title: "Construction d'une station d'épuration",
      description: "Conception et construction d'une station d'épuration de 5000 équivalents habitants avec système de traitement biologique avancé.",
      amount: "3200000",
      division: "DERAJ",
      department: "DERSP",
      createdById: "admin1",
    },
    {
      title: "Réfection de la voirie rue de la République",
      description: "Réfection complète de la chaussée, des trottoirs et des réseaux d'éclairage public sur 1,2 km de voirie urbaine.",
      amount: "580000",
      division: "DIL",
      department: "DIC",
      createdById: "admin1",
    },
    {
      title: "Fourniture de repas pour les cantines scolaires",
      description: "Marché de fourniture de 150000 repas par an pour les écoles primaires et maternelles de la commune, privilégiant les circuits courts.",
      amount: "750000",
      division: "DPPAV",
      department: "DCSP",
      createdById: "admin1",
    },
    {
      title: "Maintenance des espaces verts communaux",
      description: "Contrat d'entretien des parcs, jardins et espaces verts de la commune sur 4 ans, incluant la tonte, l'élagage et les plantations.",
      amount: "420000",
      division: "DPPAV",
      department: "DPV",
      createdById: "admin1",
    },
    {
      title: "Extension de la bibliothèque municipale",
      description: "Agrandissement de la bibliothèque municipale avec création d'un espace numérique, d'une section jeunesse et d'une salle de conférence.",
      amount: "890000",
      division: "DCPA",
      department: "DPPA",
      createdById: "admin1",
    },
  ];

  console.log("Creating example tenders...");
  
  for (const tenderData of exampleTenders) {
    try {
      const tender = await storage.createTender(tenderData as any);
      console.log(`Created tender: ${tender.reference}`);
      
      // Set different tenders to various workflow steps for demonstration
      const referenceNumber = tender.reference.split('-')[2];
      
      if (referenceNumber.endsWith('1') || referenceNumber.endsWith('2')) {
        // ST needs to take action - Step 4: Transmission des remarques CE
        await storage.updateTenderStep(tender.id, 4, "st1", new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
        await storage.createStepHistory({
          tenderId: tender.id,
          stepId: 1,
          actorId: "sm1",
          action: "approved",
          comments: "Dossier d'appel d'offres élaboré",
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        });
        await storage.createStepHistory({
          tenderId: tender.id,
          stepId: 2,
          actorId: "ce1",
          action: "approved",
          comments: "Examen de conformité effectué",
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        });
        await storage.createStepHistory({
          tenderId: tender.id,
          stepId: 3,
          actorId: "ce1",
          action: "approved",
          comments: "Remarques formulées",
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        });
      }
      
      if (referenceNumber.endsWith('3') || referenceNumber.endsWith('4')) {
        // CE needs to take action - Step 2: Étude et Envoi au CE
        await storage.updateTenderStep(tender.id, 2, "ce1", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        await storage.createStepHistory({
          tenderId: tender.id,
          stepId: 1,
          actorId: "sm1",
          action: "approved",
          comments: "Dossier transmis pour examen",
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        });
      }
      
      if (referenceNumber.endsWith('5') || referenceNumber.endsWith('6')) {
        // SB needs to take action - Step 18: Engagement du Marché
        await storage.updateTenderStep(tender.id, 18, "sb1", new Date(Date.now() + 2 * 24 * 60 * 60 * 1000));
        // Add previous steps as completed
        for (let i = 1; i <= 17; i++) {
          await storage.createStepHistory({
            tenderId: tender.id,
            stepId: i,
            actorId: i <= 10 ? "sm1" : "st1",
            action: "approved",
            comments: `Étape ${i} complétée`,
            completedAt: new Date(Date.now() - (18 - i) * 24 * 60 * 60 * 1000),
          });
        }
      }
      
      if (referenceNumber.endsWith('7') || referenceNumber.endsWith('8')) {
        // SOR needs to take action - Step 20: Notification du Marché
        await storage.updateTenderStep(tender.id, 20, "sor1", new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
        // Add previous steps as completed
        for (let i = 1; i <= 19; i++) {
          await storage.createStepHistory({
            tenderId: tender.id,
            stepId: i,
            actorId: i <= 10 ? "sm1" : (i <= 18 ? "st1" : "sb1"),
            action: "approved",
            comments: `Étape ${i} complétée`,
            completedAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000),
          });
        }
      }
      
      if (referenceNumber.endsWith('9') || referenceNumber.endsWith('0')) {
        // TP needs to take action - Step 25: Validation Finale du Paiement
        await storage.updateTenderStep(tender.id, 25, "tp1", new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
        // Add all previous steps as completed
        for (let i = 1; i <= 24; i++) {
          await storage.createStepHistory({
            tenderId: tender.id,
            stepId: i,
            actorId: i <= 10 ? "sm1" : (i <= 18 ? "st1" : (i <= 22 ? "sor1" : "sb1")),
            action: "approved",
            comments: `Étape ${i} complétée`,
            completedAt: new Date(Date.now() - (25 - i) * 24 * 60 * 60 * 1000),
          });
        }
      }
      
    } catch (error) {
      console.error(`Error creating tender: ${tenderData.title}`, error);
    }
  }
  
  console.log("Example tenders created successfully!");
}