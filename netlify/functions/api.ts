import express, { type Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { z } from "zod";
import session from "express-session";
import bcrypt from "bcrypt";
import { insertTenderSchema, insertUserSchema, loginSchema, users, tenders, type User, type InsertUser, type Tender, type InsertTender } from "../../shared/schema";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

const getDatabaseUrl = () => {
  const databaseUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('Missing database connection string. Please set NETLIFY_DATABASE_URL or DATABASE_URL environment variable.');
  }
  
  return databaseUrl;
};

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

const SALT_ROUNDS = 10;

class NetlifyStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User> {
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return result[0];
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getTender(id: string): Promise<Tender | undefined> {
    const result = await db.select().from(tenders).where(eq(tenders.id, id)).limit(1);
    return result[0];
  }

  async getAllTenders(): Promise<Tender[]> {
    return db.select().from(tenders).orderBy(tenders.submissionDate);
  }

  async createTender(insertTender: InsertTender): Promise<Tender> {
    const result = await db.insert(tenders).values(insertTender).returning();
    return result[0];
  }

  async updateTender(id: string, updateData: Partial<InsertTender>): Promise<Tender> {
    const result = await db.update(tenders)
      .set(updateData)
      .where(eq(tenders.id, id))
      .returning();
    
    if (!result[0]) {
      throw new Error(`Tender with id ${id} not found`);
    }
    
    return result[0];
  }

  async deleteTender(id: string): Promise<void> {
    await db.delete(tenders).where(eq(tenders.id, id));
  }
}

const storage = new NetlifyStorage();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

function sanitizeUser(user: User): Omit<User, "password"> {
  const { password, ...sanitized } = user;
  return sanitized;
}

const app = express();
const router = express.Router();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "alteram-tender-management-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.NODE_ENV === "production" ? "https://alt-tendermanagement.netlify.app" : "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  console.log(`[NETLIFY] Incoming request: ${req.method} ${path} (original: ${req.originalUrl})`);

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    let logLine = `[NETLIFY] ${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }

    if (logLine.length > 120) {
      logLine = logLine.slice(0, 119) + "…";
    }

    console.log(logLine);
  });

  next();
});

router.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    req.session.userId = user.id;
    
    res.json(sanitizeUser(user));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/api/auth/me", async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json(sanitizeUser(user));
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users.map(sanitizeUser));
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/api/admin/users", requireAdmin, async (req, res) => {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    const existingUser = await storage.getUserByUsername(userData.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    const user = await storage.createUser({
      ...userData,
      password: hashedPassword,
    });
    
    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/api/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = insertUserSchema.partial().parse(req.body);

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, SALT_ROUNDS);
    }

    const user = await storage.updateUser(id, updateData);
    res.json(sanitizeUser(user));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.session.userId === id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    await storage.deleteUser(id);
    res.json({ message: "User deleted successfully", id });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/api/tenders", requireAuth, async (req, res) => {
  try {
    const allTenders = await storage.getAllTenders();
    res.json(allTenders);
  } catch (error) {
    console.error("Error getting tenders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/api/tenders/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const tender = await storage.getTender(id);
    
    if (!tender) {
      return res.status(404).json({ message: "Tender not found" });
    }
    
    res.json(tender);
  } catch (error) {
    console.error("Error getting tender:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/api/tenders", requireAuth, async (req, res) => {
  try {
    const tenderData = insertTenderSchema.parse(req.body);
    const tender = await storage.createTender(tenderData);
    res.status(201).json(tender);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error creating tender:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/api/tenders/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const tenderData = insertTenderSchema.parse(req.body);
    const tender = await storage.updateTender(id, tenderData);
    res.json(tender);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: error.errors });
    }
    console.error("Error updating tender:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/api/tenders/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await storage.deleteTender(id);
    res.json({ message: "Tender deleted successfully", id });
  } catch (error) {
    console.error("Error deleting tender:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/", router);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export const handler = serverless(app, {
  basePath: "/.netlify/functions/api"
});
