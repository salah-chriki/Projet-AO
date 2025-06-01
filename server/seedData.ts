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
      createdById: "admin1",
    },
    {
      title: "Rénovation énergétique de l'école primaire Jean Jaurès",
      description: "Travaux d'isolation thermique, remplacement du système de chauffage et installation de panneaux solaires pour l'école primaire de 15 classes.",
      amount: "450000",
      createdById: "admin1",
    },
    {
      title: "Aménagement de la place du marché",
      description: "Réaménagement complet de la place du marché avec création d'espaces verts, installation de mobilier urbain et réfection des voiries.",
      amount: "680000",
      createdById: "admin1",
    },
    {
      title: "Acquisition de véhicules électriques pour la flotte municipale",
      description: "Achat de 12 véhicules électriques et installation de 8 bornes de recharge pour renouveler la flotte municipale.",
      amount: "320000",
      createdById: "admin1",
    },
    {
      title: "Système de gestion électronique des documents",
      description: "Mise en place d'un système de GED pour la dématérialisation des procédures administratives et l'archivage numérique.",
      amount: "185000",
      createdById: "admin1",
    },
    {
      title: "Construction d'une station d'épuration",
      description: "Conception et construction d'une station d'épuration de 5000 équivalents habitants avec système de traitement biologique avancé.",
      amount: "3200000",
      createdById: "admin1",
    },
    {
      title: "Réfection de la voirie rue de la République",
      description: "Réfection complète de la chaussée, des trottoirs et des réseaux d'éclairage public sur 1,2 km de voirie urbaine.",
      amount: "580000",
      createdById: "admin1",
    },
    {
      title: "Fourniture de repas pour les cantines scolaires",
      description: "Marché de fourniture de 150000 repas par an pour les écoles primaires et maternelles de la commune, privilégiant les circuits courts.",
      amount: "750000",
      createdById: "admin1",
    },
    {
      title: "Maintenance des espaces verts communaux",
      description: "Contrat d'entretien des parcs, jardins et espaces verts de la commune sur 4 ans, incluant la tonte, l'élagage et les plantations.",
      amount: "420000",
      createdById: "admin1",
    },
    {
      title: "Extension de la bibliothèque municipale",
      description: "Agrandissement de la bibliothèque municipale avec création d'un espace numérique, d'une section jeunesse et d'une salle de conférence.",
      amount: "890000",
      createdById: "admin1",
    },
  ];

  console.log("Creating example tenders...");
  
  for (const tenderData of exampleTenders) {
    try {
      const tender = await storage.createTender(tenderData as any);
      console.log(`Created tender: ${tender.reference}`);
      
      // Set some tenders to different phases and steps for demonstration
      if (tender.reference.includes("001") || tender.reference.includes("002")) {
        // Move to phase 2 (execution)
        await storage.updateTenderStep(tender.id, 5, "sm1", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        await storage.createStepHistory({
          tenderId: tender.id,
          stepId: 2,
          actorId: "st1",
          action: "approved",
          comments: "Dossier technique validé",
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        });
        await storage.createStepHistory({
          tenderId: tender.id,
          stepId: 3,
          actorId: "ce1",
          action: "approved",
          comments: "Conformité réglementaire validée",
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        });
      }
      
      if (tender.reference.includes("003")) {
        // Move to phase 3 (payment)
        await storage.updateTenderStep(tender.id, 2, "sor1", new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
        await storage.createStepHistory({
          tenderId: tender.id,
          stepId: 15,
          actorId: "st1",
          action: "approved",
          comments: "Travaux réceptionnés conformément au cahier des charges",
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        });
      }
      
      if (tender.reference.includes("004")) {
        // Keep in phase 1 but advance steps
        await storage.updateTenderStep(tender.id, 8, "st1", new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
        await storage.createStepHistory({
          tenderId: tender.id,
          stepId: 6,
          actorId: "ce1",
          action: "approved",
          comments: "Corrections apportées selon remarques",
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        });
      }
      
    } catch (error) {
      console.error(`Error creating tender: ${tenderData.title}`, error);
    }
  }
  
  console.log("Example tenders created successfully!");
}