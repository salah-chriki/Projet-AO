import { storage } from "./storage";

export async function createDiverseTenders() {
  console.log("Creating diverse example tenders at different workflow stages...");

  const tenderExamples = [
    {
      title: "Rénovation Système Informatique Municipal",
      description: "Modernisation complète de l'infrastructure IT de la mairie",
      budget: 250000,
      division: "DAF",
      department: "DSI",
      currentStep: 4,
      currentActorId: "st1",
      phase: 1
    },
    {
      title: "Construction Parking Public Centre-Ville",
      description: "Création d'un parking de 200 places avec bornes électriques",
      budget: 850000,
      division: "DPPAV",
      department: "DSA",
      currentStep: 2,
      currentActorId: "ce1",
      phase: 1
    },
    {
      title: "Fourniture Équipements Scolaires",
      description: "Achat de mobilier et matériel pédagogique pour 5 écoles",
      budget: 75000,
      division: "DCPA",
      department: "DCPA",
      currentStep: 18,
      currentActorId: "sb1",
      phase: 2
    },
    {
      title: "Réfection Voirie Quartier Résidentiel",
      description: "Travaux de réfection de 2km de voirie et trottoirs",
      budget: 450000,
      division: "DIL",
      department: "DIL",
      currentStep: 20,
      currentActorId: "sor1",
      phase: 2
    },
    {
      title: "Prestation Nettoyage Bâtiments Publics",
      description: "Contrat annuel de nettoyage pour 8 bâtiments municipaux",
      budget: 120000,
      division: "DCC",
      department: "DCC",
      currentStep: 25,
      currentActorId: "tp1",
      phase: 3
    },
    {
      title: "Acquisition Véhicules Services Techniques",
      description: "Achat de 3 camions bennes et 2 véhicules utilitaires",
      budget: 180000,
      division: "DCGAI",
      department: "DCGAI",
      currentStep: 6,
      currentActorId: "sm1",
      phase: 1
    },
    {
      title: "Aménagement Espaces Verts Parc Municipal",
      description: "Création d'aires de jeux et plantation d'arbres",
      budget: 95000,
      division: "DERAJ",
      department: "DERAJ",
      currentStep: 8,
      currentActorId: "st1",
      phase: 1
    },
    {
      title: "Maintenance Éclairage Public LED",
      description: "Remplacement et maintenance de 500 points lumineux",
      budget: 320000,
      division: "DIL",
      department: "DIL",
      currentStep: 12,
      currentActorId: "ce1",
      phase: 2
    }
  ];

  for (const example of tenderExamples) {
    try {
      // Create the tender
      const tender = await storage.createTender({
        title: example.title,
        description: example.description,
        budget: example.budget,
        division: example.division,
        department: example.department,
        currentPhase: example.phase,
        currentStep: example.currentStep,
        currentActorId: example.currentActorId,
        deadline: new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000),
        status: "in_progress"
      });

      console.log(`Created tender: ${tender.title} (Step ${example.currentStep}, Actor: ${example.currentActorId})`);

      // Add step history for completed steps
      for (let step = 1; step < example.currentStep; step++) {
        let actorId = "sm1"; // Default to SM for most steps
        
        // Assign appropriate actors based on step ranges
        if (step >= 2 && step <= 3) actorId = "ce1";
        else if (step >= 4 && step <= 10) actorId = "st1";
        else if (step >= 11 && step <= 17) actorId = "sm1";
        else if (step === 18) actorId = "sb1";
        else if (step >= 19 && step <= 22) actorId = "sor1";
        else if (step >= 23 && step <= 25) actorId = "tp1";

        await storage.createStepHistory({
          tenderId: tender.id,
          stepId: step,
          actorId: actorId,
          action: "approved",
          comments: `Étape ${step} validée`,
          completedAt: new Date(Date.now() - (example.currentStep - step) * 24 * 60 * 60 * 1000)
        });
      }

    } catch (error) {
      console.error(`Error creating tender: ${example.title}`, error);
    }
  }

  console.log("Diverse tender creation completed!");
}