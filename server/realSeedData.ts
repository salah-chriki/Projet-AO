import { db } from "./db";
import { tenders, tenderStepHistory } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function seedRealTenders() {
  // Check if we already have real tenders
  const existingTenders = await db.select().from(tenders).limit(1);
  if (existingTenders.length > 0) {
    console.log("Real tenders already exist, skipping seed");
    return;
  }

  console.log("Seeding real tender examples...");

  // Clear existing data
  await db.delete(tenderStepHistory);
  await db.delete(tenders);

  // Créer des appels d'offres à différentes étapes du processus réel
  const realTenders = [
    // Phase 1 - Étape 1: Envoi du DAO (ST)
    {
      id: randomUUID(),
      reference: "AO-2024-001",
      title: "Réhabilitation du réseau d'assainissement - Secteur Nord",
      description: "Travaux de réhabilitation et modernisation du réseau d'assainissement collectif dans le secteur Nord de la commune, incluant le remplacement de 2,5 km de canalisations et la réfection de 15 regards.",
      amount: 450000,
      division: "TECH",
      department: "INFRA",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      creatorId: "st1"
    },
    // Phase 1 - Étape 3: Revue par CE (CE)
    {
      id: randomUUID(),
      reference: "AO-2024-002", 
      title: "Fourniture et installation d'équipements informatiques",
      description: "Acquisition de 50 postes de travail, 5 serveurs, équipements réseau et logiciels pour la modernisation du parc informatique municipal.",
      amount: 125000,
      division: "ADMIN",
      department: "INFO",
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 3,
      currentActorId: "ce1",
      status: "active",
      creatorId: "st1"
    },
    // Phase 1 - Étape 5: Satisfaction des remarques CE (ST)
    {
      id: "ao-2024-003",
      reference: "AO-2024-003",
      title: "Aménagement paysager du parc municipal",
      description: "Création d'espaces verts, plantation d'arbres, installation de mobilier urbain et création d'aires de jeux pour enfants sur 2 hectares.",
      amount: 85000,
      division: "TECH",
      department: "ESPACES",
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 5,
      currentActorId: "st1",
      status: "active",
      creatorId: "st1"
    },
    // Phase 1 - Étape 12: Jugement Définitif (SM)
    {
      id: "ao-2024-004",
      reference: "AO-2024-004",
      title: "Travaux de voirie - Avenue de la République",
      description: "Réfection complète de la chaussée, création de pistes cyclables et rénovation de l'éclairage public sur 1,2 km.",
      amount: 320000,
      division: "TECH",
      department: "VOIRIE",
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 12,
      currentActorId: "sm1",
      status: "active",
      creatorId: "st1"
    },
    // Phase 1 - Étape 18: Engagement du Marché (SB)
    {
      id: "ao-2024-005",
      reference: "AO-2024-005",
      title: "Fourniture de véhicules de service",
      description: "Acquisition de 3 véhicules utilitaires électriques pour les services techniques municipaux, incluant l'installation de bornes de recharge.",
      amount: 95000,
      division: "ADMIN",
      department: "LOGISTIQUE",
      deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 18,
      currentActorId: "sb1",
      status: "active",
      creatorId: "st1"
    },
    // Phase 2 - Étape 2: Demande de suspendre l'exécution (ST)
    {
      id: "ao-2024-006",
      reference: "AO-2024-006",
      title: "Rénovation énergétique de l'école primaire",
      description: "Isolation thermique, remplacement des fenêtres, installation d'une pompe à chaleur et de panneaux solaires photovoltaïques.",
      amount: 180000,
      division: "TECH",
      department: "BATIMENTS",
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      currentPhase: 2,
      currentStep: 2,
      currentActorId: "st1",
      status: "active",
      creatorId: "st1"
    },
    // Phase 2 - Étape 8: Réception des prestations (ST)
    {
      id: "ao-2024-007",
      reference: "AO-2024-007",
      title: "Mise en place de la vidéoprotection",
      description: "Installation de 25 caméras de vidéoprotection dans les lieux publics, centre de supervision et système de stockage sécurisé.",
      amount: 75000,
      division: "SECU",
      department: "SURVEILLANCE",
      deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      currentPhase: 2,
      currentStep: 8,
      currentActorId: "st1",
      status: "active",
      creatorId: "st1"
    },
    // Phase 2 - Étape 14: Répondre à la lettre de Mise en Demeure (SM)
    {
      id: "ao-2024-008",
      reference: "AO-2024-008",
      title: "Réhabilitation de la salle des fêtes",
      description: "Travaux de mise aux normes accessibilité, rénovation de la scène, du système d'éclairage et de sonorisation.",
      amount: 65000,
      division: "TECH",
      department: "BATIMENTS",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      currentPhase: 2,
      currentStep: 14,
      currentActorId: "sm1",
      status: "active",
      creatorId: "st1"
    },
    // Phase 3 - Étape 2: Examen du Dossier de paiement (SOR)
    {
      id: "ao-2024-009",
      reference: "AO-2024-009",
      title: "Création d'une aire de stationnement",
      description: "Aménagement d'un parking de 80 places avec bornes de recharge électrique, éclairage LED et espaces verts.",
      amount: 140000,
      division: "TECH",
      department: "AMENAGEMENT",
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      currentPhase: 3,
      currentStep: 2,
      currentActorId: "sor1",
      status: "active",
      creatorId: "st1"
    },
    // Phase 3 - Étape 10: Rejet du Dossier de Paiement par le TP (TP)
    {
      id: "ao-2024-010",
      reference: "AO-2024-010",
      title: "Fourniture de mobilier urbain",
      description: "Installation de bancs, corbeilles, jardinières et abris bus dans le centre-ville et les quartiers résidentiels.",
      amount: 35000,
      division: "TECH",
      department: "MOBILIER",
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      currentPhase: 3,
      currentStep: 10,
      currentActorId: "tp1",
      status: "active",
      creatorId: "st1"
    }
  ];

  // Insérer les appels d'offres
  for (const tender of realTenders) {
    await db.insert(tenders).values({
      reference: tender.reference,
      title: tender.title,
      description: tender.description,
      amount: tender.amount.toString(),
      division: tender.division,
      deadline: tender.deadline,
      currentPhase: tender.currentPhase,
      currentStep: tender.currentStep,
      currentActorId: tender.currentActorId,
      status: tender.status,
      createdById: tender.creatorId
    });
    console.log(`Created tender: ${tender.reference} - ${tender.title}`);
  }

  console.log(`Seeded ${realTenders.length} real tender examples successfully!`);
}