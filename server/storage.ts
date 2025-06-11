import { 
  contractors, 
  vehicles, 
  documents, 
  documentShares,
  driverLocations,
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
  userRegistrationNotifications,
  adminActivityLog,
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
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
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
  
  // Job state machine operations
  requestJob(jobId: string, userId: string): Promise<any>;
  assignJob(jobId: string, userId: string): Promise<any>;
  markJobPickedUp(jobId: string, userId: string): Promise<any>;
  markJobDelivered(jobId: string, userId: string): Promise<any>;
  markJobPaid(jobId: string, userId: string): Promise<any>;
  createJobNotification(jobId: string, userId: string, type: string): Promise<any>;
  
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
  
  // Glovebox document operations
  getUserDocuments(userId: string): Promise<Document[]>;
  uploadDocument(data: InsertDocument): Promise<Document>;
  deleteDocument(id: number, userId: string): Promise<void>;
  updateDocumentNotes(id: number, userId: string, notes: string): Promise<Document | undefined>;
  
  // Document sharing operations
  createDocumentShare(data: InsertDocumentShare): Promise<DocumentShare>;
  getDocumentShare(shareToken: string): Promise<DocumentShare | undefined>;
  getActiveDocumentShares(userId: string): Promise<DocumentShare[]>;
  deactivateDocumentShare(id: number, userId: string): Promise<void>;
  
  // Driver location operations
  upsertDriverLocation(data: InsertDriverLocation): Promise<DriverLocation>;
  getDriverLocation(userId: string): Promise<DriverLocation | undefined>;
  getNearbyDrivers(latitude: number, longitude: number, radiusMiles: number): Promise<DriverLocation[]>;
  
  // Admin operations
  getAdminStats(): Promise<any>;
  getAllUsers(search?: string, status?: string): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  performUserAction(userId: string, action: string, reason?: string, adminUserId?: string): Promise<any>;
  logAdminActivity(data: any): Promise<any>;
  getAdminActivityLog(): Promise<any[]>;
  createRegistrationNotification(data: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (for authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
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

  // Glovebox document operations
  async getUserDocuments(userId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId)).orderBy(documents.uploadedAt);
  }

  async uploadDocument(data: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(data).returning();
    return document;
  }

  async deleteDocument(id: number, userId: string): Promise<void> {
    await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
  }

  async updateDocumentNotes(id: number, userId: string, notes: string): Promise<Document | undefined> {
    const [document] = await db.update(documents)
      .set({ notes, updatedAt: new Date() })
      .where(and(eq(documents.id, id), eq(documents.userId, userId)))
      .returning();
    return document;
  }

  // Document sharing operations
  async createDocumentShare(data: InsertDocumentShare): Promise<DocumentShare> {
    const [share] = await db.insert(documentShares).values(data).returning();
    return share;
  }

  async getDocumentShare(shareToken: string): Promise<DocumentShare | undefined> {
    const [share] = await db.select().from(documentShares).where(eq(documentShares.shareToken, shareToken));
    return share;
  }

  async getActiveDocumentShares(userId: string): Promise<DocumentShare[]> {
    return await db.select().from(documentShares)
      .where(and(eq(documentShares.userId, userId), eq(documentShares.isActive, true)))
      .orderBy(documentShares.createdAt);
  }

  async deactivateDocumentShare(id: number, userId: string): Promise<void> {
    await db.update(documentShares)
      .set({ isActive: false })
      .where(and(eq(documentShares.id, id), eq(documentShares.userId, userId)));
  }

  // Driver location operations
  async upsertDriverLocation(data: InsertDriverLocation): Promise<DriverLocation> {
    const existing = await db.select().from(driverLocations).where(eq(driverLocations.userId, data.userId));
    
    if (existing.length > 0) {
      const [location] = await db.update(driverLocations)
        .set({ ...data, lastUpdated: new Date() })
        .where(eq(driverLocations.userId, data.userId))
        .returning();
      return location;
    } else {
      const [location] = await db.insert(driverLocations).values(data).returning();
      return location;
    }
  }

  async getDriverLocation(userId: string): Promise<DriverLocation | undefined> {
    const [location] = await db.select().from(driverLocations).where(eq(driverLocations.userId, userId));
    return location;
  }

  async getNearbyDrivers(latitude: number, longitude: number, radiusMiles: number): Promise<DriverLocation[]> {
    // Simple distance calculation using Haversine formula
    // For production, consider using PostGIS for better performance
    const locations = await db.select().from(driverLocations).where(eq(driverLocations.isAvailable, true));
    
    return locations.filter(location => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        parseFloat(location.latitude),
        parseFloat(location.longitude)
      );
      return distance <= radiusMiles;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Admin operations
  async getAdminStats(): Promise<any> {
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const activeUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.accountStatus, 'active'));
    const pendingVerifications = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.verificationStatus, 'pending'));
    const suspendedUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.accountStatus, 'suspended'));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newRegistrationsToday = await db.select({ count: sql<number>`count(*)` }).from(users).where(gte(users.createdAt, today));
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newRegistrationsThisWeek = await db.select({ count: sql<number>`count(*)` }).from(users).where(gte(users.createdAt, weekAgo));
    
    return {
      totalUsers: totalUsers[0]?.count || 0,
      activeUsers: activeUsers[0]?.count || 0,
      pendingVerifications: pendingVerifications[0]?.count || 0,
      suspendedUsers: suspendedUsers[0]?.count || 0,
      newRegistrationsToday: newRegistrationsToday[0]?.count || 0,
      newRegistrationsThisWeek: newRegistrationsThisWeek[0]?.count || 0,
    };
  }

  async getAllUsers(search?: string, status?: string): Promise<User[]> {
    let query = db.select().from(users);
    
    if (status && status !== 'all') {
      query = query.where(eq(users.accountStatus, status));
    }
    
    if (search) {
      query = query.where(
        or(
          ilike(users.email, `%${search}%`),
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`)
        )
      );
    }
    
    return await query.orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async performUserAction(userId: string, action: string, reason?: string, adminUserId?: string): Promise<any> {
    let updateData: any = { updatedAt: new Date() };
    
    switch (action) {
      case 'suspend':
        updateData.accountStatus = 'suspended';
        break;
      case 'activate':
        updateData.accountStatus = 'active';
        break;
      case 'verify':
        updateData.verificationStatus = 'verified';
        break;
      case 'ban':
        updateData.accountStatus = 'banned';
        break;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return { user, action, reason };
  }

  async logAdminActivity(data: any): Promise<any> {
    const [activity] = await db
      .insert(adminActivityLog)
      .values({
        adminUserId: data.adminUserId,
        targetUserId: data.targetUserId,
        action: data.action,
        actionDetails: data.actionDetails,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      })
      .returning();
    return activity;
  }

  async getAdminActivityLog(): Promise<any[]> {
    return await db
      .select()
      .from(adminActivityLog)
      .orderBy(desc(adminActivityLog.createdAt))
      .limit(100);
  }

  async createRegistrationNotification(data: any): Promise<any> {
    const [notification] = await db
      .insert(userRegistrationNotifications)
      .values(data)
      .returning();
    return notification;
  }

  // Job state machine operations - implements: open → requested → assigned → picked_up → delivered → paid
  async requestJob(jobId: string, userId: string): Promise<any> {
    // Update opportunity status to 'requested' and set lock with 5-minute TTL
    const lockExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    
    const [updatedOpportunity] = await db
      .update(opportunities)
      .set({
        status: 'requested',
        assigned_to: userId,
        requestedAt: new Date(),
        lockExpiresAt: lockExpiry,
        updatedAt: new Date()
      })
      .where(eq(opportunities.id, jobId))
      .returning();
    
    return updatedOpportunity;
  }

  async assignJob(jobId: string, userId: string): Promise<any> {
    // Admin action: requested → assigned
    const [updatedOpportunity] = await db
      .update(opportunities)
      .set({
        status: 'assigned',
        assignedAt: new Date(),
        lockExpiresAt: null, // Remove lock once assigned
        updatedAt: new Date()
      })
      .where(eq(opportunities.id, jobId))
      .returning();
    
    return updatedOpportunity;
  }

  async markJobPickedUp(jobId: string, userId: string): Promise<any> {
    // Driver action: assigned → picked_up
    const [updatedOpportunity] = await db
      .update(opportunities)
      .set({
        status: 'picked_up',
        pickedUpAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(opportunities.id, jobId))
      .returning();
    
    return updatedOpportunity;
  }

  async markJobDelivered(jobId: string, userId: string): Promise<any> {
    // Driver action: picked_up → delivered
    const [updatedOpportunity] = await db
      .update(opportunities)
      .set({
        status: 'delivered',
        deliveredAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(opportunities.id, jobId))
      .returning();
    
    return updatedOpportunity;
  }

  async markJobPaid(jobId: string, userId: string): Promise<any> {
    // Admin action: delivered → paid
    const [updatedOpportunity] = await db
      .update(opportunities)
      .set({
        status: 'paid',
        paidAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(opportunities.id, jobId))
      .returning();
    
    return updatedOpportunity;
  }

  async createJobNotification(jobId: string, userId: string, type: string): Promise<any> {
    // Create notification for admin about job status changes
    const notificationData = {
      type: 'job_notification',
      title: `Job ${type.replace('_', ' ')}`,
      message: `Job ${jobId} has been ${type.replace('_', ' ')} by user ${userId}`,
      userId: 'admin', // Send to admin
      isRead: false,
      createdAt: new Date()
    };
    
    // For now, just log the notification - can be enhanced with actual notification system
    console.log('Job Notification:', notificationData);
    return notificationData;
  }
}

export const storage = new DatabaseStorage();