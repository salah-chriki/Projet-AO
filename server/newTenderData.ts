import { db } from "./db";
import { tenders, tenderStepHistory } from "@shared/schema";

export async function createPhase1Step1Tenders() {
  console.log("Creating 10 tenders at Phase 1, Step 1 for different directions...");
  
  // Check if tenders already exist to avoid foreign key conflicts
  const existingTenders = await db.select().from(tenders);
  if (existingTenders.length >= 10) {
    console.log("Tenders already exist, skipping creation...");
    return;
  }

  // Create 10 tenders at Phase 1, Step 1 for different directions
  const newTenders = [
    {
      reference: "AO-DAF-2024-001",
      title: "Acquisition de logiciels de gestion financière",
      description: "Fourniture et installation d'un système intégré de gestion financière pour optimiser les processus budgétaires et comptables de la direction administrative et financière.",
      amount: "180000",
      division: "DSI",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      createdById: "st1"
    },
    {
      reference: "AO-DPPAV-2024-001", 
      title: "Aménagement d'espaces verts publics",
      description: "Création et aménagement d'un nouveau parc urbain incluant plantations, mobilier urbain, système d'arrosage automatique et éclairage LED écologique.",
      amount: "320000",
      division: "DCSP",
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      createdById: "st1"
    },
    {
      reference: "AO-DCPA-2024-001",
      title: "Réhabilitation du centre culturel municipal",
      description: "Travaux de rénovation complète du centre culturel incluant mise aux normes accessibilité, réfection des salles de spectacle et modernisation des équipements techniques.",
      amount: "750000",
      division: "DCPVOV",
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      createdById: "st1"
    },
    {
      reference: "AO-DIL-2024-001",
      title: "Fourniture et installation d'équipements informatiques",
      description: "Acquisition de 100 postes de travail, serveurs, équipements réseau et logiciels pour moderniser l'infrastructure informatique municipale.",
      amount: "250000",
      division: "DIC",
      deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      createdById: "st1"
    },
    {
      reference: "AO-DERAJ-2024-001",
      title: "Amélioration de la collecte des déchets",
      description: "Acquisition de véhicules de collecte électriques et conteneurs intelligents pour optimiser la gestion des déchets municipaux et réduire l'empreinte carbone.",
      amount: "420000",
      division: "DERSP",
      deadline: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      createdById: "st1"
    },
    {
      reference: "AO-DCC-2024-001",
      title: "Rénovation de la mairie - Façade principale",
      description: "Travaux de ravalement et d'isolation thermique de la façade principale de l'hôtel de ville avec mise aux normes énergétiques actuelles.",
      amount: "195000",
      division: "DCC",
      deadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      createdById: "st1"
    },
    {
      reference: "AO-DCGAI-2024-001",
      title: "Modernisation du système de vidéosurveillance",
      description: "Installation d'un nouveau système de vidéoprotection urbaine avec caméras haute définition, centre de supervision et logiciel de gestion intégré.",
      amount: "380000",
      division: "DCGAI",
      deadline: new Date(Date.now() + 47 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      createdById: "st1"
    },
    {
      reference: "AO-DAF-2024-002",
      title: "Formation du personnel aux nouvelles technologies",
      description: "Programme de formation continue pour 150 agents municipaux sur les outils numériques, gestion de projet et développement durable.",
      amount: "85000",
      division: "DRHS",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      createdById: "st1"
    },
    {
      reference: "AO-DPPAV-2024-002",
      title: "Réfection des voiries communales",
      description: "Travaux de réfection de 5 kilomètres de voirie urbaine incluant enrobé, marquage au sol, signalisation verticale et aménagements cyclables.",
      amount: "890000",
      division: "DSA",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      createdById: "st1"
    },
    {
      reference: "AO-DIL-2024-002",
      title: "Équipement en mobilier urbain connecté",
      description: "Installation de bancs connectés, bornes WiFi publiques, panneaux d'information digitaux et stations de recharge pour véhicules électriques.",
      amount: "275000",
      division: "DL",
      deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
      currentPhase: 1,
      currentStep: 1,
      currentActorId: "st1",
      status: "active",
      createdById: "st1"
    }
  ];

  // Insert all tenders
  for (const tender of newTenders) {
    await db.insert(tenders).values(tender);
    console.log(`Created tender: ${tender.reference} - ${tender.title}`);
  }

  console.log(`Successfully created ${newTenders.length} tenders at Phase 1, Step 1!`);
}