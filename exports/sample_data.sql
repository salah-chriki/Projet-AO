-- Sample data for tender management system
-- This represents the structure and type of data in the system

-- Insert sample users with different roles
INSERT INTO users (id, username, email, password, role, isAdmin, division, direction) VALUES
('admin1', 'admin', 'admin@example.com', '$2b$10$hashedpassword', 'admin', true, 'ADMIN', 'ADMIN'),
('st1', 'service.technique', 'st@example.com', '$2b$10$hashedpassword', 'st', false, 'DSI', 'DSI'),
('sm1', 'service.marches', 'sm@example.com', '$2b$10$hashedpassword', 'sm', false, 'SM', 'ADMIN'),
('ce1', 'controle.etat', 'ce@example.com', '$2b$10$hashedpassword', 'ce', false, 'CE', 'ADMIN'),
('sb1', 'service.budgetaire', 'sb@example.com', '$2b$10$hashedpassword', 'sb', false, 'SB', 'ADMIN'),
('sor1', 'service.ordonnancement', 'sor@example.com', '$2b$10$hashedpassword', 'sor', false, 'SOR', 'ADMIN'),
('tp1', 'tresorier.payeur', 'tp@example.com', '$2b$10$hashedpassword', 'tp', false, 'TP', 'ADMIN');

-- Insert workflow steps (59-step process)
INSERT INTO workflow_steps (stepNumber, phase, title, description, actorRole, estimatedDuration) VALUES
-- Phase 1: Preparation and Publication
(1, 1, 'Évaluation des besoins', 'Analyser et identifier les besoins', 'ST', 2),
(2, 1, 'Consultation utilisateurs', 'Consulter les parties prenantes', 'ST', 3),
(3, 1, 'Spécifications techniques', 'Élaborer le cahier des charges', 'ST', 5),
(4, 1, 'Préparation documents', 'Préparer les annexes techniques', 'ST', 2),
(5, 1, 'Transmission vers SM', 'Transmettre vers Service Marchés', 'ST', 1),
(6, 1, 'Documents administratifs', 'Préparer les pièces administratives', 'SM', 2),
(7, 1, 'Clauses spéciales', 'Rédiger le CPS', 'SM', 3),
(8, 1, 'Clauses générales', 'Inclure le CCAG', 'SM', 1),
(9, 1, 'Estimation budgétaire', 'Déterminer le budget estimé', 'SM', 2),
(10, 1, 'Méthode d''achat', 'Choisir la méthode de passation', 'SM', 1),
-- Phase 2: Execution and Control  
(24, 2, 'Réception des offres', 'Recevoir les plis', 'SM', 1),
(25, 2, 'Organisation commission', 'Organiser séance d''ouverture', 'SM', 1),
(26, 2, 'Coordination commission', 'Coordonner commission des marchés', 'SM', 1),
(27, 2, 'Ouverture séquentielle', 'Ouverture par phases', 'SM', 2),
(28, 2, 'Vérification documents', 'Vérifier documents requis', 'SM', 1),
-- Phase 3: Payment Processing
(43, 3, 'Commission réception', 'Constituer commission de réception', 'ST', 1),
(44, 3, 'Vérification conformité', 'Vérifier conformité livraisons', 'ST', 3),
(45, 3, 'Tests équipements', 'Tester fonctionnalité', 'ST', 2),
(57, 3, 'Contrôle final', 'Contrôle final des paiements', 'TP', 2),
(58, 3, 'Validation ordres', 'Valider ordres de paiement', 'TP', 1),
(59, 3, 'Décaissement', 'Décaissement effectif des fonds', 'TP', 1);

-- Insert sample tenders
INSERT INTO tenders (id, reference, title, description, amount, direction, division, currentPhase, currentStep, currentActorId, status, createdById) VALUES
('tender1', 'AO-IT-2024-001', 'Acquisition équipements informatiques', 'Fourniture de 50 ordinateurs portables, 10 imprimantes multifonctions, 5 serveurs', '850000', 'DSI', 'DSI', 1, 3, 'st1', 'active', 'st1'),
('tender2', 'AO-INFRA-2024-002', 'Réfection des voiries communales', 'Travaux de réfection et modernisation des voiries', '2500000', 'TRAVAUX_PUBLICS', 'VOIRIE', 2, 25, 'sm1', 'active', 'st1'),
('tender3', 'AO-FORM-2024-003', 'Formation personnel nouvelles technologies', 'Programme de formation aux outils numériques', '150000', 'RESSOURCES_HUMAINES', 'FORMATION', 3, 44, 'st1', 'active', 'st1');

-- Insert tender step history
INSERT INTO tender_step_history (tenderId, stepNumber, phase, actorId, action, comments, status, completedAt) VALUES
('tender1', 1, 1, 'st1', 'completed', 'Besoins identifiés: 50 ordinateurs, 10 imprimantes, 5 serveurs', 'completed', '2024-01-15 10:00:00'),
('tender1', 2, 1, 'st1', 'completed', 'Consultation équipes DSI et utilisateurs finaux terminée', 'completed', '2024-01-18 14:30:00'),
('tender1', 3, 1, 'st1', 'in_progress', 'Élaboration cahier des charges technique en cours', 'in_progress', NULL);

-- Insert tender comments
INSERT INTO tender_comments (tenderId, authorId, content, isPublic) VALUES
('tender1', 'st1', 'Spécifications techniques détaillées: Core i7, 16GB RAM, 512GB SSD pour les ordinateurs portables', true),
('tender1', 'admin1', 'Workflow 59 étapes activé pour ce marché informatique', false),
('tender2', 'st1', 'Évaluation technique des propositions de réfection en cours', true);

-- Insert sample contracts
INSERT INTO contracts (id, reference, tenderId, contractorName, contractorEmail, amount, startDate, status, signedAt) VALUES
('contract1', 'CONT-IT-2024-001', 'tender1', 'TechnoServices SARL', 'contact@technoservices.ma', '850000', '2024-02-01', 'active', '2024-01-30 16:00:00'),
('contract2', 'CONT-INFRA-2024-002', 'tender2', 'BTP Maroc SA', 'commercial@btpmaroc.ma', '2500000', '2024-03-01', 'active', '2024-02-28 11:00:00');

-- Insert sample invoices
INSERT INTO invoices (id, reference, contractId, amount, status, description, issuedAt) VALUES
('invoice1', 'FACT-IT-001', 'contract1', '425000', 'pending', 'Première tranche - 50% ordinateurs portables', '2024-02-15 09:00:00'),
('invoice2', 'FACT-IT-002', 'contract1', '212500', 'draft', 'Deuxième tranche - imprimantes et serveurs', '2024-03-01 10:00:00'),
('invoice3', 'FACT-INFRA-001', 'contract2', '1250000', 'pending', 'Première tranche travaux voirie - 50%', '2024-03-15 14:00:00');

-- Insert sample orders
INSERT INTO orders (id, reference, contractId, description, quantity, unitPrice, totalAmount, orderDate, status) VALUES
('order1', 'CMD-IT-001', 'contract1', 'Ordinateurs portables Dell Latitude', 50, '8500', '425000', '2024-02-01 10:00:00', 'confirmed'),
('order2', 'CMD-IT-002', 'contract1', 'Imprimantes HP LaserJet Pro', 10, '8000', '80000', '2024-02-15 11:00:00', 'pending'),
('order3', 'CMD-INFRA-001', 'contract2', 'Matériaux réfection voirie Zone A', 1, '1250000', '1250000', '2024-03-01 08:00:00', 'confirmed');

-- Insert sample receptions
INSERT INTO receptions (id, reference, contractId, description, receivedDate, quality, notes, receivedBy, status) VALUES
('reception1', 'REC-IT-001', 'contract1', 'Réception 25 ordinateurs portables', '2024-02-20 15:30:00', 'excellent', 'Tous les ordinateurs conformes aux spécifications', 'st1', 'received'),
('reception2', 'REC-INFRA-001', 'contract2', 'Réception matériaux Phase 1', '2024-03-10 08:00:00', 'satisfactory', 'Matériaux conformes, quelques retards de livraison', 'st1', 'received');

-- Insert sample payments
INSERT INTO payments (id, reference, invoiceId, amount, paymentDate, paymentMethod, status, notes) VALUES
('payment1', 'PAY-IT-001', 'invoice1', '425000', '2024-03-01 10:00:00', 'bank_transfer', 'completed', 'Paiement première tranche équipements IT'),
('payment2', 'PAY-INFRA-001', 'invoice3', '1250000', '2024-03-20 14:30:00', 'bank_transfer', 'completed', 'Paiement première tranche travaux voirie');