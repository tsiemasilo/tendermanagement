import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { type User, type InsertUser, type Tender, type InsertTender, users, tenders } from "@shared/schema";

// Database connection configuration
const getDatabaseUrl = () => {
  // Use NETLIFY_DATABASE_URL in production (Netlify), DATABASE_URL in development
  const isProduction = process.env.NODE_ENV === "production";
  const databaseUrl = isProduction 
    ? process.env.NETLIFY_DATABASE_URL 
    : process.env.DATABASE_URL;
    
  if (!databaseUrl) {
    throw new Error(`Missing ${isProduction ? 'NETLIFY_DATABASE_URL' : 'DATABASE_URL'} environment variable`);
  }
  
  return databaseUrl;
};

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

// Storage interface for all database operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Tender operations
  getTender(id: string): Promise<Tender | undefined>;
  getAllTenders(): Promise<Tender[]>;
  createTender(tender: InsertTender): Promise<Tender>;
  updateTender(id: string, tender: Partial<InsertTender>): Promise<Tender>;
  deleteTender(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  // Tender operations
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

export const storage = new DatabaseStorage();
