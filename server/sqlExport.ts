// SQL-based export utility for database backup and migration
export const createDatabaseSchema = `
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
`;

export const sampleDataInserts = `
-- Sample data for tender management system
-- This represents the structure and type of data in the system

-- Insert sample users
INSERT INTO users (id, username, email, password, role, isAdmin, division, direction) VALUES
('admin1', 'admin', 'admin@example.com', '$2b$10$hashedpassword', 'admin', true, 'ADMIN', 'ADMIN'),
('st1', 'service.technique', 'st@example.com', '$2b$10$hashedpassword', 'st', false, 'DSI', 'DSI'),
('sm1', 'service.marches', 'sm@example.com', '$2b$10$hashedpassword', 'sm', false, 'SM', 'ADMIN'),
('ce1', 'controle.etat', 'ce@example.com', '$2b$10$hashedpassword', 'ce', false, 'CE', 'ADMIN');

-- Insert workflow steps (abbreviated example)
INSERT INTO workflow_steps (stepNumber, phase, title, description, actorRole, estimatedDuration) VALUES
(1, 1, 'Évaluation des besoins', 'Analyser et identifier les besoins', 'ST', 2),
(2, 1, 'Consultation utilisateurs', 'Consulter les parties prenantes', 'ST', 3),
(3, 1, 'Spécifications techniques', 'Élaborer le cahier des charges', 'ST', 5);

-- Insert sample tender
INSERT INTO tenders (id, reference, title, description, amount, direction, division, currentPhase, currentStep, currentActorId, status, createdById) VALUES
('tender1', 'AO-IT-2024-001', 'Acquisition équipements informatiques', 'Fourniture ordinateurs, imprimantes, serveurs', '850000', 'DSI', 'DSI', 1, 1, 'st1', 'active', 'st1');

-- Insert sample contract
INSERT INTO contracts (id, reference, tenderId, contractorName, contractorEmail, amount, status) VALUES
('contract1', 'CONT-2024-001', 'tender1', 'TechnoServices SARL', 'contact@technoservices.ma', '850000', 'active');

-- Insert sample invoice
INSERT INTO invoices (id, reference, contractId, amount, status, description) VALUES
('invoice1', 'INV-2024-001', 'contract1', '425000', 'pending', 'Première tranche - 50% du montant');
`;

export function generateBackupScript(): string {
  return `#!/bin/bash
# Database backup script for tender management system
# Usage: ./backup.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="tender_system_backup_$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Export database schema and data
echo "Creating database backup..."
pg_dump $DATABASE_URL --clean --if-exists --no-owner --no-privileges > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_DIR/$BACKUP_FILE"
    
    # Compress the backup
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo "Backup compressed: $BACKUP_DIR/$BACKUP_FILE.gz"
    
    # Keep only last 10 backups
    cd $BACKUP_DIR
    ls -t tender_system_backup_*.sql.gz | tail -n +11 | xargs -r rm
    echo "Old backups cleaned up"
else
    echo "Backup failed"
    exit 1
fi
`;
}

export function generateRestoreScript(): string {
  return `#!/bin/bash
# Database restore script for tender management system
# Usage: ./restore.sh backup_file.sql.gz

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Available backups:"
    ls -la ./backups/tender_system_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file '$BACKUP_FILE' not found"
    exit 1
fi

echo "Restoring database from: $BACKUP_FILE"

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "Decompressing backup..."
    gunzip -c "$BACKUP_FILE" | psql $DATABASE_URL
else
    psql $DATABASE_URL < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "Database restored successfully"
else
    echo "Restore failed"
    exit 1
fi
`;
}

export const exportManualQueries = `
-- Manual export queries for data extraction
-- Run these queries individually to export specific data

-- Export all users
COPY (SELECT * FROM users) TO '/tmp/users_export.csv' WITH CSV HEADER;

-- Export all tenders
COPY (SELECT * FROM tenders) TO '/tmp/tenders_export.csv' WITH CSV HEADER;

-- Export all contracts
COPY (SELECT * FROM contracts) TO '/tmp/contracts_export.csv' WITH CSV HEADER;

-- Export tender workflow summary
COPY (
  SELECT 
    t.reference,
    t.title,
    t.direction,
    t.currentPhase,
    t.currentStep,
    t.status,
    t.amount,
    u.username as current_actor,
    t.createdAt
  FROM tenders t
  LEFT JOIN users u ON t.currentActorId = u.id
  ORDER BY t.createdAt DESC
) TO '/tmp/tender_summary.csv' WITH CSV HEADER;

-- Export complete workflow history
COPY (
  SELECT 
    t.reference as tender_ref,
    h.stepNumber,
    h.phase,
    h.action,
    h.status,
    u.username as actor,
    h.comments,
    h.createdAt
  FROM tender_step_history h
  JOIN tenders t ON h.tenderId = t.id
  JOIN users u ON h.actorId = u.id
  ORDER BY t.reference, h.phase, h.stepNumber
) TO '/tmp/workflow_history.csv' WITH CSV HEADER;
`;