import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit authentication
  await setupAuth(app);
  
  // Basic health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth routes - temporary bypass for development
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Temporary demo user for development
      const profile = {
        id: 'demo-user-123',
        name: 'Demo Driver',
        email: 'demo@achievemor.io',
        profileImageUrl: null,
        role: 'driver',
        status: 'active'
      };
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile route - temporary bypass for development
  app.get('/api/user', async (req: any, res) => {
    try {
      // Temporary demo user for development
      const profile = {
        id: 'demo-user-123',
        name: 'Demo Driver',
        email: 'demo@achievemor.io',
        profileImageUrl: null,
        role: 'driver',
        status: 'active',
        registrationSource: 'direct'
      };
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  });

  // Contractor availability endpoint
  app.get('/api/contractor/availability', async (req: any, res) => {
    try {
      const availability = {
        isAvailable: true,
        currentLocation: 'Dallas, TX',
        maxMileRadius: 500,
        preferredRoutes: ['Dallas to Houston', 'Dallas to Austin', 'Texas Triangle'],
        availableFrom: new Date().toISOString(),
        vehicleType: 'Semi-truck',
        lastUpdated: new Date().toISOString()
      };
      
      res.json(availability);
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ message: 'Failed to fetch availability' });
    }
  });

  // Opportunities endpoint
  app.get('/api/opportunities', async (req: any, res) => {
    try {
      const opportunities = [
        {
          id: 'opp-001',
          title: 'Freight Delivery - Dallas to Houston',
          origin: 'Dallas, TX',
          destination: 'Houston, TX',
          miles: '240',
          rate: '2,400',
          status: 'available',
          description: 'Standard freight delivery',
          postedBy: 'TransCorp Logistics',
          deadline: '2025-06-15',
          loadType: 'Dry Van'
        },
        {
          id: 'opp-002',
          title: 'Express Delivery - Austin to San Antonio',
          origin: 'Austin, TX',
          destination: 'San Antonio, TX',
          miles: '80',
          rate: '800',
          status: 'active',
          description: 'Time-sensitive delivery',
          postedBy: 'Express Logistics',
          deadline: '2025-06-13',
          loadType: 'Refrigerated'
        },
        {
          id: 'opp-003',
          title: 'Return Load - Houston to Dallas',
          origin: 'Houston, TX',
          destination: 'Dallas, TX',
          miles: '240',
          rate: '2,200',
          status: 'available',
          description: 'Return trip opportunity',
          postedBy: 'Lone Star Transport',
          deadline: '2025-06-16',
          loadType: 'Flatbed'
        }
      ];
      
      res.json(opportunities);
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

  // Basic opportunities endpoint
  app.get('/api/opportunities', isAuthenticated, async (req: any, res) => {
    try {
      // Return sample opportunities for now
      const opportunities = [
        {
          id: '1',
          title: 'Freight Delivery - Chicago to Atlanta',
          origin: 'Chicago, IL',
          destination: 'Atlanta, GA',
          rate: '$2,800',
          miles: '715',
          type: 'long_haul',
          postedBy: 'ABC Logistics',
          status: 'available'
        },
        {
          id: '2', 
          title: 'Local Delivery Route - Dallas Metro',
          origin: 'Dallas, TX',
          destination: 'Fort Worth, TX',
          rate: '$450',
          miles: '35',
          type: 'local',
          postedBy: 'Metro Freight',
          status: 'available'
        }
      ];
      
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      res.status(500).json({ message: 'Failed to fetch opportunities' });
    }
  });

  // Dashboard data endpoint
  app.get('/api/contractor/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      const dashboardData = {
        user: {
          id: userId,
          name: `${req.user.claims.first_name || ''} ${req.user.claims.last_name || ''}`.trim() || 'User',
          email: req.user.claims.email || '',
          role: user?.role || 'driver'
        },
        stats: {
          completedJobs: 0,
          rating: 0,
          totalEarnings: 0,
          activeOpportunities: 2
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