import { Request, Response } from "express";
import { storage } from "./storage";
import { config } from "./config";

// Simple in-memory session store for SMS authentication
const userSessions = new Map<string, { userId: string; phoneNumber: string; role: string; name: string }>();
const verificationCodes = new Map<string, { code: string; expiresAt: Date; attempts: number }>();

// Generate 6-digit verification code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean expired codes
function cleanupExpired() {
  const now = new Date();
  Array.from(verificationCodes.entries()).forEach(([phone, data]) => {
    if (data.expiresAt < now) {
      verificationCodes.delete(phone);
    }
  });
}

// Send verification code
export async function sendCode(req: Request, res: Response) {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number required" });
    }

    cleanupExpired();
    
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    verificationCodes.set(phoneNumber, {
      code,
      expiresAt,
      attempts: 0
    });

    // Log code for testing (in production, send via SMS)
    console.log(`SMS Code for ${phoneNumber}: ${code}`);
    
    res.json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Send code error:", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
}

// Verify code and create session
export async function verifyCode(req: Request, res: Response) {
  try {
    const { phoneNumber, code, name, role = "driver" } = req.body;
    
    if (!phoneNumber || !code || !name) {
      return res.status(400).json({ message: "Phone number, code, and name required" });
    }

    cleanupExpired();
    
    const verification = verificationCodes.get(phoneNumber);
    if (!verification) {
      return res.status(400).json({ message: "No verification code found" });
    }

    if (verification.attempts >= 3) {
      verificationCodes.delete(phoneNumber);
      return res.status(400).json({ message: "Too many attempts" });
    }

    if (verification.code !== code) {
      verification.attempts++;
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Create or update user
    let user;
    try {
      user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        user = await storage.createUser({
          phoneNumber,
          name,
          role,
          email: `${phoneNumber}@${config.DEFAULT_EMAIL_DOMAIN_FOR_PHONE_USERS}`,
          status: "active"
        });
      }
    } catch (error) {
      console.error("User creation error:", error);
      return res.status(500).json({ message: "Failed to create user" });
    }

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    userSessions.set(sessionId, {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
      name: user.name
    });

    // Clean up verification code
    verificationCodes.delete(phoneNumber);

    // Set session cookie
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: config.SESSION_COOKIE_SECURE,
      maxAge: config.SESSION_COOKIE_MAX_AGE_HOURS * 60 * 60 * 1000
    });

    res.json({
      message: "Authentication successful",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error("Verify code error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
}

// Get current user
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const sessionId = req.cookies?.sessionId || null;
    
    if (!sessionId) {
      return res.status(401).json({ message: "No session found" });
    }

    const session = userSessions.get(sessionId);
    if (!session) {
      return res.status(401).json({ message: "Invalid session" });
    }

    // Get fresh user data
    const user = await storage.getUser(session.userId);
    if (!user) {
      userSessions.delete(sessionId);
      return res.status(401).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
}

// Logout
export async function logoutUser(req: Request, res: Response) {
  try {
    const sessionId = req.cookies?.sessionId;
    
    if (sessionId) {
      userSessions.delete(sessionId);
    }

    res.clearCookie('sessionId');
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: Function) {
  const sessionId = req.cookies?.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const session = userSessions.get(sessionId);
  if (!session) {
    return res.status(401).json({ message: "Invalid session" });
  }

  // Add user info to request
  (req as any).user = session;
  next();
}