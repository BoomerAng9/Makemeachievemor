import type { Express, RequestHandler } from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import bcrypt from "bcrypt";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'achievemor-session-secret-dev',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax'
    },
  });
}

async function createUser(email: string, firstName: string, lastName: string) {
  try {
    const username = email.split('@')[0];
    
    const user = await storage.createUser({
      id: username,
      email,
      firstName,
      lastName,
      role: "user",
      passwordHash: await bcrypt.hash('password123', 10),
      isEmailVerified: true,
      profileImage: null,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create contractor profile
    await storage.createContractor({
      userId: user.id,
      businessName: `${firstName} ${lastName} Trucking`,
      businessAddress: "",
      businessPhone: "",
      businessEmail: email,
      contactPerson: `${firstName} ${lastName}`,
      dotNumber: "",
      mcNumber: "",
      insuranceProvider: "",
      insurancePolicyNumber: "",
      insuranceExpiryDate: null,
      emergencyContactName: "",
      emergencyContactPhone: "",
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      accountType: "checking",
      accountHolderName: `${firstName} ${lastName}`,
      taxId: "",
      businessType: "individual",
      yearsOfExperience: 0,
      preferredRoutes: [],
      availability: "full_time",
      maxDistance: 500,
      profileCompleted: false,
    });

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }
      
      // Try to get existing user
      let user;
      try {
        user = await storage.getUserByEmail(email);
      } catch (error) {
        // User doesn't exist, create new one
        const firstName = email.split('@')[0];
        const lastName = 'User';
        user = await createUser(email, firstName, lastName);
      }
      
      // Set session
      req.session.user = user;
      req.session.isAuthenticated = true;
      
      res.json({ user, message: "Login successful" });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      if (req.session && req.session.user) {
        // Refresh user data from database
        const user = await storage.getUser(req.session.user.id);
        res.json(user);
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      console.error('Get user error:', error);
      res.status(401).json({ message: "Unauthorized" });
    }
  });
  
  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // Legacy routes for compatibility
  app.get("/api/login", (req, res) => {
    res.redirect("/login");
  });
  
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (req.session && req.session.isAuthenticated && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  
  res.status(401).json({ message: "Unauthorized" });
};