
import { storage } from "./storage";
import { db } from "./db";
import { workflowSteps } from "@shared/schema";

export async function initializeONSSAWorkflow() {
  try {
    console.log("Initializing ONSSA workflow management process...");

    // Check if ONSSA workflow already exists
    const existingSteps = await db.select().from(workflowSteps).where(eq(workflowSteps.title, 'ONSSA Process'));
    if (existingSteps.length > 0) {
      console.log("ONSSA workflow already initialized");
      return;
    }

    // Define ONSSA workflow steps based on the mermaid diagram
    const onssaSteps = [
      // Phase 1: Tender Initiation
      {
        phase: 1,
        stepNumber: 1,
        title: "ST: Create DAO",
        description: "Service Technique creates Dossier d'Appel d'Offres",
        actorRole: "ST",
        estimatedDuration: 3,
        maxDuration: 5
      },
      {
        phase: 1,
        stepNumber: 2,
        title: "SM: Receive DAO",
        description: "Service Marchés receives the DAO from ST",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 2
      },

      // Phase 2: Tender Review
      {
        phase: 2,
        stepNumber: 3,
        title: "SM: Forward DAO to CE",
        description: "Service Marchés forwards DAO to Contrôle d'État",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 1
      },
      {
        phase: 2,
        stepNumber: 4,
        title: "CE: Review DAO",
        description: "Contrôle d'État reviews the DAO for compliance",
        actorRole: "CE",
        estimatedDuration: 3,
        maxDuration: 5
      },
      {
        phase: 2,
        stepNumber: 5,
        title: "CE: Log remarks",
        description: "CE logs remarks if any issues found",
        actorRole: "CE",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 2,
        stepNumber: 6,
        title: "SM: Update DAO",
        description: "SM updates DAO based on CE remarks",
        actorRole: "SM",
        estimatedDuration: 2,
        maxDuration: 3
      },
      {
        phase: 2,
        stepNumber: 7,
        title: "CE: Validate DAO",
        description: "CE validates the updated DAO",
        actorRole: "CE",
        estimatedDuration: 2,
        maxDuration: 3
      },
      {
        phase: 2,
        stepNumber: 8,
        title: "SM: Submit to Commission",
        description: "SM submits validated DAO to Commission",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 1
      },

      // Phase 3: Contract Award
      {
        phase: 3,
        stepNumber: 9,
        title: "SM: Transmit to Commission",
        description: "SM transmits tender to Commission for bidding process",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 3,
        stepNumber: 10,
        title: "Commission: Manage bidding",
        description: "Commission manages the bidding process",
        actorRole: "COMMISSION",
        estimatedDuration: 15,
        maxDuration: 30
      },
      {
        phase: 3,
        stepNumber: 11,
        title: "Commission: Select Prestataire",
        description: "Commission selects the winning contractor",
        actorRole: "COMMISSION",
        estimatedDuration: 3,
        maxDuration: 5
      },
      {
        phase: 3,
        stepNumber: 12,
        title: "SM: Draft contract",
        description: "SM drafts the contract with selected prestataire",
        actorRole: "SM",
        estimatedDuration: 3,
        maxDuration: 5
      },
      {
        phase: 3,
        stepNumber: 13,
        title: "Direction: Sign contract",
        description: "Direction signs the contract",
        actorRole: "DIRECTION",
        estimatedDuration: 2,
        maxDuration: 3
      },
      {
        phase: 3,
        stepNumber: 14,
        title: "SM: Inform Prestataire",
        description: "SM informs prestataire of contract signature",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 1
      },

      // Phase 4: Contract Engagement
      {
        phase: 4,
        stepNumber: 15,
        title: "SM: Transmit to Prestataire",
        description: "SM transmits contract to prestataire for approval",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 4,
        stepNumber: 16,
        title: "Prestataire: Approve contract",
        description: "Prestataire approves the contract terms",
        actorRole: "PRESTATAIRE",
        estimatedDuration: 5,
        maxDuration: 10
      },
      {
        phase: 4,
        stepNumber: 17,
        title: "SB: Engage contract",
        description: "Service Budgétaire engages the contract financially",
        actorRole: "SB",
        estimatedDuration: 2,
        maxDuration: 3
      },

      // Phase 5: Payment Dossier
      {
        phase: 5,
        stepNumber: 18,
        title: "SM: Prepare payment dossier",
        description: "SM prepares the payment dossier",
        actorRole: "SM",
        estimatedDuration: 2,
        maxDuration: 3
      },
      {
        phase: 5,
        stepNumber: 19,
        title: "SM: Transmit to SOR",
        description: "SM transmits payment dossier to Service Ordonnancement",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 1
      },
      {
        phase: 5,
        stepNumber: 20,
        title: "SOR: Review dossier",
        description: "SOR reviews the payment dossier",
        actorRole: "SOR",
        estimatedDuration: 2,
        maxDuration: 4
      },
      {
        phase: 5,
        stepNumber: 21,
        title: "SOR: Log remarks",
        description: "SOR logs remarks if issues found",
        actorRole: "SOR",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 5,
        stepNumber: 22,
        title: "SM: Update dossier",
        description: "SM updates dossier based on SOR remarks",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 5,
        stepNumber: 23,
        title: "SOR: Establish OP/OV",
        description: "SOR establishes Ordre de Paiement/Ordre de Virement",
        actorRole: "SOR",
        estimatedDuration: 1,
        maxDuration: 2
      },

      // Phase 6: Payment Validation
      {
        phase: 6,
        stepNumber: 24,
        title: "SOR: Transmit OP/OV to TP",
        description: "SOR transmits OP/OV to Trésorier Payeur",
        actorRole: "SOR",
        estimatedDuration: 1,
        maxDuration: 1
      },
      {
        phase: 6,
        stepNumber: 25,
        title: "TP: Review OP/OV",
        description: "TP reviews the payment order",
        actorRole: "TP",
        estimatedDuration: 2,
        maxDuration: 3
      },
      {
        phase: 6,
        stepNumber: 26,
        title: "TP: Log remarks",
        description: "TP logs remarks if issues found",
        actorRole: "TP",
        estimatedDuration: 1,
        maxDuration: 1
      },
      {
        phase: 6,
        stepNumber: 27,
        title: "SM: Update via SOR",
        description: "SM updates payment order via SOR",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 6,
        stepNumber: 28,
        title: "TP: Validate and sign",
        description: "TP validates and signs the payment order",
        actorRole: "TP",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 6,
        stepNumber: 29,
        title: "SM: Add ordonnateur signature",
        description: "SM adds ordonnateur signature to complete payment",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 1
      },

      // Phase 7: Execution Notification
      {
        phase: 7,
        stepNumber: 30,
        title: "SM: Notify ST of OS activation",
        description: "SM notifies ST of Ordre de Service activation",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 1
      },
      {
        phase: 7,
        stepNumber: 31,
        title: "ST: Monitor project kickoff",
        description: "ST monitors the project kickoff and execution",
        actorRole: "ST",
        estimatedDuration: 2,
        maxDuration: 3
      },

      // Phase 8: Service Management
      {
        phase: 8,
        stepNumber: 32,
        title: "ST: Request suspension/resume",
        description: "ST requests suspension or resumption of services",
        actorRole: "ST",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 8,
        stepNumber: 33,
        title: "SM: Transmit to Prestataire",
        description: "SM transmits suspension/resume order to prestataire",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 1
      },

      // Phase 9: Service Reception
      {
        phase: 9,
        stepNumber: 34,
        title: "SM: Designate reception commission",
        description: "SM designates the reception commission",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 9,
        stepNumber: 35,
        title: "SM: Log deliverables",
        description: "SM logs the deliverables received",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 9,
        stepNumber: 36,
        title: "ST: Review deliverables",
        description: "ST reviews the deliverables for compliance",
        actorRole: "ST",
        estimatedDuration: 3,
        maxDuration: 5
      },
      {
        phase: 9,
        stepNumber: 37,
        title: "ST: Log remarks",
        description: "ST logs remarks if deliverables need corrections",
        actorRole: "ST",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 9,
        stepNumber: 38,
        title: "Prestataire: Address remarks",
        description: "Prestataire addresses the remarks and corrections",
        actorRole: "PRESTATAIRE",
        estimatedDuration: 5,
        maxDuration: 10
      },
      {
        phase: 9,
        stepNumber: 39,
        title: "ST: Finalize reception",
        description: "ST finalizes the reception of deliverables",
        actorRole: "ST",
        estimatedDuration: 2,
        maxDuration: 3
      },

      // Phase 10: Invoicing
      {
        phase: 10,
        stepNumber: 40,
        title: "Prestataire: Submit invoice",
        description: "Prestataire submits invoice for payment",
        actorRole: "PRESTATAIRE",
        estimatedDuration: 3,
        maxDuration: 5
      },
      {
        phase: 10,
        stepNumber: 41,
        title: "ST: Certify invoice",
        description: "ST certifies the invoice for payment",
        actorRole: "ST",
        estimatedDuration: 2,
        maxDuration: 3
      },
      {
        phase: 10,
        stepNumber: 42,
        title: "ST: Establish note de calcul",
        description: "ST establishes calculation note for payment",
        actorRole: "ST",
        estimatedDuration: 1,
        maxDuration: 2
      },
      {
        phase: 10,
        stepNumber: 43,
        title: "SM: Notify Prestataire",
        description: "SM notifies prestataire of payment processing",
        actorRole: "SM",
        estimatedDuration: 1,
        maxDuration: 1
      },
      {
        phase: 10,
        stepNumber: 44,
        title: "SM: Receive definitive deposit",
        description: "SM receives definitive deposit/guarantee",
        actorRole: "SM",
        estimatedDuration: 2,
        maxDuration: 3
      },
      {
        phase: 10,
        stepNumber: 45,
        title: "SB: Confirm financial closure",
        description: "SB confirms financial closure of the contract",
        actorRole: "SB",
        estimatedDuration: 2,
        maxDuration: 3
      }
    ];

    // Insert all ONSSA workflow steps
    for (const step of onssaSteps) {
      await db.insert(workflowSteps).values({
        ...step,
        isInternal: false
      });
    }

    console.log(`Successfully initialized ONSSA workflow with ${onssaSteps.length} steps!`);

  } catch (error) {
    console.error("Error initializing ONSSA workflow:", error);
  }
}

// Create ONSSA-specific tender
export async function createONSSATender() {
  try {
    console.log("Creating ONSSA tender with workflow...");

    const onssaTender = await storage.createTender({
      reference: "ONSSA-2024-001",
      title: "Contrôle qualité des produits alimentaires - ONSSA",
      description: "Prestation de contrôle et certification de qualité des produits alimentaires selon les normes ONSSA",
      amount: "480000",
      direction: "ONSSA",
      division: "CONTROLE_QUALITE",
      currentPhase: 1,
      currentStep: 1,
      status: "active",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
      createdById: "st1"
    });

    // Initialize step history
    await storage.createStepHistory({
      tenderId: onssaTender.id,
      stepId: 1,
      actorId: "st1",
      action: "pending",
      comments: "ONSSA tender initiated - DAO creation phase",
      dateDebut: new Date(),
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });

    console.log(`ONSSA tender created: ${onssaTender.reference}`);
    return onssaTender;

  } catch (error) {
    console.error("Error creating ONSSA tender:", error);
    throw error;
  }
}

// ONSSA workflow progression handler
export async function progressONSSAWorkflow(tenderId: string, currentStep: number, action: "approve" | "reject", comments?: string) {
  try {
    const tender = await storage.getTender(tenderId);
    if (!tender) throw new Error("Tender not found");

    const allSteps = await storage.getWorkflowSteps();
    const currentStepInfo = allSteps.find(s => 
      s.phase === tender.currentPhase && s.stepNumber === currentStep
    );

    if (!currentStepInfo) throw new Error("Current step not found");

    if (action === "approve") {
      // Handle conditional flows based on ONSSA workflow logic
      let nextStep = currentStep + 1;
      let nextPhase = tender.currentPhase;

      // Handle specific ONSSA workflow logic
      switch (currentStep) {
        case 4: // CE: Review DAO
          // If remarks needed, go to step 5, otherwise skip to step 7
          if (comments && comments.includes("remarque")) {
            nextStep = 5; // CE: Log remarks
          } else {
            nextStep = 7; // CE: Validate DAO
          }
          break;
        
        case 6: // SM: Update DAO
          nextStep = 4; // Back to CE: Review DAO
          break;
        
        case 20: // SOR: Review dossier
          if (comments && comments.includes("remarque")) {
            nextStep = 21; // SOR: Log remarks
          } else {
            nextStep = 23; // SOR: Establish OP/OV
          }
          break;
        
        case 22: // SM: Update dossier
          nextStep = 20; // Back to SOR: Review dossier
          break;
        
        case 25: // TP: Review OP/OV
          if (comments && comments.includes("remarque")) {
            nextStep = 26; // TP: Log remarks
          } else {
            nextStep = 28; // TP: Validate and sign
          }
          break;
        
        case 27: // SM: Update via SOR
          nextStep = 25; // Back to TP: Review OP/OV
          break;
        
        case 36: // ST: Review deliverables
          if (comments && comments.includes("remarque")) {
            nextStep = 37; // ST: Log remarks
          } else {
            nextStep = 39; // ST: Finalize reception
          }
          break;
        
        case 38: // Prestataire: Address remarks
          nextStep = 36; // Back to ST: Review deliverables
          break;
        
        default:
          // Handle phase transitions
          if (nextStep > 45) {
            // Workflow completed
            await storage.updateTenderStatus(tenderId, "completed");
            return;
          }
          
          // Determine phase based on step number
          if (nextStep <= 8) nextPhase = 1;
          else if (nextStep <= 17) nextPhase = 2;
          else if (nextStep <= 17) nextPhase = 3;
          else if (nextStep <= 17) nextPhase = 4;
          else if (nextStep <= 23) nextPhase = 5;
          else if (nextStep <= 29) nextPhase = 6;
          else if (nextStep <= 31) nextPhase = 7;
          else if (nextStep <= 33) nextPhase = 8;
          else if (nextStep <= 39) nextPhase = 9;
          else if (nextStep <= 45) nextPhase = 10;
      }

      // Get next step actor
      const nextStepInfo = allSteps.find(s => 
        s.phase === nextPhase && s.stepNumber === nextStep
      );

      if (nextStepInfo) {
        const nextActors = await storage.getUsersByRole(nextStepInfo.actorRole);
        const nextActorId = nextActors[0]?.id;

        // Update tender step
        await storage.updateTenderStep(
          tenderId,
          nextStep,
          nextActorId,
          new Date(Date.now() + (nextStepInfo.estimatedDuration || 3) * 24 * 60 * 60 * 1000),
          nextPhase !== tender.currentPhase ? nextPhase : undefined
        );

        // Create history entry
        await storage.createStepHistory({
          tenderId,
          stepId: nextStepInfo.id,
          actorId: nextActorId,
          action: "pending",
          dateDebut: new Date(),
          deadline: new Date(Date.now() + (nextStepInfo.estimatedDuration || 3) * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Record current step completion
    await storage.createStepHistory({
      tenderId,
      stepId: currentStepInfo.id,
      actorId: tender.currentActorId || "system",
      action,
      comments,
      completedAt: new Date(),
      dateFinalisation: new Date()
    });

    console.log(`ONSSA workflow step ${currentStep} ${action}ed successfully`);

  } catch (error) {
    console.error("Error progressing ONSSA workflow:", error);
    throw error;
  }
}
