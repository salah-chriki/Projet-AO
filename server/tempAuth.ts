import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getTempSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "temp-secret-key-for-development",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Allow HTTP for development
      maxAge: sessionTtl,
    },
  });
}

export async function setupTempAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getTempSession());

  // Initialize demo users
  await initializeDemoUsers();

  // Temporary login route
  app.get("/api/login", (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Connexion temporaire - Système AO</title>
          <style>
            body { font-family: Inter, sans-serif; max-width: 500px; margin: 100px auto; padding: 20px; }
            .user-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 12px 0; cursor: pointer; }
            .user-card:hover { background: #f8fafc; }
            .role-badge { background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .admin-badge { background: #1f2937; }
            h1 { color: #1e293b; }
            p { color: #64748b; }
          </style>
        </head>
        <body>
          <h1>Connexion temporaire</h1>
          <p>Choisissez un utilisateur pour tester le système:</p>
          
          <div class="user-card" onclick="login('admin1')">
            <strong>Jean Administrateur</strong> <span class="role-badge admin-badge">ADMIN</span>
            <p>Accès complet au système - Tableau de bord administrateur</p>
          </div>
          
          <div class="user-card" onclick="login('st1')">
            <strong>Marie Technique</strong> <span class="role-badge" style="background: #059669">ST</span>
            <p>Service Technique - Vue des tâches techniques</p>
          </div>
          
          <div class="user-card" onclick="login('sm1')">
            <strong>Pierre Marchés</strong> <span class="role-badge" style="background: #dc2626">SM</span>
            <p>Service Marchés - Gestion des procédures</p>
          </div>
          
          <div class="user-card" onclick="login('ce1')">
            <strong>Sophie Contrôle</strong> <span class="role-badge" style="background: #7c3aed">CE</span>
            <p>Contrôle d'État - Validation réglementaire</p>
          </div>
          
          <script>
            function login(userId) {
              fetch('/api/temp-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
              }).then(() => {
                window.location.href = '/';
              });
            }
          </script>
        </body>
      </html>
    `);
  });

  // Temporary login handler
  app.post("/api/temp-login", async (req: any, res) => {
    const { userId } = req.body;
    const user = await storage.getUser(userId);
    
    if (user) {
      req.session.userId = userId;
      req.session.user = user;
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  // Logout route
  app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  });
}

export const isTempAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = { claims: { sub: user.id } };
  return next();
};

async function initializeDemoUsers() {
  const demoUsers = [
    {
      id: "admin1",
      firstName: "Jean",
      lastName: "Administrateur",
      email: "admin@example.fr",
      role: "ADMIN" as const,
      isAdmin: true,
    },
    {
      id: "st1",
      firstName: "Marie",
      lastName: "Technique",
      email: "marie.technique@example.fr",
      role: "ST" as const,
      isAdmin: false,
    },
    {
      id: "sm1",
      firstName: "Pierre",
      lastName: "Marchés",
      email: "pierre.marches@example.fr",
      role: "SM" as const,
      isAdmin: false,
    },
    {
      id: "ce1",
      firstName: "Sophie",
      lastName: "Contrôle",
      email: "sophie.controle@example.fr",
      role: "CE" as const,
      isAdmin: false,
    },
    {
      id: "sb1",
      firstName: "Marc",
      lastName: "Budget",
      email: "marc.budget@example.fr",
      role: "SB" as const,
      isAdmin: false,
    },
    {
      id: "sor1",
      firstName: "Lucie",
      lastName: "Ordonnancement",
      email: "lucie.ordonnancement@example.fr",
      role: "SOR" as const,
      isAdmin: false,
    },
    {
      id: "tp1",
      firstName: "Paul",
      lastName: "Trésorier",
      email: "paul.tresorier@example.fr",
      role: "TP" as const,
      isAdmin: false,
    },
  ];

  for (const userData of demoUsers) {
    try {
      await storage.upsertUser(userData);
    } catch (error) {
      console.log(`Demo user ${userData.id} already exists or created`);
    }
  }
}