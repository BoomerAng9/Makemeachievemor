import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { insertContractorSchema, insertVehicleSchema, insertDocumentSchema, insertOpportunitySchema, insertMessageSchema, insertJobAssignmentSchema } from "@shared/schema";
import { z } from "zod";
import { generateChatbotResponse } from "./chatbot";

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

  const httpServer = createServer(app);
  return httpServer;
}
