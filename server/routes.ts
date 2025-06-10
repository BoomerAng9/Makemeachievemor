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

  // Driver checklist progress routes
  app.get('/api/driver-checklist/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getDriverChecklistProgress(userId);
      res.json(progress || null);
    } catch (error) {
      console.error("Error fetching driver checklist progress:", error);
      res.status(500).json({ message: "Failed to fetch checklist progress" });
    }
  });

  app.post('/api/driver-checklist/progress', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/driver-checklist/progress', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/glovebox/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getUserDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching user documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/glovebox/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Security check: Never allow driver license storage
      const documentType = req.body.documentType?.toLowerCase();
      if (documentType === 'drivers_license' || documentType === 'driver_license') {
        return res.status(400).json({ 
          message: "Driver licenses cannot be stored for security compliance" 
        });
      }

      const documentData = {
        userId,
        documentType: req.body.documentType,
        documentCategory: req.body.documentCategory,
        fileName: file.filename,
        originalFileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : null,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
        notes: req.body.notes,
        isShared: false,
      };

      const document = await storage.uploadDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.delete('/api/glovebox/documents/:id', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/glovebox/share', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/glovebox/shares', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/location/driver', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const location = await storage.getDriverLocation(userId);
      res.json(location);
    } catch (error) {
      console.error("Error fetching driver location:", error);
      res.status(500).json({ message: "Failed to fetch driver location" });
    }
  });

  app.post('/api/location/update', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/location/nearby-loads', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/location/calculate-route', isAuthenticated, async (req: any, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
