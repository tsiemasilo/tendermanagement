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
    // For now, return the mock data until we implement database storage
    const mockTenders = [
      {
        id: '1',
        tenderNumber: 'TND-2025-001',
        clientName: 'City of Cape Town',
        description: 'Road Infrastructure Development Project including bridge repairs and traffic management system upgrades',
        briefingDate: new Date('2025-01-15T10:00:00Z'),
        submissionDate: new Date('2025-01-30T17:00:00Z'),
        venue: 'City Hall Conference Room A, 12 Hertzog Boulevard, Cape Town',
        compulsoryBriefing: true,
      },
      {
        id: '2',
        tenderNumber: 'TND-2025-002',
        clientName: 'Department of Health',
        description: 'Medical Equipment Supply Contract for provincial hospitals',
        briefingDate: new Date('2025-01-20T14:00:00Z'),
        submissionDate: new Date('2025-02-05T12:00:00Z'),
        venue: 'Provincial Health Building, Boardroom 3, Wale Street, Cape Town',
        compulsoryBriefing: false,
      },
      {
        id: '3',
        tenderNumber: 'TND-2025-003',
        clientName: 'Provincial Government',
        description: 'IT Services and Support for government departments',
        briefingDate: new Date('2025-01-25T09:00:00Z'),
        submissionDate: new Date('2025-02-10T16:00:00Z'),
        venue: 'Provincial Government Building, Meeting Room 201, 4 Dorp Street, Cape Town',
        compulsoryBriefing: true,
      },
      {
        id: '4',
        tenderNumber: 'TND-2025-004',
        clientName: 'University of Cape Town',
        description: 'Campus Security Services Contract',
        briefingDate: new Date('2025-01-18T11:00:00Z'),
        submissionDate: new Date('2025-02-01T15:00:00Z'),
        venue: 'UCT Administration Building, Senate Room, Upper Campus, Rondebosch',
        compulsoryBriefing: false,
      },
    ];
    res.json(mockTenders);
  } catch (error) {
    console.error("Error getting tenders:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/tenders/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // For now, return mock data - implement database lookup later
    res.json({ id, message: "Tender details endpoint - implement with database" });
  } catch (error) {
    console.error("Error getting tender:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/tenders", async (req: Request, res: Response) => {
  try {
    const tenderData = insertTenderSchema.parse(req.body);
    // For now, just return the submitted data with a generated ID
    const tender = { 
      id: randomUUID(),
      ...tenderData,
    };
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
    // For now, just return the updated data
    const tender = { id, ...tenderData };
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
    // For now, just return success
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