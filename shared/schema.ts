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

// User authentication table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
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

// Documents table for storing uploaded files
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  contractorId: integer("contractor_id").notNull().references(() => contractors.id),
  documentType: text("document_type").notNull(), // drivers_license, insurance, vehicle_registration, dot_certificate, etc.
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, approved, rejected
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Opportunities/Jobs table
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  pickupLocation: text("pickup_location").notNull(),
  deliveryLocation: text("delivery_location").notNull(),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 8 }),
  pickupLongitude: decimal("pickup_longitude", { precision: 11, scale: 8 }),
  deliveryLatitude: decimal("delivery_latitude", { precision: 10, scale: 8 }),
  deliveryLongitude: decimal("delivery_longitude", { precision: 11, scale: 8 }),
  distance: decimal("distance", { precision: 8, scale: 2 }),
  weight: integer("weight"), // in pounds
  payment: decimal("payment", { precision: 10, scale: 2 }).notNull(),
  pickupTime: timestamp("pickup_time"),
  deliveryTime: timestamp("delivery_time"),
  jobType: text("job_type").notNull().default("standard"), // express, standard
  category: text("category").notNull().default("commercial"), // commercial, residential
  status: text("status").notNull().default("available"), // available, assigned, completed, cancelled
  assignedContractorId: integer("assigned_contractor_id").references(() => contractors.id),
  requirements: jsonb("requirements"), // array of requirements like CDL, DOT, etc.
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
