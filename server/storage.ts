import { 
  contractors, 
  vehicles, 
  documents, 
  opportunities, 
  messages, 
  jobAssignments,
  users,
  consultationRequests,
  companyConsultationRequests,
  type Contractor, 
  type InsertContractor,
  type Vehicle,
  type InsertVehicle,
  type Document,
  type InsertDocument,
  type Opportunity,
  type InsertOpportunity,
  type Message,
  type InsertMessage,
  type JobAssignment,
  type InsertJobAssignment,
  type User,
  type UpsertUser,
  type ConsultationRequest,
  type InsertConsultationRequest,
  type CompanyConsultationRequest,
  type InsertCompanyConsultationRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Contractor operations
  getContractor(id: number): Promise<Contractor | undefined>;
  createContractor(data: InsertContractor): Promise<Contractor>;
  updateContractor(id: number, data: Partial<InsertContractor>): Promise<Contractor | undefined>;
  
  // Vehicle operations
  createVehicle(data: InsertVehicle): Promise<Vehicle>;
  getContractorVehicles(contractorId: number): Promise<Vehicle[]>;
  
  // Document operations
  createDocument(data: InsertDocument): Promise<Document>;
  getContractorDocuments(contractorId: number): Promise<Document[]>;
  
  // Opportunity operations
  getAvailableOpportunities(): Promise<Opportunity[]>;
  createOpportunity(data: InsertOpportunity): Promise<Opportunity>;
  acceptOpportunity(opportunityId: number, contractorId: number): Promise<JobAssignment>;
  
  // Job operations
  getContractorJobs(contractorId: number): Promise<JobAssignment[]>;
  
  // Message operations
  getContractorMessages(contractorId: number): Promise<Message[]>;
  createMessage(data: InsertMessage): Promise<Message>;
  
  // Stats operations
  getContractorStats(contractorId: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Contractor operations
  async getContractor(id: number): Promise<Contractor | undefined> {
    const [contractor] = await db.select().from(contractors).where(eq(contractors.id, id));
    return contractor;
  }

  async createContractor(data: InsertContractor): Promise<Contractor> {
    const [contractor] = await db
      .insert(contractors)
      .values(data)
      .returning();
    return contractor;
  }

  async updateContractor(id: number, data: Partial<InsertContractor>): Promise<Contractor | undefined> {
    const [contractor] = await db
      .update(contractors)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contractors.id, id))
      .returning();
    return contractor;
  }

  // Vehicle operations
  async createVehicle(data: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values(data)
      .returning();
    return vehicle;
  }

  async getContractorVehicles(contractorId: number): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.contractorId, contractorId));
  }

  // Document operations
  async createDocument(data: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(data)
      .returning();
    return document;
  }

  async getContractorDocuments(contractorId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.contractorId, contractorId));
  }

  // Opportunity operations
  async getAvailableOpportunities(): Promise<Opportunity[]> {
    return await db.select().from(opportunities).where(eq(opportunities.status, 'available')).orderBy(desc(opportunities.createdAt));
  }

  async createOpportunity(data: InsertOpportunity): Promise<Opportunity> {
    const [opportunity] = await db
      .insert(opportunities)
      .values(data)
      .returning();
    return opportunity;
  }

  async acceptOpportunity(opportunityId: number, contractorId: number): Promise<JobAssignment> {
    // Update opportunity status
    await db
      .update(opportunities)
      .set({ 
        status: 'assigned',
        assignedContractorId: contractorId,
        updatedAt: new Date()
      })
      .where(eq(opportunities.id, opportunityId));

    // Create job assignment
    const [assignment] = await db
      .insert(jobAssignments)
      .values({
        opportunityId,
        contractorId,
        status: 'accepted'
      })
      .returning();

    return assignment;
  }

  // Job operations
  async getContractorJobs(contractorId: number): Promise<JobAssignment[]> {
    return await db.select().from(jobAssignments).where(eq(jobAssignments.contractorId, contractorId)).orderBy(desc(jobAssignments.acceptedAt));
  }

  // Message operations
  async getContractorMessages(contractorId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.contractorId, contractorId)).orderBy(desc(messages.createdAt));
  }

  async createMessage(data: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(data)
      .returning();
    return message;
  }

  // Stats operations
  async getContractorStats(contractorId: number): Promise<any> {
    const jobs = await this.getContractorJobs(contractorId);
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const activeJobs = jobs.filter(job => job.status === 'in_progress');
    
    // Mock earnings data for now
    const weeklyEarnings = completedJobs.length * 150; // Approximate
    const monthlyEarnings = completedJobs.length * 600; // Approximate
    
    return {
      completedJobs: completedJobs.length,
      activeJobs: activeJobs.length,
      totalJobs: jobs.length,
      weeklyEarnings,
      monthlyEarnings,
      rating: completedJobs.length > 0 ? '4.8' : 'N/A'
    };
  }
}

export const storage = new DatabaseStorage();