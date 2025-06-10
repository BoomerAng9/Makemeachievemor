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
  backgroundCheckProviders,
  backgroundCheckRequests,
  backgroundCheckResults,
  backgroundCheckAlerts,
  backgroundCheckAuditLog,
  driverChecklistProgress,
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
  type InsertCompanyConsultationRequest,
  type BackgroundCheckProvider,
  type InsertBackgroundCheckProvider,
  type BackgroundCheckRequest,
  type InsertBackgroundCheckRequest,
  type BackgroundCheckResult,
  type InsertBackgroundCheckResult,
  type BackgroundCheckAlert,
  type InsertBackgroundCheckAlert,
  type BackgroundCheckAuditLog,
  type InsertBackgroundCheckAuditLog,
  type DriverChecklistProgress,
  type InsertDriverChecklistProgress
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
  
  // Background check operations
  getBackgroundCheckProvider(id: number): Promise<BackgroundCheckProvider | undefined>;
  createBackgroundCheckProvider(data: InsertBackgroundCheckProvider): Promise<BackgroundCheckProvider>;
  createBackgroundCheckRequest(data: InsertBackgroundCheckRequest): Promise<BackgroundCheckRequest>;
  getBackgroundCheckRequest(id: number): Promise<BackgroundCheckRequest | undefined>;
  getBackgroundCheckRequestByExternalId(externalId: string): Promise<BackgroundCheckRequest | undefined>;
  updateBackgroundCheckRequest(id: number, data: Partial<InsertBackgroundCheckRequest>): Promise<BackgroundCheckRequest | undefined>;
  createBackgroundCheckResult(data: InsertBackgroundCheckResult): Promise<BackgroundCheckResult>;
  getContractorBackgroundCheckResults(contractorId: number): Promise<BackgroundCheckResult[]>;
  getExpiringBackgroundCheckResults(daysFromNow: number): Promise<BackgroundCheckResult[]>;
  createBackgroundCheckAlert(data: InsertBackgroundCheckAlert): Promise<BackgroundCheckAlert>;
  getContractorBackgroundCheckAlerts(contractorId: number): Promise<BackgroundCheckAlert[]>;
  createBackgroundCheckAuditLog(data: InsertBackgroundCheckAuditLog): Promise<BackgroundCheckAuditLog>;
  
  // Driver checklist progress operations
  getDriverChecklistProgress(userId: string): Promise<DriverChecklistProgress | undefined>;
  saveDriverChecklistProgress(data: InsertDriverChecklistProgress): Promise<DriverChecklistProgress>;
  clearDriverChecklistProgress(userId: string): Promise<void>;
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

  // Background check operations
  async getBackgroundCheckProvider(id: number): Promise<BackgroundCheckProvider | undefined> {
    const [provider] = await db.select().from(backgroundCheckProviders).where(eq(backgroundCheckProviders.id, id));
    return provider || undefined;
  }

  async createBackgroundCheckProvider(data: InsertBackgroundCheckProvider): Promise<BackgroundCheckProvider> {
    const [provider] = await db.insert(backgroundCheckProviders).values(data).returning();
    return provider;
  }

  async createBackgroundCheckRequest(data: InsertBackgroundCheckRequest): Promise<BackgroundCheckRequest> {
    const [request] = await db.insert(backgroundCheckRequests).values(data).returning();
    return request;
  }

  async getBackgroundCheckRequest(id: number): Promise<BackgroundCheckRequest | undefined> {
    const [request] = await db.select().from(backgroundCheckRequests).where(eq(backgroundCheckRequests.id, id));
    return request || undefined;
  }

  async getBackgroundCheckRequestByExternalId(externalId: string): Promise<BackgroundCheckRequest | undefined> {
    const [request] = await db.select().from(backgroundCheckRequests).where(eq(backgroundCheckRequests.externalRequestId, externalId));
    return request || undefined;
  }

  async updateBackgroundCheckRequest(id: number, data: Partial<InsertBackgroundCheckRequest>): Promise<BackgroundCheckRequest | undefined> {
    const [request] = await db.update(backgroundCheckRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(backgroundCheckRequests.id, id))
      .returning();
    return request || undefined;
  }

  async createBackgroundCheckResult(data: InsertBackgroundCheckResult): Promise<BackgroundCheckResult> {
    const [result] = await db.insert(backgroundCheckResults).values(data).returning();
    return result;
  }

  async getContractorBackgroundCheckResults(contractorId: number): Promise<BackgroundCheckResult[]> {
    return await db.select().from(backgroundCheckResults)
      .where(eq(backgroundCheckResults.contractorId, contractorId))
      .orderBy(desc(backgroundCheckResults.createdAt));
  }

  async getExpiringBackgroundCheckResults(daysFromNow: number): Promise<BackgroundCheckResult[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);
    
    return await db.select().from(backgroundCheckResults)
      .where(and(
        eq(backgroundCheckResults.isValid, true)
      ))
      .orderBy(backgroundCheckResults.expiryDate);
  }

  async createBackgroundCheckAlert(data: InsertBackgroundCheckAlert): Promise<BackgroundCheckAlert> {
    const [alert] = await db.insert(backgroundCheckAlerts).values(data).returning();
    return alert;
  }

  async getContractorBackgroundCheckAlerts(contractorId: number): Promise<BackgroundCheckAlert[]> {
    return await db.select().from(backgroundCheckAlerts)
      .where(and(
        eq(backgroundCheckAlerts.contractorId, contractorId),
        eq(backgroundCheckAlerts.isResolved, false)
      ))
      .orderBy(desc(backgroundCheckAlerts.createdAt));
  }

  async createBackgroundCheckAuditLog(data: InsertBackgroundCheckAuditLog): Promise<BackgroundCheckAuditLog> {
    const [log] = await db.insert(backgroundCheckAuditLog).values(data).returning();
    return log;
  }

  // Driver checklist progress operations
  async getDriverChecklistProgress(userId: string): Promise<DriverChecklistProgress | undefined> {
    const [progress] = await db.select().from(driverChecklistProgress)
      .where(eq(driverChecklistProgress.userId, userId))
      .orderBy(desc(driverChecklistProgress.updatedAt));
    return progress;
  }

  async saveDriverChecklistProgress(data: InsertDriverChecklistProgress): Promise<DriverChecklistProgress> {
    const [progress] = await db
      .insert(driverChecklistProgress)
      .values(data)
      .onConflictDoUpdate({
        target: driverChecklistProgress.userId,
        set: {
          checklistData: data.checklistData,
          completionPercentage: data.completionPercentage,
          isCompleted: data.isCompleted,
          completedAt: data.completedAt,
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
  }

  async clearDriverChecklistProgress(userId: string): Promise<void> {
    await db.delete(driverChecklistProgress).where(eq(driverChecklistProgress.userId, userId));
  }
}

export const storage = new DatabaseStorage();