import {
  users,
  projects,
  tenders,
  workflowSteps,
  tenderStepHistory,
  tenderComments,
  tenderDocuments,
  contracts,
  invoices,
  orders,
  receptions,
  payments,
  type User,
  type InsertUser,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Tender,
  type WorkflowStep,
  type TenderStepHistory,
  type TenderComment,
  type TenderDocument,
  type Contract,
  type Invoice,
  type Order,
  type Reception,
  type Payment,
  type InsertTender,
  type InsertWorkflowStep,
  type InsertTenderStepHistory,
  type InsertTenderComment,
  type InsertTenderDocument,
  type InsertContract,
  type InsertInvoice,
  type InsertOrder,
  type InsertReception,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserRole(userId: string, role: string, isAdmin?: boolean): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getUserActivityCount(userId: string): Promise<number>;

  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getAllProjects(): Promise<Project[]>;
  getProjectsByDirection(direction: string): Promise<Project[]>;
  updateProject(projectId: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;

  // Tender operations
  createTender(tender: InsertTender): Promise<Tender>;
  getTender(id: string): Promise<Tender | undefined>;
  getTenderWithDetails(id: string): Promise<any>;
  getAllTenders(): Promise<Tender[]>;
  getTendersByActor(actorId: string): Promise<Tender[]>;
  updateTender(tenderId: string, updates: Partial<Tender>): Promise<Tender>;
  updateTenderStep(tenderId: string, stepNumber: number, actorId: string, deadline?: Date): Promise<Tender>;
  updateTenderStatus(tenderId: string, status: string): Promise<Tender>;

  // Workflow operations
  getWorkflowSteps(): Promise<WorkflowStep[]>;
  getWorkflowStepsByPhase(phase: number): Promise<WorkflowStep[]>;
  initializeWorkflowSteps(): Promise<void>;

  // Step history operations
  createStepHistory(history: InsertTenderStepHistory): Promise<TenderStepHistory>;
  getTenderStepHistory(tenderId: string): Promise<TenderStepHistory[]>;

  // Comment operations
  createComment(comment: InsertTenderComment): Promise<TenderComment>;
  getTenderComments(tenderId: string): Promise<TenderComment[]>;

  // Document operations
  createTenderDocument(document: InsertTenderDocument): Promise<TenderDocument>;
  getTenderDocuments(tenderId: string): Promise<TenderDocument[]>;

  // Contract operations
  createContract(contract: InsertContract): Promise<Contract>;
  getContract(id: string): Promise<Contract | undefined>;
  getContractsByTender(tenderId: string): Promise<Contract[]>;
  updateContract(contractId: string, updates: Partial<Contract>): Promise<Contract>;
  getAllContracts(): Promise<Contract[]>;

  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoicesByContract(contractId: string): Promise<Invoice[]>;
  updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice>;
  getAllInvoices(): Promise<Invoice[]>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByContract(contractId: string): Promise<Order[]>;
  updateOrder(orderId: string, updates: Partial<Order>): Promise<Order>;
  getAllOrders(): Promise<Order[]>;

  // Reception operations
  createReception(reception: InsertReception): Promise<Reception>;
  getReception(id: string): Promise<Reception | undefined>;
  getReceptionsByContract(contractId: string): Promise<Reception[]>;
  updateReception(receptionId: string, updates: Partial<Reception>): Promise<Reception>;
  getAllReceptions(): Promise<Reception[]>;

  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByInvoice(invoiceId: string): Promise<Payment[]>;
  updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment>;
  getAllPayments(): Promise<Payment[]>;

  // Dashboard statistics
  getDashboardStats(): Promise<any>;
  getActorWorkload(): Promise<any>;
  getChartData(): Promise<any>;
  getDirectionDetails(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const insertData = {
      id: userData.id,
      email: userData.email,
      username: userData.id,
      password: "temp_password",
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
      role: userData.role || "ST",
      direction: null,
      division: null,
      isAdmin: userData.isAdmin || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [user] = await db
      .insert(users)
      .values(insertData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          role: userData.role,
          isAdmin: userData.isAdmin,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async updateUserRole(userId: string, role: string, isAdmin?: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        role, 
        isAdmin: isAdmin ?? false,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.role, users.firstName);
  }

  async getUserActivityCount(userId: string): Promise<number> {
    // Check tender step history
    const [historyResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenderStepHistory)
      .where(eq(tenderStepHistory.actorId, userId));
    
    // Check if user is current actor in any tender
    const [tenderResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenders)
      .where(eq(tenders.currentActorId, userId));
    
    // Check if user created any tenders
    const [createdResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tenders)
      .where(eq(tenders.createdById, userId));
    
    return (historyResult?.count || 0) + (tenderResult?.count || 0) + (createdResult?.count || 0);
  }

  // Project operations
  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProjectsByDirection(direction: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.direction, direction)).orderBy(desc(projects.createdAt));
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, projectId))
      .returning();
    return updatedProject;
  }

  async deleteProject(projectId: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, projectId));
  }

  // Tender operations
  async createTender(tender: InsertTender): Promise<Tender> {
    const reference = `AO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const [newTender] = await db
      .insert(tenders)
      .values({
        ...tender,
        reference,
        currentPhase: 1,
        currentStep: 1,
        status: "active",
      })
      .returning();

    // Create initial step history entry
    await this.createStepHistory({
      tenderId: newTender.id,
      stepId: 1,
      actorId: tender.createdById!,
      action: "created",
      comments: "Appel d'offres créé",
    });

    return newTender;
  }

  async getTender(id: string): Promise<Tender | undefined> {
    const [tender] = await db.select().from(tenders).where(eq(tenders.id, id));
    return tender;
  }

  async getTenderWithDetails(id: string): Promise<any> {
    const result = await db
      .select({
        tender: tenders,
        currentActor: users,
        createdBy: users,
      })
      .from(tenders)
      .leftJoin(users, eq(tenders.currentActorId, users.id))
      .where(eq(tenders.id, id));

    return result[0];
  }

  async getAllTenders(): Promise<Tender[]> {
    return await db.select().from(tenders).orderBy(desc(tenders.createdAt));
  }

  async getTendersByActor(actorId: string): Promise<any[]> {
    const result = await db
      .select({
        id: tenders.id,
        reference: tenders.reference,
        title: tenders.title,
        amount: tenders.amount,
        division: tenders.division,
        direction: tenders.direction,
        currentPhase: tenders.currentPhase,
        currentStep: tenders.currentStep,
        deadline: tenders.deadline,
        status: tenders.status,
        createdAt: tenders.createdAt
      })
      .from(tenders)
      .where(and(
        eq(tenders.currentActorId, actorId),
        eq(tenders.status, "active")
      ))
      .orderBy(tenders.deadline);
    
    return result;
  }

  async updateTender(tenderId: string, updates: Partial<Tender>): Promise<Tender> {
    const [tender] = await db
      .update(tenders)
      .set({ 
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(tenders.id, tenderId))
      .returning();
    return tender;
  }

  async updateTenderStep(tenderId: string, stepNumber: number, actorId: string, deadline?: Date, phase?: number): Promise<Tender> {
    const updateData: any = { 
      currentStep: stepNumber,
      currentActorId: actorId,
      deadline,
      updatedAt: new Date()
    };
    
    if (phase) {
      updateData.currentPhase = phase;
    }

    const [tender] = await db
      .update(tenders)
      .set(updateData)
      .where(eq(tenders.id, tenderId))
      .returning();
    return tender;
  }

  async updateTenderStatus(tenderId: string, status: string): Promise<Tender> {
    const [tender] = await db
      .update(tenders)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(tenders.id, tenderId))
      .returning();
    return tender;
  }

  // Workflow operations
  async getWorkflowSteps(): Promise<WorkflowStep[]> {
    return await db.select().from(workflowSteps).orderBy(workflowSteps.phase, workflowSteps.stepNumber);
  }

  async getWorkflowStepsByPhase(phase: number): Promise<WorkflowStep[]> {
    return await db
      .select()
      .from(workflowSteps)
      .where(eq(workflowSteps.phase, phase))
      .orderBy(workflowSteps.stepNumber);
  }

  async initializeWorkflowSteps(): Promise<void> {
    // Check if steps already exist
    const existingSteps = await db.select().from(workflowSteps).limit(1);
    if (existingSteps.length > 0) return;

    // Phase 1: Preparation steps (from the document)
    const phase1Steps = [
      { phase: 1, stepNumber: 1, title: "Envoi du DAO", description: "ST → SM: Élaboration du Dossier d'Appel d'Offres", actorRole: "SM", estimatedDuration: 5, maxDuration: 10, isInternal: false },
      { phase: 1, stepNumber: 2, title: "Étude et Envoi au CE", description: "SM → CE: Examen du dossier et vérification de conformité", actorRole: "CE", estimatedDuration: 7, maxDuration: 14, isInternal: false },
      { phase: 1, stepNumber: 3, title: "Revue par CE", description: "CE: Examen de conformité réglementaire", actorRole: "CE", estimatedDuration: 3, maxDuration: 7, isInternal: true },
      { phase: 1, stepNumber: 4, title: "Transmission des remarques CE", description: "CE → ST: Formulation des observations", actorRole: "ST", estimatedDuration: 2, maxDuration: 5, isInternal: false },
      { phase: 1, stepNumber: 5, title: "Satisfaction des remarques CE", description: "ST → SM: Corrections et modifications", actorRole: "SM", estimatedDuration: 3, maxDuration: 7, isInternal: false },
      { phase: 1, stepNumber: 6, title: "Vérification et Envoi au CE", description: "SM → CE: Vérification des corrections", actorRole: "CE", estimatedDuration: 2, maxDuration: 5, isInternal: false },
      { phase: 1, stepNumber: 7, title: "Validation par CE", description: "CE → SM: Accord définitif", actorRole: "SM", estimatedDuration: 1, maxDuration: 3, isInternal: false },
      { phase: 1, stepNumber: 8, title: "Transmission à la commission d'AO", description: "SM → ST: Information de validation", actorRole: "ST", estimatedDuration: 1, maxDuration: 2, isInternal: false },
      { phase: 1, stepNumber: 9, title: "Signature du DAO", description: "SM: Signature par l'autorité compétente", actorRole: "SM", estimatedDuration: 2, maxDuration: 5, isInternal: true },
      { phase: 1, stepNumber: 10, title: "Projet AO publié", description: "SM: Publication de l'avis", actorRole: "SM", estimatedDuration: 30, maxDuration: 45, isInternal: true },
      { phase: 1, stepNumber: 11, title: "Ouverture des plis", description: "SM: Réception et ouverture des offres", actorRole: "SM", estimatedDuration: 1, maxDuration: 2, isInternal: true },
      { phase: 1, stepNumber: 12, title: "Jugement Définitif", description: "SM: Évaluation et désignation de l'attributaire", actorRole: "SM", estimatedDuration: 15, maxDuration: 30, isInternal: true },
      { phase: 1, stepNumber: 13, title: "Information de l'attributaire", description: "SM → CE: Notification de l'entreprise retenue", actorRole: "CE", estimatedDuration: 1, maxDuration: 3, isInternal: false },
      { phase: 1, stepNumber: 14, title: "Établissement du Marché", description: "CE → ST: Demande d'établissement du contrat", actorRole: "ST", estimatedDuration: 5, maxDuration: 10, isInternal: false },
      { phase: 1, stepNumber: 15, title: "Signature du Marché par la Direction Technique", description: "ST → SM: Signature et retour", actorRole: "SM", estimatedDuration: 3, maxDuration: 7, isInternal: false },
      { phase: 1, stepNumber: 16, title: "Remise du Marché au Prestataire", description: "SM: Remise officielle du marché", actorRole: "SM", estimatedDuration: 1, maxDuration: 3, isInternal: true },
      { phase: 1, stepNumber: 17, title: "Transmission du Marché pour Engagement", description: "SM → SB: Transmission pour engagement", actorRole: "SB", estimatedDuration: 1, maxDuration: 2, isInternal: false },
      { phase: 1, stepNumber: 18, title: "Engagement du Marché", description: "SB → SM: Engagement budgétaire", actorRole: "SM", estimatedDuration: 2, maxDuration: 5, isInternal: false },
      { phase: 1, stepNumber: 19, title: "Approbation du Marché", description: "SM: Approbation finale", actorRole: "SM", estimatedDuration: 1, maxDuration: 3, isInternal: true },
      { phase: 1, stepNumber: 20, title: "Visa du Marché", description: "SM: Apposition du visa", actorRole: "SM", estimatedDuration: 1, maxDuration: 2, isInternal: true },
      { phase: 1, stepNumber: 21, title: "Notification de l'approbation du marché au titulaire", description: "SM → CE: Information d'approbation", actorRole: "CE", estimatedDuration: 1, maxDuration: 3, isInternal: false },
      { phase: 1, stepNumber: 22, title: "Dépôt de la caution définitive", description: "CE → SM: Confirmation de garantie", actorRole: "SM", estimatedDuration: 7, maxDuration: 14, isInternal: false },
      { phase: 1, stepNumber: 23, title: "Élaboration de l'Ordre de Service", description: "SM → CE: Préparation ordre de commencement", actorRole: "CE", estimatedDuration: 2, maxDuration: 5, isInternal: false },
    ];

    // Phase 2: Execution steps
    const phase2Steps = [
      { phase: 2, stepNumber: 1, title: "Information de la notification OS", description: "SM → ST: Information émission ordre de service", actorRole: "ST", isInternal: false },
      { phase: 2, stepNumber: 2, title: "Demande de suspendre l'exécution des prestations", description: "ST → SM: Demande d'arrêt temporaire", actorRole: "SM", isInternal: false },
      { phase: 2, stepNumber: 3, title: "Transmission de l'Ordre d'arrêt", description: "SM: Notification d'arrêt au prestataire", actorRole: "SM", isInternal: true },
      { phase: 2, stepNumber: 4, title: "Confirmation de l'Ordre d'arrêt", description: "SM → ST: Confirmation transmission", actorRole: "ST", isInternal: false },
      { phase: 2, stepNumber: 5, title: "Transmission de l'Ordre de reprise", description: "SM: Notification reprise au prestataire", actorRole: "SM", isInternal: true },
      { phase: 2, stepNumber: 6, title: "Confirmation de l'Ordre de reprise", description: "SM → ST: Information reprise", actorRole: "ST", isInternal: false },
      { phase: 2, stepNumber: 7, title: "Désignation de commission de réception", description: "ST → SM: Constitution commission", actorRole: "SM", isInternal: false },
      { phase: 2, stepNumber: 8, title: "Réception des prestations", description: "ST → SM: Réception et PV", actorRole: "SM", isInternal: false },
      { phase: 2, stepNumber: 9, title: "Constatation des manquements", description: "SM: Notification défauts au prestataire", actorRole: "SM", isInternal: true },
      { phase: 2, stepNumber: 10, title: "Satisfaction des remarques", description: "Prestataire → SM: Corrections", actorRole: "SM", isInternal: false },
      { phase: 2, stepNumber: 11, title: "Demande de Saisir le prestataire pour satisfaire les remarques", description: "SM → ST: Demande intervention", actorRole: "ST", isInternal: false },
      { phase: 2, stepNumber: 12, title: "Saisir le prestataire pour Constatation des manquements", description: "ST: Contact prestataire", actorRole: "ST", isInternal: true },
      { phase: 2, stepNumber: 13, title: "Élaboration de la lettre de Mise en Demeure", description: "SM: Rédaction mise en demeure", actorRole: "SM", isInternal: true },
      { phase: 2, stepNumber: 14, title: "Répondre à la lettre de Mise en Demeure", description: "Prestataire → SM: Réponse planning", actorRole: "SM", isInternal: false },
      { phase: 2, stepNumber: 15, title: "Demande de résiliation", description: "ST → SM: Demande résiliation", actorRole: "SM", isInternal: false },
      { phase: 2, stepNumber: 16, title: "Dépôt de Facture", description: "Prestataire → SM: Soumission factures", actorRole: "SM", isInternal: false },
      { phase: 2, stepNumber: 17, title: "Établissement de la note de calcul / Décompte Provisoire", description: "SM → ST: Décompte et vérification", actorRole: "ST", isInternal: false },
      { phase: 2, stepNumber: 18, title: "Certification des Facture", description: "ST → SM: Certification conformité", actorRole: "SM", isInternal: false },
      { phase: 2, stepNumber: 19, title: "Réception Définitive", description: "ST → SM: Réception définitive", actorRole: "SM", isInternal: false },
    ];

    // Phase 3: Payment steps
    const phase3Steps = [
      { phase: 3, stepNumber: 1, title: "Transmission du Dossier de paiement", description: "SM → SOR: Transmission dossier complet", actorRole: "SOR", isInternal: false },
      { phase: 3, stepNumber: 2, title: "Examen du Dossier de paiement", description: "SOR: Vérification conformité", actorRole: "SOR", isInternal: true },
      { phase: 3, stepNumber: 3, title: "Retour du Dossier de paiement", description: "SOR → SM: Retour avec observations", actorRole: "SM", isInternal: false },
      { phase: 3, stepNumber: 4, title: "Transmission des remarques SOR", description: "SOR → ST: Remarques techniques", actorRole: "ST", isInternal: false },
      { phase: 3, stepNumber: 5, title: "Satisfaction des remarques SOR", description: "ST → SM: Corrections", actorRole: "SM", isInternal: false },
      { phase: 3, stepNumber: 6, title: "Satisfaction des Rejets SOR", description: "SM → SOR: Correction rejets", actorRole: "SOR", isInternal: false },
      { phase: 3, stepNumber: 7, title: "Vérification du Dossier de paiement", description: "SOR: Vérification finale", actorRole: "SOR", isInternal: true },
      { phase: 3, stepNumber: 8, title: "Établissement OP/OV", description: "SOR: Ordre de Paiement/Virement", actorRole: "SOR", isInternal: true },
      { phase: 3, stepNumber: 9, title: "Transmission du Dossier de paiement", description: "SOR → TP: Transmission au Trésorier", actorRole: "TP", isInternal: false },
      { phase: 3, stepNumber: 10, title: "Rejet du Dossier de Paiement par le TP", description: "TP → SOR: Rejet si irrégularités", actorRole: "SOR", isInternal: false },
      { phase: 3, stepNumber: 11, title: "Retour du Dossier de paiement par le TP", description: "SOR → SM: Retour dossier rejeté", actorRole: "SM", isInternal: false },
      { phase: 3, stepNumber: 12, title: "Transmission des remarques TP", description: "TP → ST: Observations", actorRole: "ST", isInternal: false },
      { phase: 3, stepNumber: 13, title: "Satisfaction des remarques TP", description: "ST → SM: Corrections Trésorier", actorRole: "SM", isInternal: false },
      { phase: 3, stepNumber: 14, title: "Satisfaction des Rejets TP", description: "SM → SOR: Correction rejets", actorRole: "SOR", isInternal: false },
      { phase: 3, stepNumber: 15, title: "Validation du Dossier de paiement", description: "SOR: Validation définitive", actorRole: "SOR", isInternal: true },
      { phase: 3, stepNumber: 16, title: "Signature du Dossier de Paiement par l'Ordonnateur", description: "SOR → TP: Signature autorisation", actorRole: "TP", isInternal: false },
      { phase: 3, stepNumber: 17, title: "Signature du Dossier de Paiement par le TP", description: "TP: Visa et paiement effectif", actorRole: "TP", isInternal: true },
    ];

    // Insert all steps
    const allSteps = [...phase1Steps, ...phase2Steps, ...phase3Steps];
    await db.insert(workflowSteps).values(allSteps);
  }

  // Step history operations
  async createStepHistory(history: InsertTenderStepHistory): Promise<TenderStepHistory> {
    const [stepHistory] = await db
      .insert(tenderStepHistory)
      .values(history)
      .returning();
    return stepHistory;
  }

  async getTenderStepHistory(tenderId: string): Promise<TenderStepHistory[]> {
    return await db
      .select()
      .from(tenderStepHistory)
      .where(eq(tenderStepHistory.tenderId, tenderId))
      .orderBy(desc(tenderStepHistory.createdAt));
  }

  // Comment operations
  async createComment(comment: InsertTenderComment): Promise<TenderComment> {
    const [tenderComment] = await db
      .insert(tenderComments)
      .values(comment)
      .returning();
    return tenderComment;
  }

  async getTenderComments(tenderId: string): Promise<TenderComment[]> {
    return await db
      .select()
      .from(tenderComments)
      .where(eq(tenderComments.tenderId, tenderId))
      .orderBy(desc(tenderComments.createdAt));
  }

  // Document operations
  async createTenderDocument(document: InsertTenderDocument): Promise<TenderDocument> {
    const [newDocument] = await db
      .insert(tenderDocuments)
      .values(document)
      .returning();
    return newDocument;
  }

  async getTenderDocuments(tenderId: string): Promise<TenderDocument[]> {
    return await db
      .select()
      .from(tenderDocuments)
      .where(eq(tenderDocuments.tenderId, tenderId))
      .orderBy(desc(tenderDocuments.createdAt));
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<any> {
    const totalTenders = await db
      .select({ count: sql`count(*)` })
      .from(tenders);

    const completedTenders = await db
      .select({ count: sql`count(*)` })
      .from(tenders)
      .where(eq(tenders.status, "completed"));

    const activeTenders = await db
      .select({ count: sql`count(*)` })
      .from(tenders)
      .where(eq(tenders.status, "active"));

    const totalBudget = await db
      .select({ sum: sql`sum(amount)` })
      .from(tenders);

    const phaseDistribution = await db
      .select({
        phase: tenders.currentPhase,
        count: sql`count(*)`
      })
      .from(tenders)
      .where(eq(tenders.status, "active"))
      .groupBy(tenders.currentPhase);

    const totalDirections = await db
      .select({ count: sql`count(distinct division)` })
      .from(tenders);

    return {
      totalTenders: totalTenders[0]?.count || 0,
      completedTenders: completedTenders[0]?.count || 0,
      activeTenders: activeTenders[0]?.count || 0,
      totalBudget: totalBudget[0]?.sum || 0,
      totalDirections: totalDirections[0]?.count || 0,
      phaseDistribution,
    };
  }

  async getActorWorkload(): Promise<any> {
    return await db
      .select({
        role: users.role,
        count: sql`count(*)`
      })
      .from(tenders)
      .leftJoin(users, eq(tenders.currentActorId, users.id))
      .where(eq(tenders.status, "active"))
      .groupBy(users.role);
  }

  async getChartData(): Promise<any> {
    // Récupérer les données réelles par division
    const tendersByDivision = await db
      .select({
        division: tenders.division,
        status: tenders.status,
        phase: tenders.currentPhase,
        count: sql`count(*)`
      })
      .from(tenders)
      .groupBy(tenders.division, tenders.status, tenders.currentPhase);

    // Organiser les données pour le graphique basées sur les vraies données
    const directions = ['DAF', 'DHAU', 'DGAF', 'DIL', 'DPAU', 'DEC', 'DGOM'];
    const chartData = directions.map(direction => {
      const divisionData = tendersByDivision.filter(item => item.division === direction);
      
      const total = divisionData.reduce((sum, item) => sum + Number(item.count), 0);
      const activeCount = divisionData.filter(item => item.status === 'active').reduce((sum, item) => sum + Number(item.count), 0);
      const completedCount = divisionData.filter(item => item.status === 'completed').reduce((sum, item) => sum + Number(item.count), 0);
      
      const result: any = {
        direction,
        total,
        active: activeCount,
        completed: completedCount,
      };

      // Ajouter les différents statuts pour le graphique empilé basés sur les vraies données
      result["OS Notifié"] = completedCount;
      result["OS en cours d'élaboration"] = divisionData.filter(item => item.status === 'active' && item.phase === 1).reduce((sum, item) => sum + Number(item.count), 0);
      result["Notification en cours"] = divisionData.filter(item => item.status === 'active' && item.phase === 2).reduce((sum, item) => sum + Number(item.count), 0);
      result["Visa en cours"] = divisionData.filter(item => item.status === 'active' && item.phase === 3).reduce((sum, item) => sum + Number(item.count), 0);
      result["Approbation en cours"] = 0;
      result["Séance AO en cours"] = 0;
      result["Phase de soumission"] = 0;
      result["Non Encore Publié"] = 0;
      result["En cours de Vérification par le SM"] = 0;
      result["DAO Non Encore Reçu"] = 0;

      return result;
    });

    return chartData;
  }

  async getDirectionDetails(): Promise<any> {
    // Récupérer les données détaillées par direction et division
    const tendersByDivision = await db
      .select({
        division: tenders.division,
        status: tenders.status,
        currentStep: tenders.currentStep,
        currentPhase: tenders.currentPhase,
        count: sql`count(*)`
      })
      .from(tenders)
      .groupBy(tenders.division, tenders.status, tenders.currentStep, tenders.currentPhase);

    // Structure des directions et divisions basée sur la structure organisationnelle
    const directionsStructure = [
      { direction: "DAF", divisions: ["DSI", "DRHS", "DF"] },
      { direction: "DPPAV", divisions: ["DCSP", "DSA", "DPV"] },
      { direction: "DCPA", divisions: ["DCPVOV", "DPPA", "DSSPAAA"] },
      { direction: "DIL", divisions: ["DIC", "DL", "DPIV"] },
      { direction: "DERAJ", divisions: ["DERSP", "DNQSPS", "DR"] },
      { direction: "DCC", divisions: ["DCC"] },
      { direction: "DCGAI", divisions: ["DCGAI"] }
    ];

    const directionDetails: any[] = [];

    directionsStructure.forEach(({ direction, divisions }) => {
      divisions.forEach((division, index) => {
        const divisionData = tendersByDivision.filter(item => item.division === division);
        const totalProjects = divisionData.reduce((sum, item) => sum + Number(item.count), 0);

        // Calculer les différents statuts basés sur les données réelles
        const daoNonEncoreRecu = divisionData.filter(item => 
          item.currentStep === 1 && item.currentPhase === 1
        ).reduce((sum, item) => sum + Number(item.count), 0);

        const enCoursDeVerificationParLeSM = divisionData.filter(item => 
          item.currentStep === 2 && item.currentPhase === 1
        ).reduce((sum, item) => sum + Number(item.count), 0);

        const phaseDesoumission = divisionData.filter(item => 
          item.currentPhase === 2
        ).reduce((sum, item) => sum + Number(item.count), 0);

        directionDetails.push({
          direction: index === 0 ? direction : "", // Afficher le nom de la direction seulement sur la première ligne
          division,
          nbrProjet: totalProjects,
          daoNonEncoreRecu,
          enCoursDeVerificationParLeSM,
          nonEncorePublie: 0,
          phaseDesoumission,
          seanceAOEnCours: 0,
          approbationEnCours: 0,
          visaEnCours: 0,
          notificationEnCours: 0,
          osEnCoursDElaboration: 0,
          osNotifie: divisionData.filter(item => item.status === 'completed').reduce((sum, item) => sum + Number(item.count), 0)
        });
      });
    });

    return directionDetails;
  }

  // Contract operations
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db
      .insert(contracts)
      .values(contract)
      .returning();
    return newContract;
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async getContractsByTender(tenderId: string): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .where(eq(contracts.tenderId, tenderId))
      .orderBy(desc(contracts.createdAt));
  }

  async updateContract(contractId: string, updates: Partial<Contract>): Promise<Contract> {
    const [updatedContract] = await db
      .update(contracts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contracts.id, contractId))
      .returning();
    return updatedContract;
  }

  async getAllContracts(): Promise<Contract[]> {
    return await db
      .select()
      .from(contracts)
      .orderBy(desc(contracts.createdAt));
  }

  // Invoice operations
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values(invoice)
      .returning();
    return newInvoice;
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async getInvoicesByContract(contractId: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.contractId, contractId))
      .orderBy(desc(invoices.createdAt));
  }

  async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set(updates)
      .where(eq(invoices.id, invoiceId))
      .returning();
    return updatedInvoice;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .orderBy(desc(invoices.createdAt));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values(order)
      .returning();
    return newOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByContract(contractId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.contractId, contractId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));
  }

  // Reception operations
  async createReception(reception: InsertReception): Promise<Reception> {
    const [newReception] = await db
      .insert(receptions)
      .values(reception)
      .returning();
    return newReception;
  }

  async getReception(id: string): Promise<Reception | undefined> {
    const [reception] = await db.select().from(receptions).where(eq(receptions.id, id));
    return reception;
  }

  async getReceptionsByContract(contractId: string): Promise<Reception[]> {
    return await db
      .select()
      .from(receptions)
      .where(eq(receptions.contractId, contractId))
      .orderBy(desc(receptions.createdAt));
  }

  async updateReception(receptionId: string, updates: Partial<Reception>): Promise<Reception> {
    const [updatedReception] = await db
      .update(receptions)
      .set(updates)
      .where(eq(receptions.id, receptionId))
      .returning();
    return updatedReception;
  }

  async getAllReceptions(): Promise<Reception[]> {
    return await db
      .select()
      .from(receptions)
      .orderBy(desc(receptions.createdAt));
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values(payment)
      .returning();
    return newPayment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, invoiceId))
      .orderBy(desc(payments.createdAt));
  }

  async updatePayment(paymentId: string, updates: Partial<Payment>): Promise<Payment> {
    const [updatedPayment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, paymentId))
      .returning();
    return updatedPayment;
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt));
  }
}

export const storage = new DatabaseStorage();
