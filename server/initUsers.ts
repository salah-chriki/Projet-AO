import bcrypt from "bcrypt";
import { storage } from "./storage";

export async function initializeDemoUsers() {
  try {
    const demoUsers = [
      {
        id: "admin1",
        username: "admin1", 
        password: await bcrypt.hash("admin123", 10),
        email: "admin@example.com",
        firstName: "Admin",
        lastName: "Principal",
        role: "ADMIN",
        direction: "DAF",
        division: "DSI",
        isAdmin: true,
        isActive: true,
      },
      {
        id: "st1",
        username: "st1",
        password: await bcrypt.hash("st123", 10),
        email: "marie.technique@example.com",
        firstName: "Marie",
        lastName: "Technique",
        role: "ST",
        direction: "DIL",
        division: "DSI",
        isAdmin: false,
        isActive: true,
      },
      {
        id: "sm1",
        username: "sm1",
        password: await bcrypt.hash("sm123", 10),
        email: "jean.superviseur@example.com",
        firstName: "Jean",
        lastName: "Superviseur",
        role: "SM",
        direction: "DCPA",
        division: "DCSP",
        isAdmin: false,
        isActive: true,
      },
      {
        id: "ce1",
        username: "ce1",
        password: await bcrypt.hash("ce123", 10),
        email: "claire.chef@example.com",
        firstName: "Claire",
        lastName: "Chef",
        role: "CE",
        direction: "DAF",
        division: "DF",
        isAdmin: false,
        isActive: true,
      },
    ];

    for (const userData of demoUsers) {
      try {
        const existingUser = await storage.getUserByUsername(userData.username);
        if (!existingUser) {
          await storage.createUser(userData);
          console.log(`Demo user ${userData.username} created`);
        } else {
          console.log(`Demo user ${userData.username} already exists`);
        }
      } catch (error) {
        console.log(`Demo user ${userData.username} already exists or created`);
      }
    }
  } catch (error) {
    console.error("Error initializing demo users:", error);
  }
}