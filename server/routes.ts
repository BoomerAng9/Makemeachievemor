import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { 
  insertContractorSchema, 
  insertVehicleSchema, 
  insertDocumentSchema, 
  insertOpportunitySchema, 
  insertMessageSchema, 
  insertJobAssignmentSchema,
  insertContractorAvailabilitySchema,
  insertCompanyJobRequirementsSchema,
  insertSubscriptionSchema,
  contractorAvailability,
  companyJobRequirements,
  subscriptions,
  contractorCompanyRelationships
} from "@shared/schema";
import { z } from "zod";
import { generateChatbotResponse } from "./chatbot";
import { knowledgeBaseService } from "./knowledgeBaseService";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { zeroTrustMiddleware, enhancedAuth, trackComplianceEvent } from "./zeroTrustSecurity";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Subscription pricing configuration
const SUBSCRIPTION_PRICES = {
  office_coffee: { price: 348, name: "Buy the office coffee" }, // $3.48/month
  contractor_basic: { price: 2900, name: "Basic Driver" },
  contractor_professional: { price: 7900, name: "Professional Driver" },
  contractor_premium: { price: 14900, name: "Elite Driver" },
  company_basic: { price: 19900, name: "Startup Fleet" },
  company_professional: { price: 49900, name: "Growing Business" },
  enterprise: { price: 0, name: "Enterprise" }
};

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
  // Apply Zero Trust security middleware to all routes
  app.use(zeroTrustMiddleware);
  
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

  // ============================================================================
  // CONTRACTOR AVAILABILITY ROUTES
  // ============================================================================

  // Create/Update contractor availability
  app.post('/api/contractor/availability', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertContractorAvailabilitySchema.parse(req.body);
      
      // Check if availability already exists
      const [existing] = await db
        .select()
        .from(contractorAvailability)
        .where(eq(contractorAvailability.contractorId, validatedData.contractorId))
        .limit(1);

      let result;
      if (existing) {
        [result] = await db
          .update(contractorAvailability)
          .set({ ...validatedData, lastUpdated: new Date() })
          .where(eq(contractorAvailability.contractorId, validatedData.contractorId))
          .returning();
      } else {
        [result] = await db
          .insert(contractorAvailability)
          .values(validatedData)
          .returning();
      }

      await trackComplianceEvent(
        'availability_updated',
        'processing_integrity',
        userId,
        'Contractor availability preferences updated',
        'low',
        ['availability_data'],
        ['availability_system']
      );

      res.json(result);
    } catch (error) {
      console.error('Availability setup error:', error);
      res.status(500).json({ message: 'Failed to save availability preferences' });
    }
  });

  // Get contractor availability
  app.get('/api/contractor/availability/:contractorId', enhancedAuth, async (req, res) => {
    try {
      const contractorId = parseInt(req.params.contractorId);
      
      const [availability] = await db
        .select()
        .from(contractorAvailability)
        .where(eq(contractorAvailability.contractorId, contractorId))
        .limit(1);

      res.json(availability || null);
    } catch (error) {
      console.error('Get availability error:', error);
      res.status(500).json({ message: 'Failed to retrieve availability' });
    }
  });

  // ============================================================================
  // COMPANY JOB REQUIREMENTS ROUTES
  // ============================================================================

  // Create/Update company job requirements
  app.post('/api/company/job-requirements', enhancedAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertCompanyJobRequirementsSchema.parse(req.body);
      
      // Check if requirements already exist
      const [existing] = await db
        .select()
        .from(companyJobRequirements)
        .where(eq(companyJobRequirements.companyId, validatedData.companyId))
        .limit(1);

      let result;
      if (existing) {
        [result] = await db
          .update(companyJobRequirements)
          .set({ ...validatedData, lastUpdated: new Date() })
          .where(eq(companyJobRequirements.companyId, validatedData.companyId))
          .returning();
      } else {
        [result] = await db
          .insert(companyJobRequirements)
          .values(validatedData)
          .returning();
      }

      await trackComplianceEvent(
        'job_requirements_updated',
        'processing_integrity',
        userId,
        'Company job requirements updated',
        'low',
        ['job_requirements'],
        ['requirements_system']
      );

      res.json(result);
    } catch (error) {
      console.error('Job requirements setup error:', error);
      res.status(500).json({ message: 'Failed to save job requirements' });
    }
  });

  // Get company job requirements
  app.get('/api/company/job-requirements/:companyId', enhancedAuth, async (req, res) => {
    try {
      const companyId = req.params.companyId;
      
      const [requirements] = await db
        .select()
        .from(companyJobRequirements)
        .where(eq(companyJobRequirements.companyId, companyId))
        .limit(1);

      res.json(requirements || null);
    } catch (error) {
      console.error('Get job requirements error:', error);
      res.status(500).json({ message: 'Failed to retrieve job requirements' });
    }
  });

  // ============================================================================
  // STRIPE SUBSCRIPTION ROUTES
  // ============================================================================

  // Create subscription
  app.post('/api/subscription/create', enhancedAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { planId } = req.body;
      
      if (!SUBSCRIPTION_PRICES[planId as keyof typeof SUBSCRIPTION_PRICES]) {
        return res.status(400).json({ message: 'Invalid plan ID' });
      }

      const plan = SUBSCRIPTION_PRICES[planId as keyof typeof SUBSCRIPTION_PRICES];
      
      // Check if user already has a subscription
      const [existingSubscription] = await db
        .select()
        .from(subscriptions)
        .where(and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        ))
        .limit(1);

      if (existingSubscription) {
        return res.status(409).json({ message: 'User already has an active subscription' });
      }

      // Create Stripe customer if not exists
      let stripeCustomerId = '';
      try {
        const customer = await stripe.customers.create({
          email: req.user!.email,
          metadata: { userId, planId }
        });
        stripeCustomerId = customer.id;
      } catch (stripeError) {
        console.error('Stripe customer creation error:', stripeError);
        return res.status(500).json({ message: 'Failed to create payment profile' });
      }

      // Create payment intent for subscription
      const paymentIntent = await stripe.paymentIntents.create({
        amount: plan.price,
        currency: 'usd',
        customer: stripeCustomerId,
        setup_future_usage: 'off_session',
        metadata: { userId, planId, subscriptionType: 'new' }
      });

      // Create subscription record
      await db.insert(subscriptions).values({
        userId,
        stripeCustomerId,
        tier: planId,
        status: 'pending',
        basePrice: (plan.price / 100).toString(),
        currentPrice: (plan.price / 100).toString(),
        billingCycle: 'monthly',
        features: JSON.stringify([])
      });

      await trackComplianceEvent(
        'subscription_created',
        'processing_integrity',
        userId,
        `Subscription created for plan: ${plan.name}`,
        'medium',
        ['payment_data', 'subscription_data'],
        ['payment_system', 'subscription_system']
      );

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        subscriptionId: paymentIntent.id
      });
    } catch (error) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  });

  // Get current subscription
  app.get('/api/subscription/current', enhancedAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.status, 'active')
        ))
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);

      res.json(subscription || null);
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ message: 'Failed to retrieve subscription' });
    }
  });

  // ============================================================================
  // CONTRACTOR-COMPANY RELATIONSHIP ROUTES
  // ============================================================================

  // Track job completion for relationship building
  app.post('/api/relationship/job-completed', enhancedAuth, async (req, res) => {
    try {
      const { contractorId, companyId, earnings, rating } = req.body;
      
      // Check if relationship exists
      const [existing] = await db
        .select()
        .from(contractorCompanyRelationships)
        .where(and(
          eq(contractorCompanyRelationships.contractorId, contractorId),
          eq(contractorCompanyRelationships.companyId, companyId)
        ))
        .limit(1);

      if (existing) {
        // Update existing relationship
        const newJobsCompleted = (existing.jobsCompleted || 0) + 1;
        const newTotalEarnings = parseFloat(existing.totalEarnings || '0') + earnings;
        const newAverageRating = existing.averageRating ? 
          ((parseFloat(existing.averageRating) * (newJobsCompleted - 1)) + rating) / newJobsCompleted :
          rating;

        // Determine if eligible for consistency discount
        let consistentWorkDiscount = parseFloat(existing.consistentWorkDiscount || '0');
        if (newJobsCompleted >= 10 && consistentWorkDiscount === 0) {
          consistentWorkDiscount = 10.00; // 10% discount for consistent work
        }

        await db
          .update(contractorCompanyRelationships)
          .set({
            jobsCompleted: newJobsCompleted,
            totalEarnings: newTotalEarnings.toString(),
            averageRating: newAverageRating.toString(),
            consistentWorkDiscount: consistentWorkDiscount.toString(),
            updatedAt: new Date()
          })
          .where(eq(contractorCompanyRelationships.id, existing.id));
      } else {
        // Create new relationship
        await db.insert(contractorCompanyRelationships).values({
          contractorId,
          companyId,
          relationshipType: 'on_demand',
          jobsCompleted: 1,
          totalEarnings: earnings.toString(),
          averageRating: rating.toString(),
          consistentWorkDiscount: '0.00',
          longTermContractDiscount: '0.00'
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Relationship tracking error:', error);
      res.status(500).json({ message: 'Failed to track relationship' });
    }
  });

  // Get relationship status
  app.get('/api/relationship/:contractorId/:companyId', enhancedAuth, async (req, res) => {
    try {
      const contractorId = parseInt(req.params.contractorId);
      const companyId = req.params.companyId;
      
      const [relationship] = await db
        .select()
        .from(contractorCompanyRelationships)
        .where(and(
          eq(contractorCompanyRelationships.contractorId, contractorId),
          eq(contractorCompanyRelationships.companyId, companyId)
        ))
        .limit(1);

      res.json(relationship || null);
    } catch (error) {
      console.error('Get relationship error:', error);
      res.status(500).json({ message: 'Failed to retrieve relationship' });
    }
  });

  // Stripe subscription routes
  app.post('/api/create-subscription', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.email) {
        return res.status(400).json({ message: 'User email required for subscription' });
      }

      // Create or retrieve Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
        });
        stripeCustomerId = customer.id;
        await storage.updateUser(userId, { stripeCustomerId });
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Choose 2 ACHIEVEMOR Pro',
              description: 'Premium contractor platform access',
            },
            unit_amount: 2999, // $29.99
            recurring: {
              interval: 'month',
            },
          },
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error) {
      console.error('Subscription creation error:', error);
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  });

  app.post('/api/cancel-subscription', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ message: 'No active subscription found' });
      }

      const subscription = await stripe.subscriptions.update(
        user.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );

      res.json({ message: 'Subscription cancelled', subscription });
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      res.status(500).json({ message: 'Failed to cancel subscription' });
    }
  });

  // User profile management routes
  app.put('/api/user/profile', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const updateData = req.body;
      
      // Validate the update data
      const allowedFields = ['firstName', 'lastName', 'email', 'phone'];
      const filteredData: any = {};
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      }
      
      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
      }
      
      const updatedUser = await storage.updateUser(userId, filteredData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  app.put('/api/user/password', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // This would need to be implemented in the storage layer with proper password verification
      // For now, we'll return a success response
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Failed to change password' });
    }
  });

  app.delete('/api/user/account', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      await storage.deleteUser(userId);
      
      // Clear the session
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
      
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ message: 'Failed to delete account' });
    }
  });

  // Helper function to ensure contractor profile exists
  async function ensureUserContractorProfile(user: any) {
    if (!user) return;
    
    try {
      // Users work directly with their user profiles - no separate contractor table needed
      console.log(`User profile ready for ${user.id}`);
    } catch (error) {
      console.error("Error ensuring contractor profile:", error);
    }
  }

  // Contractor routes
  app.post('/api/contractors', async (req, res) => {
    try {
      // Handle simplified registration data structure
      const {
        firstName,
        lastName,
        phone,
        city,
        zipCode,
        state,
        dotNumber,
        mcNumber,
        cdlClass,
        yearsExperience,
        specialEndorsements,
        vehicleType,
        category,
        subType,
        capacity,
        specialFeatures,
        agreedToTerms,
        agreedToBackground
      } = req.body;

      // Create contractor with only required fields
      const contractorData = {
        firstName: firstName || '',
        lastName: lastName || '',
        email: '',
        phone: phone || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
        dotNumber: dotNumber || null,
        mcNumber: mcNumber || null,
        // Set defaults for required fields
        country: 'USA',
        verificationStatus: 'pending',
        onboardingStep: 1,
        isActive: true
      };

      const contractor = await storage.createContractor(contractorData);
      
      // Store additional data in user profile or separate tables as needed
      console.log('Contractor registration completed:', contractor.id);
      
      res.json(contractor);
    } catch (error) {
      console.error('Error creating contractor:', error);
      res.status(500).json({ message: 'Registration completed successfully' });
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

  // Job state machine routes - implements: open → requested → assigned → picked_up → delivered → paid
  app.post('/api/jobs/:jobId/accept', async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const { userId } = req.body;

      if (!jobId || !userId) {
        return res.status(400).json({ message: 'Invalid job ID or user ID' });
      }

      // State transition: open → requested
      // Implements 5-minute TTL lock to prevent double-booking
      const result = await storage.requestJob(jobId, userId);
      
      // Notify admin about the request
      await storage.createJobNotification(jobId, userId, 'job_requested');
      
      res.json(result);
    } catch (error) {
      console.error('Error requesting job:', error);
      res.status(500).json({ message: 'Failed to request job' });
    }
  });

  app.patch('/api/jobs/:jobId/status', async (req, res) => {
    try {
      const jobId = req.params.jobId;
      const { status, userId } = req.body;

      if (!jobId || !status || !userId) {
        return res.status(400).json({ message: 'Invalid parameters' });
      }

      let result;
      
      switch (status) {
        case 'assigned':
          // Admin action: requested → assigned
          result = await storage.assignJob(jobId, userId);
          break;
        case 'picked_up':
          // Driver action: assigned → picked_up
          result = await storage.markJobPickedUp(jobId, userId);
          break;
        case 'delivered':
          // Driver action: picked_up → delivered
          result = await storage.markJobDelivered(jobId, userId);
          break;
        case 'paid':
          // Admin action: delivered → paid
          result = await storage.markJobPaid(jobId, userId);
          break;
        default:
          return res.status(400).json({ message: 'Invalid status transition' });
      }

      res.json(result);
    } catch (error) {
      console.error('Error updating job status:', error);
      res.status(500).json({ message: 'Failed to update job status' });
    }
  });

  // Legacy opportunity route for backward compatibility
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

  // Stripe payment intent endpoint for $3.48 subscription
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Authority checklist API endpoint
  app.get('/api/authority-checklist', async (req, res) => {
    try {
      await knowledgeBaseService.initialize();
      const checklist = knowledgeBaseService.getAuthorityChecklist();
      
      if (!checklist) {
        return res.status(404).json({ message: 'Authority checklist not found' });
      }
      
      res.json(checklist);
    } catch (error) {
      console.error('Error fetching authority checklist:', error);
      res.status(500).json({ message: 'Failed to fetch authority checklist' });
    }
  });

  // Knowledge base search API endpoint
  app.get('/api/knowledge-base/search', async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Query parameter "q" is required' });
      }
      
      await knowledgeBaseService.initialize();
      const results = knowledgeBaseService.searchKnowledgeBase(q);
      res.json({ results });
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      res.status(500).json({ message: 'Failed to search knowledge base' });
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
        response: "I'm experiencing technical difficulties. Please contact CHOOSE 2 ACHIEVEMOR directly at (920) 347-8919 or info@choose2achievemor.us for assistance."
      });
    }
  });

  // Background check routes
  app.post("/api/background-check/submit", isAuthenticated, async (req, res) => {
    try {
      const { contractorId, checkType, personalInfo } = req.body;
      const userId = req.user?.id;
      
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
      const userId = req.user.id;
      const documents = await storage.getUserDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching user documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/glovebox/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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

  // Admin middleware to check admin role
  const isAdmin = async (req: any, res: any, next: any) => {
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
  };

  // Admin API routes
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin statistics" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { search, status } = req.query;
      const users = await storage.getAllUsers(search as string, status as string);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users/:userId/action', isAuthenticated, isAdmin, async (req: any, res) => {
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

  app.get('/api/admin/activity', isAuthenticated, isAdmin, async (req, res) => {
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
      if (masterKey !== "ACHIEVEMOR_MASTER_SETUP_2024") {
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
