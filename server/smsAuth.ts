import { Request, Response } from "express";
import { storage } from "./storage";
import { randomBytes } from "crypto";

interface SMSSession {
  phoneNumber: string;
  verificationCode: string;
  attempts: number;
  expiresAt: Date;
}

// In-memory store for SMS verification codes (in production, use Redis)
const smsVerificationStore = new Map<string, SMSSession>();

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean up expired codes
function cleanupExpiredCodes() {
  const now = new Date();
  const entries = Array.from(smsVerificationStore.entries());
  for (const [phone, session] of entries) {
    if (session.expiresAt < now) {
      smsVerificationStore.delete(phone);
    }
  }
}

// Send SMS verification code
export async function sendVerificationCode(req: Request, res: Response) {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber || phoneNumber.length < 10) {
      return res.status(400).json({ message: "Valid phone number required" });
    }

    // Clean up expired codes
    cleanupExpiredCodes();

    // Check if there's already a recent code for this number
    const existingSession = smsVerificationStore.get(phoneNumber);
    if (existingSession && existingSession.expiresAt > new Date()) {
      const timeRemaining = Math.ceil((existingSession.expiresAt.getTime() - Date.now()) / 1000);
      return res.status(429).json({ 
        message: `Please wait ${timeRemaining} seconds before requesting a new code`,
        timeRemaining 
      });
    }

    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store the verification session
    smsVerificationStore.set(phoneNumber, {
      phoneNumber,
      verificationCode,
      attempts: 0,
      expiresAt
    });

    // In development, log the code instead of sending SMS
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 SMS Code for ${phoneNumber}: ${verificationCode}`);
      return res.json({ 
        message: "Verification code sent",
        devCode: verificationCode // Only in development
      });
    }

    // TODO: Integrate with Twilio for production SMS sending
    // For now, simulate SMS sending
    console.log(`SMS would be sent to ${phoneNumber}: ${verificationCode}`);
    
    res.json({ message: "Verification code sent" });
  } catch (error) {
    console.error("SMS send error:", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
}

// Verify SMS code and authenticate user
export async function verifyCodeAndLogin(req: Request, res: Response) {
  try {
    const { phoneNumber, code, name, role = "driver" } = req.body;
    
    if (!phoneNumber || !code) {
      return res.status(400).json({ message: "Phone number and code required" });
    }

    // Clean up expired codes
    cleanupExpiredCodes();

    const session = smsVerificationStore.get(phoneNumber);
    if (!session) {
      return res.status(400).json({ message: "No verification session found" });
    }

    if (session.expiresAt < new Date()) {
      smsVerificationStore.delete(phoneNumber);
      return res.status(400).json({ message: "Verification code expired" });
    }

    // Check attempts
    if (session.attempts >= 3) {
      smsVerificationStore.delete(phoneNumber);
      return res.status(400).json({ message: "Too many failed attempts" });
    }

    // Verify code
    if (session.verificationCode !== code) {
      session.attempts++;
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Code verified successfully, clean up
    smsVerificationStore.delete(phoneNumber);

    // Find or create user
    let user = await storage.getUserByPhone(phoneNumber);
    
    if (!user) {
      // Create new user
      const userId = randomBytes(16).toString('hex');
      user = await storage.upsertUser({
        id: userId,
        phoneNumber,
        name: name || `User ${phoneNumber.slice(-4)}`,
        role: role as any,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Send registration notification to admin
      await storage.createRegistrationNotification({
        userId: user.id,
        userType: role,
        phoneNumber,
        name: user.name,
        registrationMethod: "sms",
        createdAt: new Date(),
      });
    } else {
      // Update last login
      user = await storage.upsertUser({
        ...user,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create session
    (req.session as any).userId = user.id;
    (req.session as any).phoneNumber = phoneNumber;
    
    // Save session
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ 
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
      }
    });
  } catch (error) {
    console.error("SMS verification error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
}

// Check current authentication status
export async function checkAuthStatus(req: Request, res: Response) {
  try {
    const userId = (req.session as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: user.subscriptionStatus,
      companyName: user.companyName,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({ message: "Authentication check failed" });
  }
}

// Logout user
export async function logout(req: Request, res: Response) {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: any) {
  const userId = (req.session as any)?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
}