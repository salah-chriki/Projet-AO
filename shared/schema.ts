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
  deadline: timestamp("deadline"),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTenders: many(tenders, { relationName: "created_by" }),
  assignedTenders: many(tenders, { relationName: "current_actor" }),
  stepHistory: many(tenderStepHistory),
  comments: many(tenderComments),
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
export type InsertTender = z.infer<typeof insertTenderSchema>;
export type InsertWorkflowStep = z.infer<typeof insertWorkflowStepSchema>;
export type InsertTenderStepHistory = z.infer<typeof insertTenderStepHistorySchema>;
export type InsertTenderComment = z.infer<typeof insertTenderCommentSchema>;
export type InsertTenderDocument = z.infer<typeof insertTenderDocumentSchema>;
