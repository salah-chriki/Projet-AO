import { storage } from "./storage";

export async function createDemoTenderWorkflow() {
  console.log("🚀 Creating demo tender workflow...");

  // Step 1: Create a new tender
  const demoTender = await storage.createTender({
    title: "Rénovation des bureaux administratifs - Bâtiment A",
    description: "Travaux de rénovation complète des espaces de bureaux du bâtiment administratif principal, incluant peinture, électricité, plomberie et aménagement.",
    amount: "350000",
    division: "DSI", // Will auto-assign to DAF direction
    direction: "DAF",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    createdById: "admin1"
  });

  console.log(`✅ Tender created: ${demoTender.reference} - "${demoTender.title}"`);
  console.log(`   Amount: €${demoTender.amount}`);
  console.log(`   Division: ${demoTender.division} (Direction: ${demoTender.direction})`);
  console.log(`   Current Phase: ${demoTender.currentPhase}, Step: ${demoTender.currentStep}`);

  // Get workflow steps to understand the process
  const allSteps = await storage.getWorkflowSteps();
  const currentStep = allSteps.find(s => s.phase === 1 && s.stepNumber === 1);
  
  console.log(`   Current Step: ${currentStep?.title} (Actor: ${currentStep?.actorRole})`);
  console.log(`   Estimated Duration: ${currentStep?.estimatedDuration} days`);

  return {
    tender: demoTender,
    currentStep,
    allSteps
  };
}

export async function simulateWorkflowProgress(tenderId: string) {
  console.log(`\n🔄 Simulating workflow progress for tender ${tenderId}...`);

  const allSteps = await storage.getWorkflowSteps();
  let tender = await storage.getTender(tenderId);
  
  if (!tender) {
    console.log("❌ Tender not found");
    return;
  }

  // Simulate progression through first few steps
  const stepsToSimulate = [
    { phase: 1, step: 1, action: "approved", comment: "Dossier technique validé par le Service Technique" },
    { phase: 1, step: 2, action: "approved", comment: "Cahier des charges approuvé par le Service Marchés" },
    { phase: 1, step: 3, action: "approved", comment: "Contrôle réglementaire effectué avec succès" },
  ];

  for (const simStep of stepsToSimulate) {
    const stepInfo = allSteps.find(s => s.phase === simStep.phase && s.stepNumber === simStep.step);
    if (!stepInfo) continue;

    // Get actor for this step
    const actors = await storage.getUsersByRole(stepInfo.actorRole);
    const actor = actors[0];

    if (actor) {
      console.log(`\n📋 Step ${simStep.phase}.${simStep.step}: ${stepInfo.title}`);
      console.log(`   Actor: ${actor.firstName} ${actor.lastName} (${stepInfo.actorRole})`);
      console.log(`   Action: ${simStep.action}`);
      console.log(`   Comment: ${simStep.comment}`);

      // Record the step completion
      await storage.createStepHistory({
        tenderId,
        stepId: stepInfo.id,
        actorId: actor.id,
        action: simStep.action,
        comments: simStep.comment,
        completedAt: new Date(),
      });

      // Move to next step
      const nextStep = allSteps.find(s => 
        s.phase === simStep.phase && s.stepNumber === simStep.step + 1
      ) || allSteps.find(s => 
        s.phase === simStep.phase + 1 && s.stepNumber === 1
      );

      if (nextStep) {
        const nextActors = await storage.getUsersByRole(nextStep.actorRole);
        const nextActor = nextActors[0];
        
        await storage.updateTenderStep(
          tenderId,
          nextStep.stepNumber,
          nextActor?.id,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days deadline
          nextStep.phase !== simStep.phase ? nextStep.phase : undefined
        );

        console.log(`   ➡️  Moved to: ${nextStep.title} (${nextStep.actorRole})`);
      }
    }
  }

  // Add prestataire during workflow (typically happens in Phase 2)
  console.log(`\n🏢 Adding prestataire information during workflow...`);
  await storage.updateTender(tenderId, {
    prestataire: "Entreprise Générale de Rénovation SARL"
  });
  console.log(`   Prestataire assigned: Entreprise Générale de Rénovation SARL`);

  // Get final tender state
  tender = await storage.getTender(tenderId);
  const currentStepInfo = allSteps.find(s => 
    s.phase === tender?.currentPhase && s.stepNumber === tender?.currentStep
  );

  console.log(`\n📊 Current tender status:`);
  console.log(`   Phase: ${tender?.currentPhase} - Step: ${tender?.currentStep}`);
  console.log(`   Current Step: ${currentStepInfo?.title}`);
  console.log(`   Next Actor: ${currentStepInfo?.actorRole}`);
  console.log(`   Prestataire: ${tender?.prestataire || "Not assigned yet"}`);

  return tender;
}

export async function showCompleteWorkflow() {
  console.log("=".repeat(80));
  console.log("🎯 DEMONSTRATION: Complete Tender Workflow Process");
  console.log("=".repeat(80));

  // Create demo tender
  const { tender } = await createDemoTenderWorkflow();

  // Simulate progress
  await simulateWorkflowProgress(tender.id);

  // Show workflow phases overview
  console.log(`\n📋 Complete Workflow Overview:`);
  console.log(`   Phase 1: Preparation (Steps 1-24) - Document preparation, approvals`);
  console.log(`   Phase 2: Execution (Steps 25-48) - Tender publication, evaluation`);
  console.log(`   Phase 3: Payment (Steps 49-71) - Contract execution, payments`);

  console.log(`\n✨ Demo completed! Tender ${tender.reference} is now in the workflow.`);
  console.log("=".repeat(80));

  return tender;
}