import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertTenderSchema, 
  insertTenderCommentSchema, 
  insertTenderStepHistorySchema, 
  upsertUserSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize workflow steps
  await storage.initializeWorkflowSteps();
  
  // Seed example data
  const { seedExampleTenders } = await import("./seedData");
  await seedExampleTenders();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
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

  // Tender routes
  app.get('/api/tenders', isAuthenticated, async (req, res) => {
    try {
      const tenders = await storage.getAllTenders();
      res.json(tenders);
    } catch (error) {
      console.error("Error fetching tenders:", error);
      res.status(500).json({ message: "Failed to fetch tenders" });
    }
  });

  app.get('/api/tenders/my-tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tenders = await storage.getTendersByActor(userId);
      res.json(tenders);
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
        };
      }).sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      
      res.json(timeline);
    } catch (error) {
      console.error("Error fetching tender timeline:", error);
      res.status(500).json({ message: "Failed to fetch timeline" });
    }
  });

  app.post('/api/tenders', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTenderSchema.parse({
        ...req.body,
        createdById: req.user.claims.sub,
      });
      
      const tender = await storage.createTender(validatedData);
      res.status(201).json(tender);
    } catch (error) {
      console.error("Error creating tender:", error);
      res.status(500).json({ message: "Failed to create tender" });
    }
  });

  // Tender step actions
  app.post('/api/tenders/:id/approve', isAuthenticated, async (req: any, res) => {
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

        // Update tender to next step
        await storage.updateTenderStep(
          tenderId,
          nextStep.stepNumber,
          nextActorId,
          deadline ? new Date(deadline) : undefined
        );

        // If moving to new phase, update phase
        if (nextStep.phase !== tender.currentPhase) {
          await storage.updateTenderStep(tenderId, nextStep.stepNumber, nextActorId, deadline ? new Date(deadline) : undefined);
        }
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

      res.json({ message: "Tender rejected successfully" });
    } catch (error) {
      console.error("Error rejecting tender:", error);
      res.status(500).json({ message: "Failed to reject tender" });
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
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/users', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/users/:id/role', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/users/:id', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/workflow/steps', isAuthenticated, async (req, res) => {
    try {
      const steps = await storage.getWorkflowSteps();
      res.json(steps);
    } catch (error) {
      console.error("Error fetching workflow steps:", error);
      res.status(500).json({ message: "Failed to fetch workflow steps" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
