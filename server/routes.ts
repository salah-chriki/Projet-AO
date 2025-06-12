import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated, isAdmin, isDivisionAdmin, isAdminOrDivisionAdmin } from "./simpleAuth";
import bcrypt from "bcrypt";
import { 
  insertTenderSchema, 
  insertTenderCommentSchema, 
  insertTenderStepHistorySchema, 
  insertTenderDocumentSchema,
  insertContractSchema,
  insertInvoiceSchema,
  insertOrderSchema,
  insertReceptionSchema,
  insertPaymentSchema,
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

  // Auth middleware - handled by setupSimpleAuth below

  // Setup authentication first
  await setupSimpleAuth(app);

  // Initialize demo users
  const { initializeDemoUsers } = await import("./initUsers");
  await initializeDemoUsers();

  // Initialize real workflow steps with error handling
  try {
    const { initializeRealWorkflowSteps } = await import("./realWorkflowSteps");
    await initializeRealWorkflowSteps();
    
    // Create Phase 1 Step 1 tenders for all directions
    const { createPhase1Step1Tenders } = await import("./newTenderData");
    await createPhase1Step1Tenders();
    
    console.log("Database initialization completed successfully");
  } catch (error) {
    console.warn("Database initialization failed, continuing with limited functionality:", error instanceof Error ? error.message : error);
  }

  // Auth routes are handled by setupSimpleAuth

  // Dashboard statistics
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const workload = await storage.getActorWorkload();
      res.json({ ...stats, workload });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard statistics
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      const workload = await storage.getActorWorkload();
      res.json({ ...stats, workload });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  app.get('/api/dashboard/chart-data', isAuthenticated, async (req, res) => {
    try {
      const chartData = await storage.getChartData();
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  app.get('/api/dashboard/direction-details', isAuthenticated, async (req, res) => {
    try {
      const directionDetails = await storage.getDirectionDetails();
      res.json(directionDetails);
    } catch (error) {
      console.error("Error fetching direction details:", error);
      res.status(500).json({ message: "Failed to fetch direction details" });
    }
  });

  // Tender routes with role-based filtering
  app.get('/api/tenders', isAuthenticated, async (req: any, res) => {
    try {
      const { direction, division } = req.query;
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let tenders = await storage.getAllTenders();
      
      // Role-based filtering
      if (user.role !== 'ADMIN') {
        // For non-admin users, filter by division and control requirements
        tenders = tenders.filter((tender: any) => {
          // Check if tender is in user's division (using current schema)
          const sameDivision = tender.division === user.division;
          
          // Define which steps each role controls
          const roleSteps = {
            'ST': [1, 2], // Service Technique: Initial submission and preparation
            'SM': [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71], // Service Marchés: Most verification steps
            'CE': [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71], // Commission d'Évaluation: Evaluation phase
            'SB': [45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71], // Service Budget: Budget approval
            'SOR': [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71], // Service Ordonnateur: Final approval
            'TP': [65, 66, 67, 68, 69, 70, 71] // Trésor Public: Payment processing
          };
          
          const userSteps = roleSteps[user.role as keyof typeof roleSteps] || [];
          const needsUserControl = userSteps.includes(tender.currentStep);
          
          return sameDivision && needsUserControl;
        });
        
        // For SM actors, apply additional direction/division filters
        if (user.role === 'SM') {
          if (direction && direction !== 'all') {
            tenders = tenders.filter((tender: any) => tender.direction === direction);
          }
          
          if (division && division !== 'all') {
            tenders = tenders.filter((tender: any) => tender.division === division);
          }
        }
      }
      
      res.json(tenders);
    } catch (error) {
      console.error("Error fetching tenders:", error);
      res.status(500).json({ message: "Failed to fetch tenders" });
    }
  });

  app.get('/api/tenders/my-tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only show tenders where the current user is the assigned actor
      const tasks = await storage.getTendersByActor(userId);
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tenders/:id', isAuthenticated, async (req, res) => {
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
  app.get('/api/tenders/:id/timeline', isAuthenticated, async (req, res) => {
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

  // Update tender information (including prestataire) during workflow
  app.put('/api/tenders/:id/update', isAuthenticated, async (req: any, res) => {
    try {
      const tenderId = req.params.id;
      const { prestataire, title, description, amount } = req.body;
      
      // Get current tender
      const tender = await storage.getTender(tenderId);
      if (!tender) {
        return res.status(404).json({ message: "Tender not found" });
      }
      
      // Update tender with new information
      const updateData: any = {};
      if (prestataire !== undefined) updateData.prestataire = prestataire;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (amount !== undefined) updateData.amount = amount;
      
      // Update the tender
      await storage.updateTender(tenderId, updateData);
      
      res.json({ message: "Tender updated successfully" });
    } catch (error) {
      console.error("Error updating tender:", error);
      res.status(500).json({ message: "Failed to update tender" });
    }
  });

  // Demo workflow endpoint
  app.post('/api/demo/workflow', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { showCompleteWorkflow } = await import("./demoWorkflow");
      const result = await showCompleteWorkflow();
      res.json({ 
        message: "Demo workflow completed successfully",
        tender: result 
      });
    } catch (error) {
      console.error("Error running demo workflow:", error);
      res.status(500).json({ message: "Failed to run demo workflow" });
    }
  });

  // Helper function to auto-assign direction based on division
  function getDirectionFromDivision(division: string): string {
    const divisionToDirection: Record<string, string> = {
      // DAF contains: DSI, DRHS, DF
      'DSI': 'DAF',
      'DRHS': 'DAF', 
      'DF': 'DAF',
      
      // DPPAV contains: DCSP, DSA, DPV
      'DCSP': 'DPPAV',
      'DSA': 'DPPAV',
      'DPV': 'DPPAV',
      
      // DCPA contains: DCPVOV, DPPA, DSSPAAA
      'DCPVOV': 'DCPA',
      'DPPA': 'DCPA',
      'DSSPAAA': 'DCPA',
      
      // DIL contains: DIC, DL, DPIV
      'DIC': 'DIL',
      'DL': 'DIL',
      'DPIV': 'DIL',
      
      // DERAJ contains: DERSP, DNQSPS, DR
      'DERSP': 'DERAJ',
      'DNQSPS': 'DERAJ',
      'DR': 'DERAJ',
      
      // DCC and DCGAI are standalone
      'DCC': 'DCC',
      'DCGAI': 'DCGAI'
    };
    
    return divisionToDirection[division] || division;
  }

  // Create tender with documents
  app.post('/api/tenders', isAuthenticated, upload.array('documents', 10), async (req: any, res) => {
    try {
      // Auto-assign direction based on division
      const autoDirection = req.body.division ? getDirectionFromDivision(req.body.division) : req.body.direction;
      
      const validatedData = insertTenderSchema.parse({
        ...req.body,
        direction: autoDirection,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
        createdById: req.session.userId,
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
            uploadedById: req.session.userId
          };
          
          await storage.createTenderDocument(documentData);
        }
      }
      
      // Assign to the ST actor who created it (current user)
      await storage.updateTenderStep(tender.id, 1, req.session.userId);
      
      res.status(201).json(tender);
    } catch (error) {
      console.error("Error creating tender:", error);
      res.status(500).json({ message: "Failed to create tender" });
    }
  });

  // Tender step actions
  app.post('/api/tenders/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { nextStepStartDate, nextStepEndDate, comments } = req.body;
      const userId = req.session.userId;
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

      // Record approval in history with timing information
      await storage.createStepHistory({
        tenderId,
        stepId: currentStepInfo?.id,
        actorId: userId,
        action: "approved",
        comments,
        dateFinalisation: new Date(), // Current step completion date
        completedAt: new Date(),
      });

      if (nextStep) {
        // Get actor for next step
        const nextActors = await storage.getUsersByRole(nextStep.actorRole);
        const nextActorId = nextActors[0]?.id;

        // Update tender to next step with proper phase handling
        // Use end date as deadline, start date is informational
        const stepDeadline = nextStepEndDate ? new Date(nextStepEndDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        await storage.updateTenderStep(
          tenderId,
          nextStep.stepNumber,
          nextActorId,
          stepDeadline,
          nextStep.phase !== tender.currentPhase ? nextStep.phase : undefined
        );

        // Create step history entry for the new actor receiving the task
        await storage.createStepHistory({
          tenderId,
          stepId: nextStep.id,
          actorId: nextActorId,
          action: "pending",
          dateDebut: nextStepStartDate ? new Date(nextStepStartDate) : new Date(), // Task start date
          deadline: stepDeadline,
        });

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

  app.post('/api/tenders/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const { comments } = req.body;
      const userId = req.session.userId;
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

  // Document routes
  app.get('/api/tenders/:id/documents', isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getTenderDocuments(req.params.id);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get('/api/tenders/:id/documents/:docId/download', isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getTenderDocuments(req.params.id);
      const document = documents.find(doc => doc.id === req.params.docId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const filePath = `uploads/${document.fileName}`;
      res.download(filePath, document.originalFileName);
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ message: "Failed to download document" });
    }
  });

  // Comment routes
  app.get('/api/tenders/:id/comments', isAuthenticated, async (req, res) => {
    try {
      const comments = await storage.getTenderComments(req.params.id);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/tenders/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTenderCommentSchema.parse({
        ...req.body,
        tenderId: req.params.id,
        authorId: req.session.userId,
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // User management routes (admin only for now)
  app.get('/api/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      let users = await storage.getAllUsers();
      
      // If division admin, filter to only show users from their division/direction
      if (req.userRole === 'DIVISION_ADMIN') {
        users = users.filter((user: any) => 
          user.division === req.userDivision || user.direction === req.userDirection
        );
      }
      
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { username, password, email, firstName, lastName, role, division, direction } = req.body;
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user with all required fields
      const userId = `user_${Date.now()}`;
      const userData = {
        id: userId,
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        role: role || 'ST', // Default to ST if no role provided
        division,
        direction,
        isAdmin: role === 'ADMIN',
        isActive: true,
      };
      
      await storage.createUser(userData);
      
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put('/api/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
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

  // Update user (admin only)
  app.put('/api/users/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { username, email, firstName, lastName, role, isActive } = req.body;
      
      const updatedUser = await storage.updateUser(id, {
        username,
        email,
        firstName,
        lastName,
        role,
        isAdmin: role === 'ADMIN',
        isActive,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Check if user has associated data
      const userHasData = await storage.getUserActivityCount(id);
      
      if (userHasData > 0) {
        // Instead of deleting, deactivate the user
        await storage.updateUser(id, { isActive: false });
        res.json({ message: "User has been deactivated (has associated tender data)" });
      } else {
        // Safe to delete
        await storage.deleteUser(id);
        res.json({ message: "User deleted successfully" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Workflow steps
  app.get('/api/workflow/steps', isAuthenticated, async (req, res) => {
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

  // Contract Management API Routes
  
  // Contracts
  app.get('/api/contracts', isAuthenticated, async (req, res) => {
    try {
      const contracts = await storage.getAllContracts();
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get('/api/contracts/:id', isAuthenticated, async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const contractData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(contractData);
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  app.put('/api/contracts/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = req.body;
      const contract = await storage.updateContract(req.params.id, updates);
      res.json(contract);
    } catch (error) {
      console.error("Error updating contract:", error);
      res.status(500).json({ message: "Failed to update contract" });
    }
  });

  app.get('/api/tenders/:id/contracts', isAuthenticated, async (req, res) => {
    try {
      const contracts = await storage.getContractsByTender(req.params.id);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching tender contracts:", error);
      res.status(500).json({ message: "Failed to fetch tender contracts" });
    }
  });

  // Invoices
  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post('/api/invoices', isAuthenticated, upload.single('invoiceFile'), async (req: any, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse({
        ...req.body,
        fileName: req.file?.filename,
        originalFileName: req.file?.originalname,
      });
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = req.body;
      const invoice = await storage.updateInvoice(req.params.id, updates);
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.get('/api/contracts/:id/invoices', isAuthenticated, async (req, res) => {
    try {
      const invoices = await storage.getInvoicesByContract(req.params.id);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching contract invoices:", error);
      res.status(500).json({ message: "Failed to fetch contract invoices" });
    }
  });

  // Orders
  app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        issuedById: req.session.userId,
      });
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = req.body;
      const order = await storage.updateOrder(req.params.id, updates);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  app.get('/api/contracts/:id/orders', isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrdersByContract(req.params.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching contract orders:", error);
      res.status(500).json({ message: "Failed to fetch contract orders" });
    }
  });

  // Receptions
  app.get('/api/receptions', isAuthenticated, async (req, res) => {
    try {
      const receptions = await storage.getAllReceptions();
      res.json(receptions);
    } catch (error) {
      console.error("Error fetching receptions:", error);
      res.status(500).json({ message: "Failed to fetch receptions" });
    }
  });

  app.get('/api/receptions/:id', isAuthenticated, async (req, res) => {
    try {
      const reception = await storage.getReception(req.params.id);
      if (!reception) {
        return res.status(404).json({ message: "Reception not found" });
      }
      res.json(reception);
    } catch (error) {
      console.error("Error fetching reception:", error);
      res.status(500).json({ message: "Failed to fetch reception" });
    }
  });

  app.post('/api/receptions', isAuthenticated, async (req: any, res) => {
    try {
      const receptionData = insertReceptionSchema.parse({
        ...req.body,
        receivedById: req.session.userId,
      });
      const reception = await storage.createReception(receptionData);
      res.status(201).json(reception);
    } catch (error) {
      console.error("Error creating reception:", error);
      res.status(500).json({ message: "Failed to create reception" });
    }
  });

  app.put('/api/receptions/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = req.body;
      const reception = await storage.updateReception(req.params.id, updates);
      res.json(reception);
    } catch (error) {
      console.error("Error updating reception:", error);
      res.status(500).json({ message: "Failed to update reception" });
    }
  });

  app.get('/api/contracts/:id/receptions', isAuthenticated, async (req, res) => {
    try {
      const receptions = await storage.getReceptionsByContract(req.params.id);
      res.json(receptions);
    } catch (error) {
      console.error("Error fetching contract receptions:", error);
      res.status(500).json({ message: "Failed to fetch contract receptions" });
    }
  });

  // Payments
  app.get('/api/payments', isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get('/api/payments/:id', isAuthenticated, async (req, res) => {
    try {
      const payment = await storage.getPayment(req.params.id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
      res.status(500).json({ message: "Failed to fetch payment" });
    }
  });

  app.post('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        processedById: req.session.userId,
      });
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.put('/api/payments/:id', isAuthenticated, async (req, res) => {
    try {
      const updates = req.body;
      const payment = await storage.updatePayment(req.params.id, updates);
      res.json(payment);
    } catch (error) {
      console.error("Error updating payment:", error);
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  app.get('/api/invoices/:id/payments', isAuthenticated, async (req, res) => {
    try {
      const payments = await storage.getPaymentsByInvoice(req.params.id);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching invoice payments:", error);
      res.status(500).json({ message: "Failed to fetch invoice payments" });
    }
  });

  // Create sample contract data endpoint
  app.post('/api/seed-contracts', isAuthenticated, async (req, res) => {
    try {
      const { seedContractData } = await import("./contractSeedData");
      await seedContractData();
      res.json({ message: "Sample contract data created successfully" });
    } catch (error) {
      console.error("Error creating sample contract data:", error);
      res.status(500).json({ message: "Failed to create sample contract data" });
    }
  });

  // Workflow steps endpoints
  app.get('/api/workflow-steps', isAuthenticated, async (req, res) => {
    try {
      const steps = await storage.getWorkflowSteps();
      res.json(steps);
    } catch (error) {
      console.error("Error fetching workflow steps:", error);
      res.status(500).json({ message: "Failed to fetch workflow steps" });
    }
  });

  app.get('/api/workflow/stats', isAuthenticated, async (req, res) => {
    try {
      const tenders = await storage.getAllTenders();
      const activeTenders = tenders.filter((t: any) => t.status === 'active');
      const completedTenders = tenders.filter((t: any) => t.status === 'completed');
      
      const phaseDistribution = activeTenders.reduce((acc: any, tender: any) => {
        const phase = `phase${tender.currentPhase}`;
        acc[phase] = (acc[phase] || 0) + 1;
        return acc;
      }, {});

      res.json({
        totalTenders: tenders.length,
        activeTenders: activeTenders.length,
        completedTenders: completedTenders.length,
        phaseDistribution,
        averageStepDuration: 2.5 // Based on workflow analysis
      });
    } catch (error) {
      console.error("Error fetching workflow stats:", error);
      res.status(500).json({ message: "Failed to fetch workflow stats" });
    }
  });

  // Create IT Equipment procurement tender endpoint
  app.post('/api/create-it-tender', isAuthenticated, async (req, res) => {
    try {
      const { createITEquipmentTender } = await import("./itEquipmentWorkflow");
      const itTender = await createITEquipmentTender();
      res.json({ 
        message: "IT Equipment procurement tender created successfully",
        tender: itTender
      });
    } catch (error) {
      console.error("Error creating IT equipment tender:", error);
      res.status(500).json({ message: "Failed to create IT equipment tender" });
    }
  });

  // Data export endpoints
  app.get('/api/export/data', isAuthenticated, async (req, res) => {
    try {
      const { exportAllData, generateExportSummary } = await import("./dataExport");
      const data = await exportAllData();
      const summary = generateExportSummary(data);
      
      res.json({
        success: true,
        summary,
        data,
        exportDate: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to export data",
        error: error.message 
      });
    }
  });

  app.get('/api/export/download/:format', isAuthenticated, async (req, res) => {
    try {
      const format = req.params.format as 'json' | 'csv';
      if (format !== 'json' && format !== 'csv') {
        return res.status(400).json({ message: "Format must be 'json' or 'csv'" });
      }

      const { exportToFile } = await import("./dataExport");
      const filepath = await exportToFile(format);
      
      if (format === 'json') {
        res.download(filepath, `tender_system_export_${new Date().toISOString().split('T')[0]}.json`);
      } else {
        res.json({ 
          success: true, 
          message: `CSV files exported to exports directory`,
          path: filepath 
        });
      }
    } catch (error) {
      console.error("Error downloading export:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to download export",
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
