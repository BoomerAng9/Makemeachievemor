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

  // Vehicle types endpoint
  app.get('/api/vehicle-types', async (req: any, res) => {
    try {
      const vehicleTypes = [
        // Freight & Cargo
        { category: 'Freight & Cargo', vehicles: [
          'Semi-truck (Dry Van)',
          'Semi-truck (Refrigerated)',
          'Semi-truck (Flatbed)',
          'Semi-truck (Tanker)',
          'Box Truck (26ft)',
          'Box Truck (20ft)',
          'Box Truck (16ft)',
          'Cargo Van',
          'Sprinter Van',
          'Transit Van (Cargo)',
          'Pickup Truck (Dual Axle)',
          'Pickup Truck (Single Axle)',
          'Straight Truck'
        ]},
        // Passenger Transport
        { category: 'Passenger Transport', vehicles: [
          'Sedan (4 passengers)',
          'SUV (7 passengers)',
          'Minivan (8 passengers)',
          'Passenger Van (12 passengers)',
          'Transit Van (Passenger)',
          'Sprinter Van (Passenger)',
          'Charter Bus (25 passengers)',
          'Motor Coach (45+ passengers)',
          'School Bus',
          'Party Bus (20-40 passengers)'
        ]},
        // Medical Transport
        { category: 'Medical Transport', vehicles: [
          'Medical Transport Van',
          'Wheelchair Accessible Vehicle',
          'Ambulance (Non-Emergency)',
          'Dialysis Transport Vehicle',
          'Medical Sedan',
          'Medical SUV'
        ]},
        // Specialized Services
        { category: 'Specialized Services', vehicles: [
          'Tow Truck (Light Duty)',
          'Tow Truck (Heavy Duty)',
          'Recovery Vehicle',
          'Moving Truck (Small)',
          'Moving Truck (Large)',
          'Delivery Truck',
          'Food Truck',
          'Mobile Service Vehicle'
        ]}
      ];
      
      res.json(vehicleTypes);
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
      res.status(500).json({ message: 'Failed to fetch vehicle types' });
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
          loadType: 'Dry Van',
          vehicleRequired: 'Semi-truck (Dry Van)',
          serviceType: 'freight'
        },
        {
          id: 'opp-002',
          title: 'Dialysis Patient Transport - Weekly Schedule',
          origin: 'North Dallas',
          destination: 'DaVita Dialysis Center',
          miles: '15',
          rate: '120',
          status: 'active',
          description: 'Regular dialysis patient transport, 3x weekly',
          postedBy: 'MedTransport Services',
          deadline: '2025-06-20',
          loadType: 'Medical Transport',
          vehicleRequired: 'Medical Transport Van',
          serviceType: 'medical'
        },
        {
          id: 'opp-003',
          title: 'Family Airport Transfer - Party of 6',
          origin: 'Plano, TX',
          destination: 'DFW Airport',
          miles: '25',
          rate: '85',
          status: 'available',
          description: 'Family with luggage to airport',
          postedBy: 'Premium Rides',
          deadline: '2025-06-14',
          loadType: 'Passenger',
          vehicleRequired: 'SUV (7 passengers)',
          serviceType: 'passenger'
        },
        {
          id: 'opp-004',
          title: 'Wedding Party Bus - Saturday Evening',
          origin: 'Downtown Dallas',
          destination: 'Various Locations',
          miles: '50',
          rate: '750',
          status: 'available',
          description: '6-hour party bus service for wedding celebration',
          postedBy: 'Elite Events Transport',
          deadline: '2025-06-21',
          loadType: 'Party Service',
          vehicleRequired: 'Party Bus (20-40 passengers)',
          serviceType: 'entertainment'
        },
        {
          id: 'opp-005',
          title: 'Express Package Delivery - Same Day',
          origin: 'Fort Worth, TX',
          destination: 'Arlington, TX',
          miles: '20',
          rate: '65',
          status: 'urgent',
          description: 'Time-sensitive package delivery',
          postedBy: 'QuickShip Express',
          deadline: '2025-06-13',
          loadType: 'Package',
          vehicleRequired: 'Sprinter Van',
          serviceType: 'delivery'
        },
        {
          id: 'opp-006',
          title: 'Equipment Transport - Construction Site',
          origin: 'Houston, TX',
          destination: 'Austin, TX',
          miles: '165',
          rate: '1,200',
          status: 'available',
          description: 'Heavy equipment transport',
          postedBy: 'BuildTex Construction',
          deadline: '2025-06-18',
          loadType: 'Heavy Equipment',
          vehicleRequired: 'Pickup Truck (Dual Axle)',
          serviceType: 'specialized'
        }
      ];
      
      res.json(opportunities);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      res.status(500).json({ message: 'Failed to fetch opportunities' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      // Clear session
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  });

  // Universal back navigation endpoint
  app.get('/api/navigation/back', async (req: any, res) => {
    try {
      // Store navigation history in session
      const referer = req.get('Referer') || '/';
      res.json({ previousPage: referer });
    } catch (error) {
      res.status(500).json({ message: 'Navigation failed' });
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