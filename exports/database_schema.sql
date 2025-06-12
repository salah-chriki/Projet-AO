-- Complete database schema for tender management system
-- PostgreSQL schema with all tables and relationships

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  isAdmin BOOLEAN DEFAULT false,
  division TEXT,
  direction TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
  id SERIAL PRIMARY KEY,
  stepNumber INTEGER NOT NULL,
  phase INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  actorRole TEXT NOT NULL,
  estimatedDuration INTEGER DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenders table
CREATE TABLE IF NOT EXISTS tenders (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount TEXT,
  direction TEXT NOT NULL,
  division TEXT,
  currentPhase INTEGER DEFAULT 1,
  currentStep INTEGER DEFAULT 1,
  currentActorId TEXT,
  status TEXT DEFAULT 'active',
  createdById TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deadline TIMESTAMP,
  FOREIGN KEY (createdById) REFERENCES users(id),
  FOREIGN KEY (currentActorId) REFERENCES users(id)
);

-- Tender step history
CREATE TABLE IF NOT EXISTS tender_step_history (
  id SERIAL PRIMARY KEY,
  tenderId TEXT NOT NULL,
  stepNumber INTEGER NOT NULL,
  phase INTEGER NOT NULL,
  actorId TEXT NOT NULL,
  action TEXT NOT NULL,
  comments TEXT,
  status TEXT DEFAULT 'pending',
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenderId) REFERENCES tenders(id),
  FOREIGN KEY (actorId) REFERENCES users(id)
);

-- Tender comments
CREATE TABLE IF NOT EXISTS tender_comments (
  id SERIAL PRIMARY KEY,
  tenderId TEXT NOT NULL,
  authorId TEXT NOT NULL,
  content TEXT NOT NULL,
  isPublic BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenderId) REFERENCES tenders(id),
  FOREIGN KEY (authorId) REFERENCES users(id)
);

-- Tender documents
CREATE TABLE IF NOT EXISTS tender_documents (
  id SERIAL PRIMARY KEY,
  tenderId TEXT NOT NULL,
  filename TEXT NOT NULL,
  originalName TEXT NOT NULL,
  mimeType TEXT,
  size INTEGER,
  uploadedBy TEXT NOT NULL,
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenderId) REFERENCES tenders(id),
  FOREIGN KEY (uploadedBy) REFERENCES users(id)
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  tenderId TEXT NOT NULL,
  contractorName TEXT NOT NULL,
  contractorEmail TEXT,
  contractorPhone TEXT,
  amount TEXT NOT NULL,
  startDate TIMESTAMP,
  endDate TIMESTAMP,
  status TEXT DEFAULT 'active',
  signedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenderId) REFERENCES tenders(id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  contractId TEXT NOT NULL,
  amount TEXT NOT NULL,
  dueDate TIMESTAMP,
  status TEXT DEFAULT 'pending',
  issuedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paidAt TIMESTAMP,
  description TEXT,
  FOREIGN KEY (contractId) REFERENCES contracts(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  contractId TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unitPrice TEXT,
  totalAmount TEXT,
  orderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deliveryDate TIMESTAMP,
  status TEXT DEFAULT 'pending',
  FOREIGN KEY (contractId) REFERENCES contracts(id)
);

-- Receptions table
CREATE TABLE IF NOT EXISTS receptions (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  contractId TEXT NOT NULL,
  description TEXT NOT NULL,
  receivedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  quality TEXT DEFAULT 'satisfactory',
  notes TEXT,
  receivedBy TEXT,
  status TEXT DEFAULT 'received',
  FOREIGN KEY (contractId) REFERENCES contracts(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  invoiceId TEXT NOT NULL,
  amount TEXT NOT NULL,
  paymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paymentMethod TEXT DEFAULT 'bank_transfer',
  status TEXT DEFAULT 'completed',
  notes TEXT,
  FOREIGN KEY (invoiceId) REFERENCES invoices(id)
);

-- Sessions table (for authentication)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  sid TEXT UNIQUE NOT NULL,
  sess JSON NOT NULL,
  expire TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_direction ON tenders(direction);
CREATE INDEX IF NOT EXISTS idx_tender_history_tender ON tender_step_history(tenderId);
CREATE INDEX IF NOT EXISTS idx_contracts_tender ON contracts(tenderId);
CREATE INDEX IF NOT EXISTS idx_invoices_contract ON invoices(contractId);
CREATE INDEX IF NOT EXISTS idx_orders_contract ON orders(contractId);
CREATE INDEX IF NOT EXISTS idx_receptions_contract ON receptions(contractId);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoiceId);