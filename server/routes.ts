import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { insertContractorSchema, insertVehicleSchema, insertDocumentSchema, insertOpportunitySchema, insertMessageSchema, insertJobAssignmentSchema } from "@shared/schema";
import { z } from "zod";
import { generateChatbotResponse } from "./chatbot";
import { setupAuth, isAuthenticated } from "./replitAuth";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
  app.post('/api/contractors/:contractorId/documents', upload.single('document'), async (req, res) => {
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

  // Job assignment routes
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
  app.post("/api/background-check/submit", isAuthenticated, async (req, res) => {
    try {
      const { contractorId, checkType, personalInfo } = req.body;
      const userId = req.user?.claims?.sub;
      
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

  app.get("/api/background-check/contractor/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/background-check/status/:requestId", isAuthenticated, async (req, res) => {
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
  app.get("/api/insights/contractor/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/insights/quick-actions/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/insights/performance/:id", isAuthenticated, async (req, res) => {
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

  app.get("/api/insights/risks/:id", isAuthenticated, async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
