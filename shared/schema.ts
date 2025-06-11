import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, decimal, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User authentication table - following outlined structure
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  phoneNumber: varchar("phone_number").unique(), // For SMS authentication
  name: varchar("name").notNull(), // Combined name field as per outline
  role: varchar("role").notNull().default("driver"), // driver | company | admin
  status: varchar("status").notNull().default("pending_verification"), // pending_verification | active | suspended
  profile: jsonb("profile"), // { avatar, brand_color }
  firstName: varchar("first_name"), // Keep for backward compatibility
  lastName: varchar("last_name"), // Keep for backward compatibility
  profileImageUrl: varchar("profile_image_url"),
  lastLoginAt: timestamp("last_login_at"),
  registrationSource: varchar("registration_source").default("web"),
  // Subscription fields
  subscriptionTier: varchar("subscription_tier").default("coffee"), // coffee | standard | professional | owner-operator
  subscriptionStatus: varchar("subscription_status").default("inactive"), // inactive | active | canceled | past_due
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  companyName: varchar("company_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Driver Checklist Progress table
export const driverChecklistProgress = pgTable("driver_checklist_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  checklistData: jsonb("checklist_data").notNull(),
  completionPercentage: integer("completion_percentage").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contractors table
export const contractors = pgTable("contractors", {
  id: serial("id").primaryKey(),
  // Personal Information
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  // Address
  street: text("street").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default("USA"),
  // Verification status
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, verified, rejected
  onboardingStep: integer("onboarding_step").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  // DOT and compliance
  dotNumber: text("dot_number"),
  mcNumber: text("mc_number"),
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").notNull().references(() => contractors.id),
  vehicleType: text("vehicle_type").notNull(), // van, box_truck, semi_truck, pickup_truck
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model"),
  licensePlate: text("license_plate"),
  vinNumber: text("vin_number"),
  insuranceExpiry: text("insurance_expiry"),
  registrationExpiry: text("registration_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents table for storing uploaded files (Glovebox system)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // For user-based storage
  contractorId: integer("contractor_id").references(() => contractors.id), // For contractor-based storage
  documentType: text("document_type").notNull(), // insurance, vehicle_registration, dot_certificate, medical_card, etc. (NEVER drivers_license - not stored)
  documentCategory: text("document_category").notNull(), // compliance, vehicle, business, certification
  fileName: text("file_name").notNull(),
  originalFileName: text("original_file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  expirationDate: timestamp("expiration_date"), // For documents that expire
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, approved, rejected
  tags: text("tags").array(), // Searchable tags
  notes: text("notes"), // User notes about the document
  isShared: boolean("is_shared").notNull().default(false), // Can be shared with companies
  shareableUntil: timestamp("shareable_until"), // Expiry for sharing access
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Driver locations for load matching
export const driverLocations = pgTable("driver_locations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contractorId: integer("contractor_id").references(() => contractors.id),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  isAvailable: boolean("is_available").notNull().default(true),
  vehicleType: text("vehicle_type"), // For load matching
  maxDistance: integer("max_distance").default(100), // Miles willing to travel
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Document sharing sessions for fast credential sharing
export const documentShares = pgTable("document_shares", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shareToken: varchar("share_token").notNull().unique(),
  documentIds: integer("document_ids").array().notNull(),
  recipientCompany: text("recipient_company"),
  recipientEmail: text("recipient_email"),
  message: text("message"),
  expiresAt: timestamp("expires_at").notNull(),
  viewCount: integer("view_count").notNull().default(0),
  maxViews: integer("max_views").default(5),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Jobs/Loads table - following outlined structure and state machine
export const opportunities = pgTable("opportunities", {
  id: varchar("id").primaryKey().notNull(), // job-789 format
  posted_by: varchar("posted_by").notNull(), // company-456 format (user ID)
  assigned_to: varchar("assigned_to"), // driver-123 format (user ID) | null
  origin: text("origin").notNull(), // "Pooler, GA"
  destination: text("destination").notNull(), // "Jacksonville, FL"
  miles: decimal("miles", { precision: 8, scale: 1 }).notNull(), // 140.2
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(), // 320.0
  priority: varchar("priority").notNull().default("standard"), // standard | express
  status: varchar("status").notNull().default("open"), // open | requested | assigned | picked_up | delivered | paid
  
  // Additional fields for functionality
  title: text("title").notNull(),
  description: text("description"),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 8 }),
  pickupLongitude: decimal("pickup_longitude", { precision: 11, scale: 8 }),
  deliveryLatitude: decimal("delivery_latitude", { precision: 10, scale: 8 }),
  deliveryLongitude: decimal("delivery_longitude", { precision: 11, scale: 8 }),
  weight: integer("weight"), // in pounds
  pickupTime: timestamp("pickup_time"),
  deliveryTime: timestamp("delivery_time"),
  requirements: jsonb("requirements"), // array of requirements like CDL, DOT, etc.
  
  // State machine tracking
  requestedAt: timestamp("requested_at"), // When driver requested
  assignedAt: timestamp("assigned_at"), // When admin assigned
  pickedUpAt: timestamp("picked_up_at"), // When driver marked picked up
  deliveredAt: timestamp("delivered_at"), // When driver marked delivered
  paidAt: timestamp("paid_at"), // When admin marked paid
  lockExpiresAt: timestamp("lock_expires_at"), // 5-minute TTL lock
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages table for contractor communication
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").notNull().references(() => contractors.id),
  senderId: text("sender_id").notNull(), // system, customer, dispatch
  senderName: text("sender_name").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  messageType: text("message_type").notNull().default("general"), // general, job_update, system_notification
  relatedOpportunityId: integer("related_opportunity_id").references(() => opportunities.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job assignments and tracking
export const jobAssignments = pgTable("job_assignments", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").notNull().references(() => opportunities.id),
  contractorId: integer("contractor_id").notNull().references(() => contractors.id),
  status: text("status").notNull().default("accepted"), // accepted, in_progress, completed, cancelled
  acceptedAt: timestamp("accepted_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
});

// File storage for secure document management
export const fileStorage = pgTable("file_storage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  contractorId: integer("contractor_id").references(() => contractors.id),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // 'document', 'image', 'avatar', 'certificate'
  isPublic: boolean("is_public").default(false),
  encryptionKey: varchar("encryption_key", { length: 255 }),
  metadata: jsonb("metadata"), // Additional file information
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// User profiles and customization
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  contractorId: integer("contractor_id").references(() => contractors.id),
  displayName: varchar("display_name", { length: 255 }),
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  socialLinks: jsonb("social_links"), // {facebook, twitter, linkedin, instagram}
  profilePictureId: integer("profile_picture_id").references(() => fileStorage.id),
  bannerImageId: integer("banner_image_id").references(() => fileStorage.id),
  theme: varchar("theme", { length: 50 }).default("light"), // 'light', 'dark', 'auto'
  customColors: jsonb("custom_colors"), // Custom theme colors
  isPublicProfile: boolean("is_public_profile").default(false),
  showAvailability: boolean("show_availability").default(true),
  showContactInfo: boolean("show_contact_info").default(false),
  shareableUrl: varchar("shareable_url", { length: 100 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Availability and sharing settings
export const contractorAvailability = pgTable("contractor_availability", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").references(() => contractors.id),
  isAvailable: boolean("is_available").default(true),
  availableFrom: timestamp("available_from"),
  availableUntil: timestamp("available_until"),
  preferredRoutes: jsonb("preferred_routes"), // Array of route preferences
  equipmentTypes: text("equipment_types").array(),
  maxDistance: integer("max_distance"), // Miles
  minRate: decimal("min_rate", { precision: 10, scale: 2 }),
  specialServices: text("special_services").array(),
  notes: text("notes"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// External integrations and connections
export const externalConnections = pgTable("external_connections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  contractorId: integer("contractor_id").references(() => contractors.id),
  platform: varchar("platform", { length: 100 }).notNull(), // 'dat', 'truckstop', 'facebook', 'linkedin'
  connectionType: varchar("connection_type", { length: 50 }).notNull(), // 'load_board', 'social_media', 'company'
  credentials: jsonb("credentials"), // Encrypted connection details
  isActive: boolean("is_active").default(true),
  lastSync: timestamp("last_sync"),
  settings: jsonb("settings"), // Platform-specific settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Business consultation requests
export const consultationRequests = pgTable("consultation_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  contractorId: integer("contractor_id").references(() => contractors.id),
  requestType: varchar("request_type", { length: 100 }).notNull(), // 'business_setup', 'growth', 'automation', 'marketing'
  businessStage: varchar("business_stage", { length: 100 }), // 'startup', 'established', 'scaling'
  description: text("description").notNull(),
  currentChallenges: text("current_challenges").array(),
  goals: text("goals").array(),
  timeline: varchar("timeline", { length: 100 }),
  budget: varchar("budget", { length: 100 }),
  contactPreference: varchar("contact_preference", { length: 50 }).default("email"),
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'reviewed', 'contacted', 'closed'
  priority: varchar("priority", { length: 20 }).default("medium"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  notes: text("notes"),
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Company consultation requests
export const companyConsultationRequests = pgTable("company_consultation_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  serviceType: varchar("service_type", { length: 100 }).notNull(), // 'dedicated_drivers', 'logistics_management', 'digital_transformation'
  companySize: varchar("company_size", { length: 100 }),
  currentFleetSize: integer("current_fleet_size"),
  description: text("description").notNull(),
  currentChallenges: text("current_challenges").array(),
  goals: text("goals").array(),
  timeline: varchar("timeline", { length: 100 }),
  budget: varchar("budget", { length: 100 }),
  operationalAreas: text("operational_areas").array(),
  technologyNeeds: text("technology_needs").array(),
  status: varchar("status", { length: 50 }).default("pending"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  notes: text("notes"),
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Social media sharing activities
export const socialMediaShares = pgTable("social_media_shares", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  contractorId: integer("contractor_id").references(() => contractors.id),
  platform: varchar("platform", { length: 50 }).notNull(), // 'facebook', 'twitter', 'linkedin', 'instagram'
  contentType: varchar("content_type", { length: 100 }).notNull(), // 'availability', 'profile', 'achievement'
  contentId: varchar("content_id", { length: 255 }),
  shareUrl: varchar("share_url", { length: 500 }),
  engagement: jsonb("engagement"), // likes, shares, comments
  sharedAt: timestamp("shared_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Background check integration tables
export const backgroundCheckProviders = pgTable("background_check_providers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  apiEndpoint: varchar("api_endpoint"),
  isActive: boolean("is_active").default(true),
  supportedChecks: jsonb("supported_checks"), // Array of check types supported
  averageProcessingTime: integer("average_processing_time"), // Minutes
  costPerCheck: decimal("cost_per_check"),
  configuration: jsonb("configuration"), // Provider-specific config
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const backgroundCheckRequests = pgTable("background_check_requests", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").references(() => contractors.id),
  providerId: integer("provider_id").references(() => backgroundCheckProviders.id),
  requestType: varchar("request_type").notNull(), // 'mvr', 'criminal', 'employment', 'drug_test', 'full'
  status: varchar("status").notNull(), // 'pending', 'in_progress', 'completed', 'failed', 'cancelled'
  externalRequestId: varchar("external_request_id"), // Provider's request ID
  requestData: jsonb("request_data"), // Data sent to provider
  priority: varchar("priority").default('standard'), // 'urgent', 'standard', 'low'
  estimatedCompletion: timestamp("estimated_completion"),
  actualCompletion: timestamp("actual_completion"),
  cost: decimal("cost"),
  requestedBy: varchar("requested_by"), // User ID who initiated
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const backgroundCheckResults = pgTable("background_check_results", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => backgroundCheckRequests.id),
  contractorId: integer("contractor_id").references(() => contractors.id),
  checkType: varchar("check_type").notNull(),
  status: varchar("status").notNull(), // 'clear', 'flagged', 'failed', 'inconclusive'
  overallResult: varchar("overall_result").notNull(), // 'pass', 'fail', 'review_required'
  score: integer("score"), // Numerical score if applicable
  findings: jsonb("findings"), // Detailed findings from the check
  documents: jsonb("documents"), // Associated document URLs/IDs
  verificationDate: timestamp("verification_date"),
  expiryDate: timestamp("expiry_date"),
  reviewNotes: text("review_notes"),
  reviewedBy: varchar("reviewed_by"), // User ID who reviewed
  isValid: boolean("is_valid").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const backgroundCheckAlerts = pgTable("background_check_alerts", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").references(() => contractors.id),
  resultId: integer("result_id").references(() => backgroundCheckResults.id),
  alertType: varchar("alert_type").notNull(), // 'expiring', 'failed', 'review_required', 'renewal_needed'
  severity: varchar("severity").notNull(), // 'low', 'medium', 'high', 'critical'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  actionRequired: text("action_required"),
  dueDate: timestamp("due_date"),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User registration notifications to admin
export const userRegistrationNotifications = pgTable("user_registration_notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  notificationSent: boolean("notification_sent").default(false),
  sentAt: timestamp("sent_at"),
  adminNotified: boolean("admin_notified").default(false),
  requiresApproval: boolean("requires_approval").default(false),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin activity log
export const adminActivityLog = pgTable("admin_activity_log", {
  id: serial("id").primaryKey(),
  adminUserId: varchar("admin_user_id").notNull().references(() => users.id),
  targetUserId: varchar("target_user_id").references(() => users.id),
  action: varchar("action").notNull(), // user_approved, user_suspended, settings_changed, etc.
  actionDetails: jsonb("action_details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const backgroundCheckTemplates = pgTable("background_check_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  checkTypes: jsonb("check_types").notNull(), // Array of check types to include
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  requirements: jsonb("requirements"), // Specific requirements for each check type
  automatedTriggers: jsonb("automated_triggers"), // When to automatically run
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const backgroundCheckAuditLog = pgTable("background_check_audit_log", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").references(() => contractors.id),
  requestId: integer("request_id").references(() => backgroundCheckRequests.id),
  action: varchar("action").notNull(), // 'requested', 'completed', 'reviewed', 'approved', 'rejected'
  performedBy: varchar("performed_by").notNull(), // User ID
  details: jsonb("details"), // Additional action details
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const insertContractorSchema = createInsertSchema(contractors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertJobAssignmentSchema = createInsertSchema(jobAssignments).omit({
  id: true,
  acceptedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertFileStorageSchema = createInsertSchema(fileStorage).omit({
  id: true,
  uploadedAt: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDriverChecklistProgressSchema = createInsertSchema(driverChecklistProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContractorAvailabilitySchema = createInsertSchema(contractorAvailability).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertExternalConnectionSchema = createInsertSchema(externalConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConsultationRequestSchema = createInsertSchema(consultationRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanyConsultationRequestSchema = createInsertSchema(companyConsultationRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSocialMediaShareSchema = createInsertSchema(socialMediaShares).omit({
  id: true,
  sharedAt: true,
  createdAt: true,
});

export const insertBackgroundCheckProviderSchema = createInsertSchema(backgroundCheckProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBackgroundCheckRequestSchema = createInsertSchema(backgroundCheckRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBackgroundCheckResultSchema = createInsertSchema(backgroundCheckResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBackgroundCheckAlertSchema = createInsertSchema(backgroundCheckAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBackgroundCheckTemplateSchema = createInsertSchema(backgroundCheckTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBackgroundCheckAuditLogSchema = createInsertSchema(backgroundCheckAuditLog).omit({
  id: true,
  createdAt: true,
});

export const insertDriverLocationSchema = createInsertSchema(driverLocations).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentShareSchema = createInsertSchema(documentShares).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = z.infer<typeof insertContractorSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type JobAssignment = typeof jobAssignments.$inferSelect;
export type InsertJobAssignment = z.infer<typeof insertJobAssignmentSchema>;
export type FileStorage = typeof fileStorage.$inferSelect;
export type InsertFileStorage = z.infer<typeof insertFileStorageSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type ContractorAvailability = typeof contractorAvailability.$inferSelect;
export type InsertContractorAvailability = z.infer<typeof insertContractorAvailabilitySchema>;
export type ExternalConnection = typeof externalConnections.$inferSelect;
export type InsertExternalConnection = z.infer<typeof insertExternalConnectionSchema>;
export type ConsultationRequest = typeof consultationRequests.$inferSelect;
export type InsertConsultationRequest = z.infer<typeof insertConsultationRequestSchema>;
export type CompanyConsultationRequest = typeof companyConsultationRequests.$inferSelect;
export type InsertCompanyConsultationRequest = z.infer<typeof insertCompanyConsultationRequestSchema>;
export type SocialMediaShare = typeof socialMediaShares.$inferSelect;
export type InsertSocialMediaShare = z.infer<typeof insertSocialMediaShareSchema>;
export type BackgroundCheckProvider = typeof backgroundCheckProviders.$inferSelect;
export type InsertBackgroundCheckProvider = z.infer<typeof insertBackgroundCheckProviderSchema>;
export type BackgroundCheckRequest = typeof backgroundCheckRequests.$inferSelect;
export type InsertBackgroundCheckRequest = z.infer<typeof insertBackgroundCheckRequestSchema>;
export type BackgroundCheckResult = typeof backgroundCheckResults.$inferSelect;
export type InsertBackgroundCheckResult = z.infer<typeof insertBackgroundCheckResultSchema>;
export type BackgroundCheckAlert = typeof backgroundCheckAlerts.$inferSelect;
export type InsertBackgroundCheckAlert = z.infer<typeof insertBackgroundCheckAlertSchema>;
export type BackgroundCheckTemplate = typeof backgroundCheckTemplates.$inferSelect;
export type InsertBackgroundCheckTemplate = z.infer<typeof insertBackgroundCheckTemplateSchema>;
export type BackgroundCheckAuditLog = typeof backgroundCheckAuditLog.$inferSelect;
export type InsertBackgroundCheckAuditLog = z.infer<typeof insertBackgroundCheckAuditLogSchema>;
export type DriverLocation = typeof driverLocations.$inferSelect;
export type InsertDriverLocation = z.infer<typeof insertDriverLocationSchema>;
export type DocumentShare = typeof documentShares.$inferSelect;
export type InsertDocumentShare = z.infer<typeof insertDocumentShareSchema>;

export type DriverChecklistProgress = typeof driverChecklistProgress.$inferSelect;
export type InsertDriverChecklistProgress = z.infer<typeof insertDriverChecklistProgressSchema>;
