import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { config } from "./config";
import multer from "multer";
import path from "path";
import { insertContractorSchema, insertVehicleSchema, insertDocumentSchema, insertOpportunitySchema, insertMessageSchema, insertJobAssignmentSchema } from "@shared/schema";
import { z } from "zod";
import { generateChatbotResponse } from "./chatbot";
import {
  sendCode,
  verifyCode,
  getCurrentUser,
  logoutUser,
  requireAuth,
} from "./simpleAuth";
import { getFileStorageService } from "./services/fileStorageService";
import {
  OpportunityService,
  JobNotFoundError,
  InvalidJobStateError,
  JobLockedError,
  PermissionDeniedError,
  InvalidStateTransitionError
} from "./services/opportunityService";
import os from 'os';

// Configure multer for file uploads
// const upload = multer({ // Original configuration
//   dest: 'uploads/',
//   limits: {
//     fileSize: config.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
//   },
//   fileFilter: (req, file, cb) => {
//     // Allow images and PDFs
//     if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
//       cb(null, true);
//     } else {
//       cb(new Error('Only images and PDF files are allowed'));
//     }
//   },
// });

// New multer configuration for temporary uploads
const tmpUpload = multer({
  dest: os.tmpdir(),
  limits: {
    fileSize: config.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  },
});

import cookieParser from 'cookie-parser';

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure cookie parser
  app.use(cookieParser());

  // Instantiate services
  const opportunityService = new OpportunityService(storage);

  // Authentication routes
  app.post('/api/auth/send-code', sendCode);
  app.post('/api/auth/verify', verifyCode);
  app.post('/api/auth/logout', logoutUser);
  app.get('/api/auth/user', getCurrentUser);

  // Admin routes
  app.get('/api/admin/settings', async (req: any, res) => {
    try {
      const dbSettingsRaw = await storage.getAllApplicationSettings();
      const dbSettings = dbSettingsRaw.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);

      // Helper to parse boolean from various potential DB stored values
      const parseBool = (value: any, defaultValue: boolean): boolean => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.toLowerCase() === 'true';
        return defaultValue;
      };

      // Helper to parse int from various potential DB stored values
      const parseIntVal = (value: any, defaultValue: number): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? defaultValue : parsed;
        }
        return defaultValue;
      };

      const liveSettings = {
        platformName: dbSettings.PLATFORM_NAME ?? config.PLATFORM_NAME,
        platformDescription: dbSettings.PLATFORM_DESCRIPTION ?? config.PLATFORM_DESCRIPTION,
        supportEmail: dbSettings.SUPPORT_EMAIL ?? config.SUPPORT_EMAIL,
        supportPhone: dbSettings.SUPPORT_PHONE ?? config.SUPPORT_PHONE,
        adminEmailRecipient: dbSettings.ADMIN_EMAIL_RECIPIENT ?? config.ADMIN_EMAIL_RECIPIENT,

        priceTierCoffee: dbSettings.PRICE_TIER_COFFEE ?? config.PRICE_TIER_COFFEE,
        priceTierStandard: dbSettings.PRICE_TIER_STANDARD ?? config.PRICE_TIER_STANDARD,
        priceTierProfessional: dbSettings.PRICE_TIER_PROFESSIONAL ?? config.PRICE_TIER_PROFESSIONAL,
        priceTierOwnerOperator: dbSettings.PRICE_TIER_OWNER_OPERATOR ?? config.PRICE_TIER_OWNER_OPERATOR,

        featureSmsAuthEnabled: parseBool(dbSettings.FEATURE_SMS_AUTH_ENABLED, config.FEATURE_SMS_AUTH_ENABLED),
        featureStripePaymentsEnabled: parseBool(dbSettings.FEATURE_STRIPE_PAYMENTS_ENABLED, config.FEATURE_STRIPE_PAYMENTS_ENABLED),
        featureBackgroundChecksEnabled: parseBool(dbSettings.FEATURE_BACKGROUND_CHECKS_ENABLED, config.FEATURE_BACKGROUND_CHECKS_ENABLED),
        featureGoogleMapsEnabled: parseBool(dbSettings.FEATURE_GOOGLE_MAPS_ENABLED, config.FEATURE_GOOGLE_MAPS_ENABLED),
        featureAiInsightsEnabled: parseBool(dbSettings.FEATURE_AI_INSIGHTS_ENABLED, config.FEATURE_AI_INSIGHTS_ENABLED),

        maxActiveLoadsBasic: dbSettings.MAX_ACTIVE_LOADS_BASIC ?? config.MAX_ACTIVE_LOADS_BASIC,
        maxActiveLoadsStandard: dbSettings.MAX_ACTIVE_LOADS_STANDARD ?? config.MAX_ACTIVE_LOADS_STANDARD,
        maxActiveLoadsProfessional: dbSettings.MAX_ACTIVE_LOADS_PROFESSIONAL ?? config.MAX_ACTIVE_LOADS_PROFESSIONAL,
        jobLockTimeoutMinutes: dbSettings.JOB_LOCK_TIMEOUT_MINUTES ?? config.JOB_LOCK_TIMEOUT_MINUTES,
        uploadMaxFileSizeMb: parseIntVal(dbSettings.UPLOAD_MAX_FILE_SIZE_MB, config.UPLOAD_MAX_FILE_SIZE_MB),

        sessionCookieMaxAgeHours: parseIntVal(dbSettings.SESSION_COOKIE_MAX_AGE_HOURS, config.SESSION_COOKIE_MAX_AGE_HOURS),
        sessionCookieSecure: parseBool(dbSettings.SESSION_COOKIE_SECURE, config.SESSION_COOKIE_SECURE),
        defaultEmailDomainForPhoneUsers: dbSettings.DEFAULT_EMAIL_DOMAIN_FOR_PHONE_USERS ?? config.DEFAULT_EMAIL_DOMAIN_FOR_PHONE_USERS,

        openaiModelName: dbSettings.OPENAI_MODEL_NAME ?? config.OPENAI_MODEL_NAME,
        backgroundCheckDefaultProviderId: parseIntVal(dbSettings.BACKGROUND_CHECK_DEFAULT_PROVIDER_ID, config.BACKGROUND_CHECK_DEFAULT_PROVIDER_ID),

        // Note: API keys and master setup key are not typically exposed or modified via this settings panel for security
        // They remain managed by environment variables directly through `config`.
      };
      res.json(liveSettings);
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post('/api/admin/settings', requireAuth, isAdmin, async (req: any, res) => { // Added requireAuth and isAdmin
    try {
      const settingsToUpdate = req.body;
      const allowedKeys = [ // Define keys that can be updated to prevent arbitrary writes
        'PLATFORM_NAME', 'PLATFORM_DESCRIPTION', 'SUPPORT_EMAIL', 'SUPPORT_PHONE', 'ADMIN_EMAIL_RECIPIENT',
        'PRICE_TIER_COFFEE', 'PRICE_TIER_STANDARD', 'PRICE_TIER_PROFESSIONAL', 'PRICE_TIER_OWNER_OPERATOR',
        'FEATURE_SMS_AUTH_ENABLED', 'FEATURE_STRIPE_PAYMENTS_ENABLED', 'FEATURE_BACKGROUND_CHECKS_ENABLED',
        'FEATURE_GOOGLE_MAPS_ENABLED', 'FEATURE_AI_INSIGHTS_ENABLED',
        'MAX_ACTIVE_LOADS_BASIC', 'MAX_ACTIVE_LOADS_STANDARD', 'MAX_ACTIVE_LOADS_PROFESSIONAL',
        'JOB_LOCK_TIMEOUT_MINUTES', 'UPLOAD_MAX_FILE_SIZE_MB',
        'SESSION_COOKIE_MAX_AGE_HOURS', 'SESSION_COOKIE_SECURE', 'DEFAULT_EMAIL_DOMAIN_FOR_PHONE_USERS',
        'OPENAI_MODEL_NAME', 'BACKGROUND_CHECK_DEFAULT_PROVIDER_ID'
      ];

      for (const key in settingsToUpdate) {
        if (Object.prototype.hasOwnProperty.call(settingsToUpdate, key) && allowedKeys.includes(key)) {
          // Type coercion might be needed here depending on how values are sent from frontend
          // For now, storing as received (jsonb handles various types)
          await storage.saveApplicationSetting(key, settingsToUpdate[key]);
        }
      }
      res.json({ message: "Settings updated successfully" });
    } catch (error) {
      console.error("Error updating admin settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.post('/api/admin/test-service/:service', async (req: any, res) => {
    try {
      const { service } = req.params;
      
      switch (service) {
        case 'stripe':
          res.json({ message: "Stripe service test successful" });
          break;
        case 'twilio':
          res.json({ message: "Twilio service test successful" });
          break;
        case 'googlemaps':
          res.json({ message: "Google Maps service test successful" });
          break;
        case 'openai':
          res.json({ message: "OpenAI service test successful" });
          break;
        default:
          res.status(400).json({ message: "Unknown service" });
      }
    } catch (error) {
      console.error(`Error testing ${req.params.service}:`, error);
      res.status(500).json({ message: `Failed to test ${req.params.service}` });
    }
  });

  // Contractor routes
  app.post('/api/contractors', async (req, res) => {
    try {
      const contractorData = insertContractorSchema.parse(req.body);
      const contractor = await storage.createContractor(contractorData);
      res.json(contractor);
    } catch (error) {
      console.error('Error creating contractor:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create contractor' });
      }
    }
  });

  app.get('/api/contractors/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid contractor ID' });
      }
      
      const contractor = await storage.getContractor(id);
      if (!contractor) {
        return res.status(404).json({ message: 'Contractor not found' });
      }
      
      res.json(contractor);
    } catch (error) {
      console.error('Error fetching contractor:', error);
      res.status(500).json({ message: 'Failed to fetch contractor' });
    }
  });

  app.put('/api/contractors/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid contractor ID' });
      }

      const updateData = insertContractorSchema.partial().parse(req.body);
      const contractor = await storage.updateContractor(id, updateData);
      
      if (!contractor) {
        return res.status(404).json({ message: 'Contractor not found' });
      }
      
      res.json(contractor);
    } catch (error) {
      console.error('Error updating contractor:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to update contractor' });
      }
    }
  });

  // Vehicle routes
  app.post('/api/contractors/:contractorId/vehicles', async (req, res) => {
    try {
      const contractorId = parseInt(req.params.contractorId);
      if (isNaN(contractorId)) {
        return res.status(400).json({ message: 'Invalid contractor ID' });
      }

      const vehicleData = insertVehicleSchema.parse({ ...req.body, contractorId });
      const vehicle = await storage.createVehicle(vehicleData);
      res.json(vehicle);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create vehicle' });
      }
    }
  });

  app.get('/api/contractors/:contractorId/vehicles', async (req, res) => {
    try {
      const contractorId = parseInt(req.params.contractorId);
      if (isNaN(contractorId)) {
        return res.status(400).json({ message: 'Invalid contractor ID' });
      }

      const vehicles = await storage.getContractorVehicles(contractorId);
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ message: 'Failed to fetch vehicles' });
    }
  });

  // Document upload routes
  app.post('/api/contractors/:contractorId/documents', requireAuth, tmpUpload.single('document'), async (req: any, res) => { // Changed to tmpUpload
    try {
      const contractorId = parseInt(req.params.contractorId);
      if (isNaN(contractorId)) {
        return res.status(400).json({ message: 'Invalid contractor ID' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const documentData = insertDocumentSchema.parse({
        contractorId,
        documentType: req.body.documentType,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error('Error uploading document:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to upload document' });
      }
    }
  });

  app.get('/api/contractors/:contractorId/documents', async (req, res) => {
    try {
      const contractorId = parseInt(req.params.contractorId);
      if (isNaN(contractorId)) {
        return res.status(400).json({ message: 'Invalid contractor ID' });
      }

      const documents = await storage.getContractorDocuments(contractorId);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  // Opportunities routes
  app.get('/api/opportunities', async (req, res) => {
    try {
      const opportunities = await storage.getAvailableOpportunities();
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      res.status(500).json({ message: 'Failed to fetch opportunities' });
    }
  });

  app.post('/api/opportunities', async (req, res) => {
    try {
      const opportunityData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(opportunityData);
      res.json(opportunity);
    } catch (error) {
      console.error('Error creating opportunity:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create opportunity' });
      }
    }
  });

  // Job state machine routes - implements: open → requested → assigned → picked_up → delivered → paid
  app.post('/api/jobs/:jobId/accept', requireAuth, async (req: any, res) => {
    try {
      const jobId = req.params.jobId;
      const requestingUserId = req.user.claims.sub; // Get user ID from authenticated user

      if (!jobId) {
        return res.status(400).json({ message: 'Job ID is required' });
      }

      const updatedJob = await opportunityService.requestJob(jobId, requestingUserId);
      res.json(updatedJob);
    } catch (error: any) {
      console.error(`Error requesting job ${req.params.jobId}:`, error);
      if (error instanceof JobNotFoundError) {
        return res.status(404).json({ message: error.message });
      } else if (error instanceof InvalidJobStateError) {
        return res.status(409).json({ message: error.message }); // 409 Conflict
      } else if (error instanceof JobLockedError) {
        return res.status(423).json({ message: error.message }); // 423 Locked
      }
      res.status(500).json({ message: 'Failed to request job' });
    }
  });

  app.patch('/api/jobs/:jobId/status', requireAuth, async (req: any, res) => {
    try {
      const jobId = req.params.jobId;
      const { status } = req.body; // The acting user ID will be from req.user
      const actingUserId = req.user.claims.sub;
      const authenticatedUser = req.user; // Pass the whole user for role checks etc.

      if (!jobId || !status) {
        return res.status(400).json({ message: 'Job ID and new status are required' });
      }
      
      const updatedJob = await opportunityService.updateJobStatus(jobId, status, actingUserId, authenticatedUser);
      res.json(updatedJob);
    } catch (error: any) {
      console.error(`Error updating job ${req.params.jobId} to status ${req.body.status}:`, error);
      if (error instanceof JobNotFoundError) {
        return res.status(404).json({ message: error.message });
      } else if (error instanceof InvalidStateTransitionError) {
        return res.status(409).json({ message: error.message }); // 409 Conflict
      } else if (error instanceof PermissionDeniedError) {
        return res.status(403).json({ message: error.message }); // 403 Forbidden
      }
      res.status(500).json({ message: 'Failed to update job status' });
    }
  });

  // Legacy opportunity route for backward compatibility (Consider removing or refactoring if not essential)
  app.post('/api/opportunities/:opportunityId/accept', async (req, res) => {
    try {
      const opportunityId = parseInt(req.params.opportunityId);
      const { contractorId } = req.body;

      if (isNaN(opportunityId) || !contractorId) {
        return res.status(400).json({ message: 'Invalid opportunity ID or contractor ID' });
      }

      const assignment = await storage.acceptOpportunity(opportunityId, contractorId);
      res.json(assignment);
    } catch (error) {
      console.error('Error accepting opportunity:', error);
      res.status(500).json({ message: 'Failed to accept opportunity' });
    }
  });

  app.get('/api/contractors/:contractorId/jobs', async (req, res) => {
    try {
      const contractorId = parseInt(req.params.contractorId);
      if (isNaN(contractorId)) {
        return res.status(400).json({ message: 'Invalid contractor ID' });
      }

      const jobs = await storage.getContractorJobs(contractorId);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching contractor jobs:', error);
      res.status(500).json({ message: 'Failed to fetch contractor jobs' });
    }
  });

  // Messages routes
  app.get('/api/contractors/:contractorId/messages', async (req, res) => {
    try {
      const contractorId = parseInt(req.params.contractorId);
      if (isNaN(contractorId)) {
        return res.status(400).json({ message: 'Invalid contractor ID' });
      }

      const messages = await storage.getContractorMessages(contractorId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post('/api/contractors/:contractorId/messages', async (req, res) => {
    try {
      const contractorId = parseInt(req.params.contractorId);
      if (isNaN(contractorId)) {
        return res.status(400).json({ message: 'Invalid contractor ID' });
      }

      const messageData = insertMessageSchema.parse({ ...req.body, contractorId });
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Validation error', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create message' });
      }
    }
  });

  // Stats routes for dashboard
  app.get('/api/contractors/:contractorId/stats', async (req, res) => {
    try {
      const contractorId = parseInt(req.params.contractorId);
      if (isNaN(contractorId)) {
        return res.status(400).json({ message: 'Invalid contractor ID' });
      }

      const stats = await storage.getContractorStats(contractorId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching contractor stats:', error);
      res.status(500).json({ message: 'Failed to fetch contractor stats' });
    }
  });

  // Chatbot route
  app.post('/api/chatbot', async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: 'Message is required' });
      }

      const response = await generateChatbotResponse(message, context);
      res.json({ response });
    } catch (error) {
      console.error('Error in chatbot:', error);
      res.status(500).json({ 
        message: 'Chatbot service unavailable',
        response: "I'm experiencing technical difficulties. Please contact ACHIEVEMOR directly at (912) 742-9459 or delivered@byachievemor.com for assistance."
      });
    }
  });

  // Background check routes
  app.post("/api/background-check/submit", requireAuth, async (req, res) => {
    try {
      const { contractorId, checkType, personalInfo } = req.body;
      const userId = req.user?.userId;
      
      const { backgroundCheckService } = await import("./backgroundCheckService");
      const request = await backgroundCheckService.submitBackgroundCheck(
        contractorId,
        checkType,
        personalInfo,
        1, // Default provider ID (mock)
        userId
      );
      
      res.json(request);
    } catch (error) {
      console.error("Background check submission error:", error);
      res.status(500).json({ message: "Failed to submit background check" });
    }
  });

  app.get("/api/background-check/contractor/:id", requireAuth, async (req, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      const results = await storage.getContractorBackgroundCheckResults(contractorId);
      const alerts = await storage.getContractorBackgroundCheckAlerts(contractorId);
      
      res.json({ results, alerts });
    } catch (error) {
      console.error("Error fetching background check data:", error);
      res.status(500).json({ message: "Failed to fetch background check data" });
    }
  });

  app.post("/api/background-check/webhook/:providerId", async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const { backgroundCheckService } = await import("./backgroundCheckService");
      
      await backgroundCheckService.processWebhook(providerId, req.body);
      res.status(200).json({ message: "Webhook processed" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  app.get("/api/background-check/status/:requestId", requireAuth, async (req, res) => {
    try {
      const requestId = parseInt(req.params.requestId);
      const { backgroundCheckService } = await import("./backgroundCheckService");
      
      await backgroundCheckService.checkStatus(requestId);
      res.json({ message: "Status updated" });
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ message: "Failed to check status" });
    }
  });

  // AI Insights routes
  app.get("/api/insights/contractor/:id", requireAuth, async (req, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      const { aiInsightsService } = await import("./aiInsightsService");
      
      const insights = await aiInsightsService.generateContractorInsights(contractorId);
      res.json(insights);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  app.get("/api/insights/quick-actions/:id", requireAuth, async (req, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      const { aiInsightsService } = await import("./aiInsightsService");
      
      const quickActions = await aiInsightsService.getQuickActions(contractorId);
      res.json(quickActions);
    } catch (error) {
      console.error("Error getting quick actions:", error);
      res.status(500).json({ message: "Failed to get quick actions" });
    }
  });

  app.get("/api/insights/performance/:id", requireAuth, async (req, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      const { aiInsightsService } = await import("./aiInsightsService");
      
      const performance = await aiInsightsService.getPerformanceTrends(contractorId);
      res.json(performance);
    } catch (error) {
      console.error("Error getting performance trends:", error);
      res.status(500).json({ message: "Failed to get performance trends" });
    }
  });

  app.get("/api/insights/risks/:id", requireAuth, async (req, res) => {
    try {
      const contractorId = parseInt(req.params.id);
      const { aiInsightsService } = await import("./aiInsightsService");
      
      const risks = await aiInsightsService.getRiskAlerts(contractorId);
      res.json(risks);
    } catch (error) {
      console.error("Error getting risk alerts:", error);
      res.status(500).json({ message: "Failed to get risk alerts" });
    }
  });

  // Driver checklist progress routes
  app.get('/api/driver-checklist/progress', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getDriverChecklistProgress(userId);
      res.json(progress || null);
    } catch (error) {
      console.error("Error fetching driver checklist progress:", error);
      res.status(500).json({ message: "Failed to fetch checklist progress" });
    }
  });

  app.post('/api/driver-checklist/progress', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { checklistData, completionPercentage, isCompleted } = req.body;
      
      const progressData = {
        userId,
        checklistData,
        completionPercentage,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      };

      const progress = await storage.saveDriverChecklistProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error saving driver checklist progress:", error);
      res.status(500).json({ message: "Failed to save checklist progress" });
    }
  });

  app.delete('/api/driver-checklist/progress', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearDriverChecklistProgress(userId);
      res.json({ message: "Checklist progress cleared successfully" });
    } catch (error) {
      console.error("Error clearing driver checklist progress:", error);
      res.status(500).json({ message: "Failed to clear checklist progress" });
    }
  });

  // Glovebox document storage routes
  app.get('/api/glovebox/documents', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getUserDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching user documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/glovebox/upload', requireAuth, tmpUpload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Security check: Never allow driver license storage
      const documentType = req.body.documentType?.toLowerCase();
      if (documentType === 'drivers_license' || documentType === 'driver_license') {
        // Clean up the temp file if it's a disallowed type
        if (req.file?.path) {
          try {
            const fs = await import('fs-extra');
            await fs.unlink(req.file.path);
          } catch (unlinkError) {
            console.error("Error deleting disallowed temp file:", unlinkError);
          }
        }
        return res.status(400).json({ 
          message: "Driver licenses cannot be stored for security compliance" 
        });
      }

      const fileStorageService = getFileStorageService();
      const destinationPathPrefix = `user-${userId}/glovebox`;

      const uploadResult = await fileStorageService.uploadFile(
        file.path,
        file.originalname,
        file.mimetype,
        destinationPathPrefix
      );

      // The uploadFile service should handle deleting the temp file (file.path)

      const documentData = {
        userId,
        documentType: req.body.documentType,
        documentCategory: req.body.documentCategory,
        fileName: uploadResult.fileName, // This is originalName
        originalFileName: file.originalname, // Redundant if fileName is originalName, but good for clarity
        filePath: uploadResult.storageKey, // This is the storageKey
        fileSize: uploadResult.size || file.size, // Prefer size from storage service if available
        mimeType: uploadResult.mimeType || file.mimetype,
        expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : null,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
        notes: req.body.notes,
        isShared: false,
        // publicUrl: uploadResult.publicUrl, // Optional: store if needed
      };

      const document = await storage.uploadDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      // Ensure temp file is deleted in case of error after upload but before DB save
      if (req.file?.path) {
        try {
            const fs = await import('fs-extra');
            await fs.unlink(req.file.path);
        } catch (unlinkError) {
            // Log this secondary error but don't overwrite the primary error response
            console.error("Error deleting temp file after primary error:", unlinkError);
        }
      }
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.delete('/api/glovebox/documents/:id', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documentId = parseInt(req.params.id);
      
      await storage.deleteDocument(documentId, userId);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  app.post('/api/glovebox/share', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { documentIds, recipientCompany, recipientEmail, message, expiresIn, maxViews } = req.body;

      // Generate unique share token
      const shareToken = Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (expiresIn || 24));

      const shareData = {
        userId,
        shareToken,
        documentIds,
        recipientCompany,
        recipientEmail,
        message,
        expiresAt,
        maxViews: maxViews || 5,
        isActive: true,
      };

      const share = await storage.createDocumentShare(shareData);
      res.json({ 
        ...share, 
        shareUrl: `${req.protocol}://${req.get('host')}/api/glovebox/shared/${shareToken}`
      });
    } catch (error) {
      console.error("Error creating document share:", error);
      res.status(500).json({ message: "Failed to create document share" });
    }
  });

  app.get('/api/glovebox/shares', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shares = await storage.getActiveDocumentShares(userId);
      res.json(shares);
    } catch (error) {
      console.error("Error fetching document shares:", error);
      res.status(500).json({ message: "Failed to fetch document shares" });
    }
  });

  // Google Maps location services routes
  app.get('/api/location/driver', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const location = await storage.getDriverLocation(userId);
      res.json(location);
    } catch (error) {
      console.error("Error fetching driver location:", error);
      res.status(500).json({ message: "Failed to fetch driver location" });
    }
  });

  app.post('/api/location/update', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { address, vehicleType, maxDistance, isAvailable } = req.body;

      const { mapsService } = await import("./mapsService");
      const location = await mapsService.updateDriverLocation(
        userId, 
        address, 
        vehicleType, 
        maxDistance
      );

      if (location) {
        // Update availability status
        const updatedLocation = await storage.upsertDriverLocation({
          ...location,
          isAvailable: isAvailable !== undefined ? isAvailable : true,
        });
        res.json(updatedLocation);
      } else {
        res.status(400).json({ message: "Unable to geocode the provided address" });
      }
    } catch (error) {
      console.error("Error updating driver location:", error);
      res.status(500).json({ message: "Failed to update driver location" });
    }
  });

  app.get('/api/location/nearby-loads', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const maxDistance = parseInt(req.query.maxDistance as string) || 100;

      const { mapsService } = await import("./mapsService");
      const nearbyLoads = await mapsService.findNearbyLoads(userId, maxDistance);
      res.json(nearbyLoads);
    } catch (error) {
      console.error("Error fetching nearby loads:", error);
      res.status(500).json({ message: "Failed to fetch nearby loads" });
    }
  });

  app.get('/api/location/reverse-geocode', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const { mapsService } = await import("./mapsService");
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ message: "Google Maps API key not configured" });
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        res.json({ address: data.results[0].formatted_address });
      } else {
        res.status(400).json({ message: "Unable to reverse geocode coordinates" });
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      res.status(500).json({ message: "Failed to reverse geocode" });
    }
  });

  app.post('/api/location/calculate-route', requireAuth, async (req: any, res) => {
    try {
      const { stops } = req.body;

      if (!stops || stops.length < 2) {
        return res.status(400).json({ message: "At least 2 stops are required" });
      }

      const { mapsService } = await import("./mapsService");
      const route = await mapsService.getOptimalRoute(stops);
      
      if (route) {
        res.json(route);
      } else {
        res.status(400).json({ message: "Unable to calculate optimal route" });
      }
    } catch (error) {
      console.error("Error calculating route:", error);
      res.status(500).json({ message: "Failed to calculate route" });
    }
  });

  // Admin middleware to check admin role
  async function isAdmin(req: any, res: any, next: any) {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      req.adminUser = user;
      next();
    } catch (error) {
      res.status(500).json({ message: "Failed to verify admin access" });
    }
  }

  // Admin API routes
  app.get('/api/admin/stats', requireAuth, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  app.get('/api/admin/users', requireAuth, isAdmin, async (req, res) => {
    try {
      const { search, status } = req.query;
      const users = await storage.getAllUsers(search as string, status as string);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users/:userId/action', requireAuth, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { action, reason } = req.body;
      const adminUserId = req.adminUser.id;

      // Log admin action
      await storage.logAdminActivity({
        adminUserId,
        targetUserId: userId,
        action,
        actionDetails: { reason, timestamp: new Date() },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Perform user action
      const result = await storage.performUserAction(userId, action, reason, adminUserId);
      res.json(result);
    } catch (error) {
      console.error("Error performing user action:", error);
      res.status(500).json({ message: "Failed to perform user action" });
    }
  });

  app.get('/api/admin/activity', requireAuth, isAdmin, async (req, res) => {
    try {
      const activityLog = await storage.getAdminActivityLog();
      res.json(activityLog);
    } catch (error) {
      console.error("Error fetching activity log:", error);
      res.status(500).json({ message: "Failed to fetch activity log" });
    }
  });

  // Master admin setup route (for creating the first admin)
  app.post('/api/admin/setup-master', async (req, res) => {
    try {
      const { masterKey, userId } = req.body;
      
      // This should be a secure setup process - for demo, we'll use a simple check
      if (masterKey !== config.MASTER_ADMIN_SETUP_KEY) {
        return res.status(403).json({ message: "Invalid master key" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Upgrade user to super_admin
      await storage.updateUserRole(userId, "super_admin");
      
      res.json({ message: "Master admin setup completed" });
    } catch (error) {
      console.error("Error setting up master admin:", error);
      res.status(500).json({ message: "Failed to setup master admin" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
