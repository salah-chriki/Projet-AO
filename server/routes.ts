import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupTempAuth, isTempAuthenticated } from "./tempAuth";
import { 
  insertTenderSchema, 
  insertTenderCommentSchema, 
  insertTenderStepHistorySchema, 
  insertTenderDocumentSchema,
  upsertUserSchema 
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.diskStorage({
      destination: uploadsDir,
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });

  // Auth middleware
  await setupTempAuth(app);

  // Initialize real workflow steps
  const { initializeRealWorkflowSteps } = await import("./realWorkflowSteps");
  await initializeRealWorkflowSteps();
  
  // Seed real tender data
  const { seedRealTenders } = await import("./realSeedData");
  await seedRealTenders();

  // Auth routes
  app.get('/api/auth/user', isTempAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard statistics
  app.get('/api/dashboard/stats', isTempAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const workload = await storage.getActorWorkload();
      res.json({ ...stats, workload });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Tender routes
  app.get('/api/tenders', isTempAuthenticated, async (req, res) => {
    try {
      const tenders = await storage.getAllTenders();
      res.json(tenders);
    } catch (error) {
      console.error("Error fetching tenders:", error);
      res.status(500).json({ message: "Failed to fetch tenders" });
    }
  });

  app.get('/api/tenders/my-tasks', isTempAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Role-based task filtering
      let tasks;
      if (user.role === 'ST') {
        // ST: only show tenders where they need to take action
        tasks = await storage.getTendersByActor(userId);
      } else if (user.role === 'SM') {
        // SM: can view all tenders
        tasks = await storage.getAllTenders();
      } else {
        // Other roles: show their assigned tasks
        tasks = await storage.getTendersByActor(userId);
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tenders/:id', isTempAuthenticated, async (req, res) => {
    try {
      const tender = await storage.getTenderWithDetails(req.params.id);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      res.json(tender);
    } catch (error) {
      console.error("Error fetching tender:", error);
      res.status(500).json({ message: "Failed to fetch tender" });
    }
  });

  // Get tender timeline
  app.get('/api/tenders/:id/timeline', isTempAuthenticated, async (req, res) => {
    try {
      const history = await storage.getTenderStepHistory(req.params.id);
      const steps = await storage.getWorkflowSteps();
      
      // Create timeline with step details
      const timeline = history.map(entry => {
        const step = steps.find(s => s.id === entry.stepId);
        return {
          ...entry,
          stepTitle: step?.title || 'Étape inconnue',
          stepDescription: step?.description || '',
          actorRole: step?.actorRole || '',
          estimatedDuration: step?.estimatedDuration || null,
          maxDuration: step?.maxDuration || null,
        };
      }).sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching tender timeline:", error);
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });

  // Create tender with documents
  app.post('/api/tenders', isTempAuthenticated, upload.array('documents', 10), async (req: any, res) => {
    try {
      const validatedData = insertTenderSchema.parse({
        ...req.body,
        createdById: req.user.claims.sub,
        currentStep: 1,
        currentPhase: 1,
        status: 'active'
      });
      
      const tender = await storage.createTender(validatedData);
      
      // Handle uploaded documents
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const documentData = {
            tenderId: tender.id,
            fileName: file.filename,
            originalFileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            documentType: req.body.documentTypes?.[req.files.indexOf(file)] || 'other',
            uploadedById: req.user.claims.sub
          };
          
          await storage.createTenderDocument(documentData);
        }
      }
      
      // Assign to current actor (ST at step 1)
      const firstStep = await storage.getWorkflowSteps();
      const currentStep = firstStep.find(s => s.phase === 1 && s.stepNumber === 1);
      if (currentStep) {
        const stUser = await storage.getUsersByRole('ST');
        if (stUser.length > 0) {
          await storage.updateTenderStep(tender.id, 1, stUser[0].id);
        }
      }
      
      res.status(201).json(tender);
    } catch (error) {
      console.error("Error creating tender:", error);
      res.status(500).json({ message: "Failed to create tender" });
    }
  });

  // Tender step actions
  app.post('/api/tenders/:id/approve', isTempAuthenticated, async (req: any, res) => {
    try {
      const { deadline, comments } = req.body;
      const userId = req.user.claims.sub;
      const tenderId = req.params.id;

      // Get current tender
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }

      // Get next step
      const allSteps = await storage.getWorkflowSteps();
      const currentStepInfo = allSteps.find(s => 
        s.phase === tender.currentPhase && s.stepNumber === tender.currentStep
      );
      
      let nextStep = allSteps.find(s => 
        s.phase === tender.currentPhase && s.stepNumber === (tender.currentStep || 1) + 1
      );

      // If no next step in current phase, move to next phase
      if (!nextStep && (tender.currentPhase || 1) < 3) {
        nextStep = allSteps.find(s => 
          s.phase === (tender.currentPhase || 1) + 1 && s.stepNumber === 1
        );
      }

      // Record approval in history
      await storage.createStepHistory({
        tenderId,
        stepId: currentStepInfo?.id,
        actorId: userId,
        action: "approved",
        comments,
        completedAt: new Date(),
      });

      if (nextStep) {
        // Get actor for next step
        const nextActors = await storage.getUsersByRole(nextStep.actorRole);
        const nextActorId = nextActors[0]?.id;

        // Update tender to next step with proper phase handling
        await storage.updateTenderStep(
          tenderId,
          nextStep.stepNumber,
          nextActorId,
          deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          nextStep.phase !== tender.currentPhase ? nextStep.phase : undefined
        );

        console.log(`Tender ${tenderId} moved to step ${nextStep.stepNumber} (${nextStep.title}) assigned to ${nextActorId}`);
      } else {
        // Tender completed
        await storage.updateTenderStatus(tenderId, "completed");
      }

      res.json({ message: "Tender approved successfully" });
    } catch (error) {
      console.error("Error approving tender:", error);
      res.status(500).json({ message: "Failed to approve tender" });
    }
  });

  app.post('/api/tenders/:id/reject', isTempAuthenticated, async (req: any, res) => {
    try {
      const { comments } = req.body;
      const userId = req.user.claims.sub;
      const tenderId = req.params.id;

      // Get current tender
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }

      // Get current step
      const allSteps = await storage.getWorkflowSteps();
      const currentStepInfo = allSteps.find(s => 
        s.phase === tender.currentPhase && s.stepNumber === tender.currentStep
      );

      // Record rejection in history
      await storage.createStepHistory({
        tenderId,
        stepId: currentStepInfo?.id,
        actorId: userId,
        action: "rejected",
        comments,
        completedAt: new Date(),
      });

      // Find previous step to send back for modifications
      let previousStep = allSteps.find(s => 
        s.phase === tender.currentPhase && s.stepNumber === (tender.currentStep || 1) - 1
      );

      // If no previous step in current phase, go to last step of previous phase
      if (!previousStep && (tender.currentPhase || 1) > 1) {
        const previousPhaseSteps = allSteps.filter(s => s.phase === (tender.currentPhase || 1) - 1);
        previousStep = previousPhaseSteps[previousPhaseSteps.length - 1];
      }

      if (previousStep) {
        // Get actor for previous step
        const previousActors = await storage.getUsersByRole(previousStep.actorRole);
        const previousActorId = previousActors[0]?.id;

        // Move tender back to previous step with proper phase handling
        await storage.updateTenderStep(
          tenderId,
          previousStep.stepNumber,
          previousActorId,
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days deadline
          previousStep.phase !== tender.currentPhase ? previousStep.phase : undefined
        );

        console.log(`Tender ${tenderId} sent back to step ${previousStep.stepNumber} (${previousStep.title}) assigned to ${previousActorId}`);
      }

      res.json({ message: "Tender rejected and sent back for modifications" });
    } catch (error) {
      console.error("Error rejecting tender:", error);
      res.status(500).json({ message: "Failed to reject tender" });
    }
  });

  // Comment routes
  app.get('/api/tenders/:id/comments', isTempAuthenticated, async (req, res) => {
    try {
      const comments = await storage.getTenderComments(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/tenders/:id/comments', isTempAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTenderCommentSchema.parse({
        ...req.body,
        tenderId: req.params.id,
        authorId: req.user.claims.sub,
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // User management routes (admin only)
  app.get('/api/users', isTempAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isTempAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = upsertUserSchema.parse(req.body);
      const newUser = await storage.upsertUser(validatedData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/users/:id/role', isTempAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { role, isAdmin } = req.body;
      const updatedUser = await storage.updateUserRole(req.params.id, role, isAdmin);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete('/api/users/:id', isTempAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Workflow steps
  app.get('/api/workflow/steps', isTempAuthenticated, async (req, res) => {
    try {
      const steps = await storage.getWorkflowSteps();
      res.json(steps);
    } catch (error) {
      console.error("Error fetching workflow steps:", error);
      res.status(500).json({ message: "Failed to fetch workflow steps" });
    }
  });

  // Create diverse example tenders at different workflow stages
  app.post("/api/seed/diverse-tenders", async (req, res) => {
    try {
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
        // Create the tender
        const tender = await storage.createTender({
          reference: `AO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          title: example.title,
          description: example.description,
          amount: example.budget.toString(),
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
      }

      console.log("Diverse tender creation completed!");
      res.json({ message: "Diverse tenders created successfully", count: tenderExamples.length });
    } catch (error) {
      console.error("Error creating diverse tenders:", error);
      res.status(500).json({ message: "Failed to create diverse tenders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
