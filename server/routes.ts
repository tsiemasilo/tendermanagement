import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertTenderSchema, insertUserSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Tender routes with /api prefix
  
  app.get("/api/tenders", async (req, res) => {
    try {
      const allTenders = await storage.getAllTenders();
      res.json(allTenders);
    } catch (error) {
      console.error("Error getting tenders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/tenders/:id", async (req, res) => {
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

  app.post("/api/tenders", async (req, res) => {
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

  app.put("/api/tenders/:id", async (req, res) => {
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

  app.delete("/api/tenders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteTender(id);
      res.json({ message: "Tender deleted successfully", id });
    } catch (error) {
      console.error("Error deleting tender:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
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

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
