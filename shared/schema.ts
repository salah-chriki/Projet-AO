import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull(), // ST, SM, CE, SB, SOR, TP, ADMIN
  direction: varchar("direction"), // DAF, DPPAV, DCPA, DIL, DERAJ, DCC, DCGAI
  division: varchar("division"), // DSI, DRHS, DF, DCSP, DSA, DPV, DCPVOV, DPPA, DSSPAAA, DIC, DL, DPIV, DERSP, DNQSPS, DR, DCC, DCGAI
  isAdmin: boolean("is_admin").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tender main table
export const tenders = pgTable("tenders", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: varchar("reference").unique().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 15, scale: 2 }),
  prestataire: text("prestataire"), // Contractor/Service provider name
  direction: varchar("direction"), // DAF, DPPAV, DCPA, DIL, DERAJ, DCC, DCGAI
  division: varchar("division"), // DSI, DRHS, DF, DCSP, DSA, DPV, etc.
  currentPhase: integer("current_phase").default(1), // 1=Preparation, 2=Execution, 3=Payment
  currentStep: integer("current_step").default(1),
  currentActorId: varchar("current_actor_id").references(() => users.id),
  status: varchar("status").default("active"), // active, completed, cancelled
  deadline: timestamp("deadline"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workflow step definitions
export const workflowSteps = pgTable("workflow_steps", {
  id: serial("id").primaryKey(),
  phase: integer("phase").notNull(), // 1, 2, 3
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  actorRole: varchar("actor_role").notNull(), // ST, SM, CE, SB, SOR, TP
  estimatedDuration: integer("estimated_duration"), // in days
  maxDuration: integer("max_duration"), // maximum allowed days
  isInternal: boolean("is_internal").default(false), // internal process vs requires actor action
});

// Tender step history/audit trail
export const tenderStepHistory = pgTable("tender_step_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenderId: uuid("tender_id").references(() => tenders.id),
  stepId: integer("step_id").references(() => workflowSteps.id),
  actorId: varchar("actor_id").references(() => users.id),
  action: varchar("action").notNull(), // approved, rejected, completed, pending
  comments: text("comments"),
  dateDebut: timestamp("date_debut"), // Start date when actor receives the task
  dateFinalisation: timestamp("date_finalisation"), // End date when actor completes the task
  deadline: timestamp("deadline"), // Expected completion deadline
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments/remarks on tenders
export const tenderComments = pgTable("tender_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenderId: uuid("tender_id").references(() => tenders.id),
  authorId: varchar("author_id").references(() => users.id),
  content: text("content").notNull(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents attached to tenders
export const tenderDocuments = pgTable("tender_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenderId: uuid("tender_id").references(() => tenders.id),
  fileName: varchar("file_name").notNull(),
  originalFileName: varchar("original_file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  documentType: varchar("document_type").notNull(), // DAO, plans, specifications, contract, etc.
  uploadedById: varchar("uploaded_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contracts (Marchés)
export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenderId: uuid("tender_id").references(() => tenders.id).notNull(),
  contractorId: varchar("contractor_id").references(() => users.id), // Reference to contractor user
  contractorName: text("contractor_name"), // Company name if not a user
  dateSigned: timestamp("date_signed"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status").default("active"), // active, completed, terminated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  contractId: uuid("contract_id").references(() => contracts.id).notNull(),
  fileName: varchar("file_name"), // Invoice file path
  originalFileName: varchar("original_file_name"),
  status: varchar("status").default("pending"), // pending, approved, rejected, paid
  amount: decimal("amount", { precision: 15, scale: 2 }),
  submissionDate: timestamp("submission_date").defaultNow(),
  approvedDate: timestamp("approved_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders (OS/Arrêt/Reprise)
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type").notNull(), // OS, Arrêt, Reprise
  contractId: uuid("contract_id").references(() => contracts.id).notNull(),
  dateIssued: timestamp("date_issued").defaultNow(),
  issuedById: varchar("issued_by_id").references(() => users.id).notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 15, scale: 2 }),
  status: varchar("status").default("active"), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Receptions
export const receptions = pgTable("receptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  contractId: uuid("contract_id").references(() => contracts.id).notNull(),
  type: varchar("type").notNull(), // Provisional, Final
  date: timestamp("date").defaultNow(),
  status: varchar("status").default("pending"), // pending, approved, rejected
  comments: text("comments"),
  receivedById: varchar("received_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status").default("pending"), // pending, processed, completed, failed
  paymentDate: timestamp("payment_date"),
  processedById: varchar("processed_by_id").references(() => users.id),
  paymentReference: varchar("payment_reference"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTenders: many(tenders, { relationName: "created_by" }),
  assignedTenders: many(tenders, { relationName: "current_actor" }),
  stepHistory: many(tenderStepHistory),
  comments: many(tenderComments),
  contracts: many(contracts),
  issuedOrders: many(orders),
  receptions: many(receptions),
  processedPayments: many(payments),
}));

export const tendersRelations = relations(tenders, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [tenders.createdById],
    references: [users.id],
    relationName: "created_by",
  }),
  currentActor: one(users, {
    fields: [tenders.currentActorId],
    references: [users.id],
    relationName: "current_actor",
  }),
  stepHistory: many(tenderStepHistory),
  comments: many(tenderComments),
  documents: many(tenderDocuments),
  contracts: many(contracts),
}));

export const workflowStepsRelations = relations(workflowSteps, ({ many }) => ({
  stepHistory: many(tenderStepHistory),
}));

export const tenderStepHistoryRelations = relations(tenderStepHistory, ({ one }) => ({
  tender: one(tenders, {
    fields: [tenderStepHistory.tenderId],
    references: [tenders.id],
  }),
  step: one(workflowSteps, {
    fields: [tenderStepHistory.stepId],
    references: [workflowSteps.id],
  }),
  actor: one(users, {
    fields: [tenderStepHistory.actorId],
    references: [users.id],
  }),
}));

export const tenderCommentsRelations = relations(tenderComments, ({ one }) => ({
  tender: one(tenders, {
    fields: [tenderComments.tenderId],
    references: [tenders.id],
  }),
  author: one(users, {
    fields: [tenderComments.authorId],
    references: [users.id],
  }),
}));

export const tenderDocumentsRelations = relations(tenderDocuments, ({ one }) => ({
  tender: one(tenders, {
    fields: [tenderDocuments.tenderId],
    references: [tenders.id],
  }),
  uploadedBy: one(users, {
    fields: [tenderDocuments.uploadedById],
    references: [users.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  tender: one(tenders, {
    fields: [contracts.tenderId],
    references: [tenders.id],
  }),
  contractor: one(users, {
    fields: [contracts.contractorId],
    references: [users.id],
  }),
  invoices: many(invoices),
  orders: many(orders),
  receptions: many(receptions),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  contract: one(contracts, {
    fields: [invoices.contractId],
    references: [contracts.id],
  }),
  payments: many(payments),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  contract: one(contracts, {
    fields: [orders.contractId],
    references: [contracts.id],
  }),
  issuedBy: one(users, {
    fields: [orders.issuedById],
    references: [users.id],
  }),
}));

export const receptionsRelations = relations(receptions, ({ one }) => ({
  contract: one(contracts, {
    fields: [receptions.contractId],
    references: [contracts.id],
  }),
  receivedBy: one(users, {
    fields: [receptions.receivedById],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  processedBy: one(users, {
    fields: [payments.processedById],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertTenderSchema = createInsertSchema(tenders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkflowStepSchema = createInsertSchema(workflowSteps).omit({
  id: true,
});

export const insertTenderStepHistorySchema = createInsertSchema(tenderStepHistory).omit({
  id: true,
  createdAt: true,
});

export const insertTenderCommentSchema = createInsertSchema(tenderComments).omit({
  id: true,
  createdAt: true,
});

export const insertTenderDocumentSchema = createInsertSchema(tenderDocuments).omit({
  id: true,
  createdAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertReceptionSchema = createInsertSchema(receptions).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
}).extend({
  role: z.enum(["ST", "SM", "CE", "SB", "SOR", "TP", "ADMIN"]).optional(),
  isAdmin: z.boolean().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Tender = typeof tenders.$inferSelect;
export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type TenderStepHistory = typeof tenderStepHistory.$inferSelect;
export type TenderComment = typeof tenderComments.$inferSelect;
export type TenderDocument = typeof tenderDocuments.$inferSelect;
export type Contract = typeof contracts.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Reception = typeof receptions.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type InsertTender = z.infer<typeof insertTenderSchema>;
export type InsertWorkflowStep = z.infer<typeof insertWorkflowStepSchema>;
export type InsertTenderStepHistory = z.infer<typeof insertTenderStepHistorySchema>;
export type InsertTenderComment = z.infer<typeof insertTenderCommentSchema>;
export type InsertTenderDocument = z.infer<typeof insertTenderDocumentSchema>;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertReception = z.infer<typeof insertReceptionSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
