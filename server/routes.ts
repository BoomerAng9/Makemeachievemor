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

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Return user from session claims
      const profile = {
        id: req.user.claims.sub,
        name: `${req.user.claims.first_name || ''} ${req.user.claims.last_name || ''}`.trim() || 'User',
        email: req.user.claims.email || '',
        profileImageUrl: req.user.claims.profile_image_url,
        role: 'driver',
        status: 'active'
      };
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile route
  app.get('/api/user', isAuthenticated, async (req: any, res) => {
    try {
      // Return basic user profile from session
      const profile = {
        id: req.user.claims.sub,
        name: `${req.user.claims.first_name || ''} ${req.user.claims.last_name || ''}`.trim() || 'User',
        email: req.user.claims.email || '',
        profileImageUrl: req.user.claims.profile_image_url,
        role: 'driver',
        status: 'active'
      };
      
      res.json(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
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