import express, { type Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import { storage } from "../../server/storage";
import { z } from "zod";
import { insertTenderSchema, insertUserSchema } from "../../shared/schema";
import { randomUUID } from "crypto";

const app = express();
const router = express.Router();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware for serverless environment
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Logging middleware for API requests
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    if (capturedJsonResponse) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }

    if (logLine.length > 80) {
      logLine = logLine.slice(0, 79) + "…";
    }

    console.log(logLine);
  });

  next();
});

// API Routes
router.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/users", async (req: Request, res: Response) => {
  try {
    // For demo purposes, return empty array as MemStorage doesn't have a getAll method
    res.json([]);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/users", async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    const user = await storage.createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/users/username/:username", async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error getting user by username:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Tender routes
router.get("/tenders", async (req: Request, res: Response) => {
  try {
    const allTenders = await storage.getAllTenders();
    res.json(allTenders);
  } catch (error) {
    console.error("Error getting tenders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/tenders/:id", async (req: Request, res: Response) => {
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

router.post("/tenders", async (req: Request, res: Response) => {
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

router.put("/tenders/:id", async (req: Request, res: Response) => {
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

router.delete("/tenders/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteTender(id);
    res.json({ message: "Tender deleted successfully", id });
  } catch (error) {
    console.error("Error deleting tender:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount the router
app.use("/.netlify/functions/api", router);

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// Export the serverless handler
export const handler = serverless(app);