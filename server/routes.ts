import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  users,
  contractors,
  opportunities,
  contractorAvailability,
  companyJobRequirements,
  driverLocations,
  contractorCompanyRelationships
} from "@shared/schema";
import { z } from "zod";
import { generateChatbotResponse } from "./chatbot";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { eq, and, desc, or, gte, lt, sql, asc, count, sum, avg, ilike } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

// Validation schemas
const availabilitySchema = z.object({
  contractorId: z.number(),
  isAvailable: z.boolean(),
  preferredStates: z.array(z.string()).optional(),
  maxMileRadius: z.number().min(1).max(1000),
  currentLocation: z.string(),
  vehicleType: z.string().optional(),
  weeklyAvailability: z.array(z.object({
    day: z.string(),
    available: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional()
  })).optional()
});

const companyRequirementsSchema = z.object({
  companyId: z.string(),
  requiredLicenses: z.array(z.string()),
  experienceYears: z.number().min(0),
  backgroundCheckRequired: z.boolean().default(true),
  drugTestRequired: z.boolean().default(true),
  vehicleRequirements: z.array(z.string()).optional(),
  geographicRestrictions: z.array(z.string()).optional()
});

async function ensureUserContractorProfile(user: any) {
  if (!user || !user.claims || !user.claims.sub) {
    throw new Error('Invalid user session');
  }

  let contractor = await storage.getContractorByUserId(user.claims.sub);
  
  if (!contractor) {
    contractor = await storage.createContractor({
      userId: user.claims.sub,
      name: `${user.claims.first_name || ''} ${user.claims.last_name || ''}`.trim() || 'Contractor',
      email: user.claims.email || '',
      phone: '',
      licenseNumber: '',
      experienceYears: 0,
      rating: 0,
      completedJobs: 0,
      status: 'pending_verification'
    });
  }

  return contractor;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit authentication
  await setupAuth(app);
  
  // Basic health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

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

  // User profile route
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      const contractor = await ensureUserContractorProfile(req.user);
      res.json(contractor);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  });

  // Contractor availability management
  app.post('/api/contractor/availability', isAuthenticated, async (req: any, res) => {
    try {
      const contractor = await ensureUserContractorProfile(req.user);
      const validatedData = availabilitySchema.parse({
        ...req.body,
        contractorId: contractor.id
      });

      let result;
      const existingAvailability = await db
        .select()
        .from(contractorAvailability)
        .where(eq(contractorAvailability.contractorId, contractor.id))
        .limit(1);

      if (existingAvailability.length > 0) {
        [result] = await db
          .update(contractorAvailability)
          .set(validatedData)
          .where(eq(contractorAvailability.contractorId, contractor.id))
          .returning();
      } else {
        [result] = await db
          .insert(contractorAvailability)
          .values(validatedData)
          .returning();
      }

      res.json(result);
    } catch (error) {
      console.error('Availability setup error:', error);
      res.status(500).json({ message: 'Failed to save availability preferences' });
    }
  });

  // Get contractor availability
  app.get('/api/contractor/availability/:contractorId', isAuthenticated, async (req, res) => {
    try {
      const contractorId = parseInt(req.params.contractorId);
      
      const availability = await db
        .select()
        .from(contractorAvailability)
        .where(eq(contractorAvailability.contractorId, contractorId))
        .limit(1);

      if (availability.length === 0) {
        return res.status(404).json({ message: 'Availability preferences not found' });
      }

      res.json(availability[0]);
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ message: 'Failed to fetch availability preferences' });
    }
  });

  // Company job requirements
  app.post('/api/company/requirements', isAuthenticated, async (req, res) => {
    try {
      const validatedData = companyRequirementsSchema.parse(req.body);

      let result;
      const existingRequirements = await db
        .select()
        .from(companyJobRequirements)
        .where(eq(companyJobRequirements.companyId, validatedData.companyId))
        .limit(1);

      if (existingRequirements.length > 0) {
        [result] = await db
          .update(companyJobRequirements)
          .set(validatedData)
          .where(eq(companyJobRequirements.companyId, validatedData.companyId))
          .returning();
      } else {
        [result] = await db
          .insert(companyJobRequirements)
          .values(validatedData)
          .returning();
      }

      res.json(result);
    } catch (error) {
      console.error('Requirements setup error:', error);
      res.status(500).json({ message: 'Failed to save job requirements' });
    }
  });

  // Get company requirements
  app.get('/api/company/requirements/:companyId', isAuthenticated, async (req, res) => {
    try {
      const companyId = req.params.companyId;
      
      const requirements = await db
        .select()
        .from(companyJobRequirements)
        .where(eq(companyJobRequirements.companyId, companyId))
        .limit(1);

      if (requirements.length === 0) {
        return res.status(404).json({ message: 'Job requirements not found' });
      }

      res.json(requirements[0]);
    } catch (error) {
      console.error('Error fetching requirements:', error);
      res.status(500).json({ message: 'Failed to fetch job requirements' });
    }
  });

  // Opportunities discovery
  app.get('/api/opportunities', isAuthenticated, async (req: any, res) => {
    try {
      const contractor = await ensureUserContractorProfile(req.user);
      const { location, radius = 100, type } = req.query;

      let query = db.select().from(opportunities);
      
      if (type) {
        query = query.where(eq(opportunities.type, type as string));
      }

      const allOpportunities = await query.orderBy(desc(opportunities.createdAt));
      res.json(allOpportunities);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      res.status(500).json({ message: 'Failed to fetch opportunities' });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Chatbot endpoint
  app.post('/api/chatbot', isAuthenticated, async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await generateChatbotResponse(message, context);
      res.json({ response });
    } catch (error) {
      console.error('Chatbot error:', error);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  });

  // Contractor dashboard data
  app.get('/api/contractor/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const contractor = await ensureUserContractorProfile(req.user);
      
      const dashboardData = {
        contractor,
        stats: {
          completedJobs: contractor.completedJobs || 0,
          rating: contractor.rating || 0,
          totalEarnings: 0,
          activeOpportunities: 0
        },
        recentActivity: [],
        upcomingJobs: []
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}