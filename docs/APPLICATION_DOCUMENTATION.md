
# Documentation de l'Application de Gestion des Appels d'Offres

## Vue d'ensemble

Cette application est un système complet de gestion des appels d'offres développé avec React/TypeScript pour le frontend et Node.js/Express pour le backend. Elle utilise PostgreSQL comme base de données et suit un workflow en 3 phases avec 59 étapes détaillées.

## Architecture de l'Application

### Structure des Dossiers

```
├── client/                     # Frontend React/TypeScript
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   │   ├── ui/            # Composants UI de base (shadcn/ui)
│   │   │   ├── actor-badge.tsx
│   │   │   ├── approve-task-dialog.tsx
│   │   │   ├── create-tender-dialog.tsx
│   │   │   ├── phase-badge.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── tender-card.tsx
│   │   │   └── tender-timeline.tsx
│   │   ├── hooks/             # Hooks personnalisés
│   │   ├── lib/               # Utilitaires et constantes
│   │   ├── pages/             # Pages de l'application
│   │   └── App.tsx
├── server/                     # Backend Node.js/Express
│   ├── db.ts                  # Configuration base de données
│   ├── routes.ts              # Routes API
│   ├── storage.ts             # Couche d'accès aux données
│   ├── simpleAuth.ts          # Authentification
│   ├── realWorkflowSteps.ts   # Définition des étapes
│   └── index.ts               # Point d'entrée serveur
├── shared/                     # Types et schémas partagés
│   └── schema.ts              # Schémas Drizzle ORM
└── uploads/                   # Stockage des documents
```

### Technologies Utilisées

- **Frontend**: React 18, TypeScript, Vite, TanStack Query, Wouter (routing)
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express, TypeScript
- **Base de données**: PostgreSQL avec Drizzle ORM
- **Authentification**: Session-based auth avec bcrypt
- **Upload de fichiers**: Multer

## Interface Utilisateur

### 1. Page de Connexion
- Interface simple avec username/password
- Validation des credentials
- Redirection automatique selon le rôle

### 2. Tableau de Bord Administrateur
- **Statistiques globales**: Total AO, AO finalisés, En cours, Budget total
- **Répartition par phase**: Graphiques des appels d'offres par phase
- **Charge de travail**: Visualisation de la charge par acteur
- **AO récents**: Liste des derniers appels d'offres créés

### 3. Tableau de Bord Acteur (Vue Métier)
- **Mes tâches**: Appels d'offres assignés à l'utilisateur connecté
- **Actions rapides**: Boutons d'approbation/rejet
- **Timeline**: Progression des étapes
- **Notifications**: Tâches en attente et échéances

### 4. Gestion des Appels d'Offres
- **Liste complète**: Filtrage par phase, direction, division
- **Vue détaillée**: Informations complètes, documents, commentaires
- **Création**: Formulaire avec upload de documents
- **Actions**: Approuver, rejeter, commenter

### 5. Gestion des Acteurs (Admin uniquement)
- **Liste des utilisateurs**: Tous les acteurs du système
- **Création d'acteurs**: Formulaire complet avec rôles
- **Gestion des rôles**: Modification des permissions
- **Statut**: Activation/désactivation des comptes

## Workflow des Appels d'Offres

### Phase 1: Préparation et Publication (23 étapes)

**Objectif**: Élaboration du dossier d'appel d'offres jusqu'à sa publication

**Acteurs principaux**: ST (Service Technique), SM (Service Marchés), CE (Contrôle d'État), SB (Service Budget)

**Étapes clés**:
1. **DAO Envoyé par ST** - Le Service Technique élabore le dossier
2. **DAO Étudié par SM** - Vérification par le Service Marchés
3. **Contrôle CE** - Validation réglementaire
4. **Corrections** - Satisfaction des remarques
5. **Publication** - Mise en ligne de l'appel d'offres
6. **Ouverture des plis** - Réception des candidatures
7. **Jugement** - Évaluation et sélection
8. **Attribution** - Notification au prestataire
9. **Signature du marché** - Formalisation contractuelle
10. **Engagement budgétaire** - Validation financière

### Phase 2: Exécution du Marché (19 étapes)

**Objectif**: Suivi de l'exécution des prestations et contrôle qualité

**Acteurs principaux**: ST, SM, PRESTATAIRE

**Étapes clés**:
1. **Ordre de Service** - Démarrage officiel des travaux
2. **Suivi d'exécution** - Contrôle des prestations
3. **Gestion des arrêts** - Suspension/reprise si nécessaire
4. **Réception des prestations** - Validation technique
5. **Traitement des manquements** - Corrections éventuelles
6. **Mise en demeure** - Procédures en cas de défaillance
7. **Réception définitive** - Validation finale

### Phase 3: Paiement (17 étapes)

**Objectif**: Traitement des factures et paiement du prestataire

**Acteurs principaux**: SM, SOR (Service Ordonnancement), TP (Trésor Public)

**Étapes clés**:
1. **Dépôt de facture** - Soumission par le prestataire
2. **Certification ST** - Validation technique des prestations
3. **Contrôle SOR** - Vérification administrative
4. **Traitement des rejets** - Corrections si nécessaire
5. **Validation TP** - Contrôle final du Trésor Public
6. **Ordonnancement** - Émission de l'ordre de paiement
7. **Paiement effectif** - Virement au prestataire

## Modèle de Données

### Entités Principales

**Users (Utilisateurs)**
- Identifiant, email, mot de passe
- Rôle (ST, SM, CE, SB, SOR, TP, ADMIN)
- Direction et division d'affectation
- Statut actif/inactif

**Tenders (Appels d'Offres)**
- Référence unique, titre, description
- Montant, prestataire attribué
- Phase et étape actuelles
- Acteur responsable, échéances
- Statut (actif, terminé, annulé)

**WorkflowSteps (Étapes du Workflow)**
- Phase, numéro d'étape
- Titre, description
- Rôle de l'acteur responsable
- Durées estimée et maximale

**TenderStepHistory (Historique)**
- Actions effectuées sur chaque étape
- Dates de début et fin
- Commentaires des acteurs
- Statut (approuvé, rejeté, en attente)

**TenderDocuments (Documents)**
- Fichiers joints aux appels d'offres
- Types de documents (DAO, plans, contrats)
- Métadonnées (taille, type MIME)

## Rôles et Permissions

### Acteurs Métier

**ST - Service Technique**
- Création des dossiers techniques
- Certification des prestations
- Réception des travaux

**SM - Service Marchés**
- Coordination générale du processus
- Gestion administrative
- Interface avec les prestataires

**CE - Contrôle d'État**
- Validation réglementaire
- Contrôle de conformité

**SB - Service Budget**
- Engagement budgétaire
- Contrôle financier

**SOR - Service Ordonnancement**
- Traitement des paiements
- Contrôle administratif des factures

**TP - Trésor Public**
- Validation finale des paiements
- Exécution des virements

### Administrateurs

**ADMIN**
- Gestion complète du système
- Création/modification des utilisateurs
- Accès à tous les appels d'offres
- Statistiques globales

## Fonctionnalités Avancées

### Filtrage Intelligent
- Filtrage automatique par rôle et division
- Vue personnalisée selon les responsabilités
- Accès sélectif aux appels d'offres

### Notifications et Alertes
- Suivi des échéances
- Notifications de nouvelles tâches
- Alertes de retard

### Audit et Traçabilité
- Historique complet de chaque action
- Horodatage précis
- Commentaires obligatoires

### Gestion Documentaire
- Upload multiple de fichiers
- Catégorisation des documents
- Téléchargement sécurisé

## Sécurité

### Authentification
- Mots de passe hachés avec bcrypt
- Sessions sécurisées
- Timeout automatique

### Autorisation
- Contrôle d'accès basé sur les rôles
- Isolation des données par division
- Validation des permissions à chaque action

### Protection des Données
- Validation des entrées
- Sanitisation des uploads
- Logs d'audit

## Déploiement

L'application est conçue pour être déployée sur Replit avec :
- Configuration automatique de la base de données PostgreSQL
- Variables d'environnement sécurisées
- Serveur d'assets pour les uploads
- Configuration de production optimisée

Cette documentation fournit une vue complète de l'architecture et du fonctionnement de l'application de gestion des appels d'offres, permettant une compréhension rapide du système pour les développeurs et les utilisateurs métier.
