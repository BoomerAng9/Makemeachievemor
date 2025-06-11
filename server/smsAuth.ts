import express, { RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";
import { randomBytes } from "crypto";

// SMS verification codes storage (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string; expires: Date; attempts: number }>();

interface SMSAuthRequest extends express.Request {
  session: {
    userId?: string;
    phoneNumber?: string;
    isAuthenticated?: boolean;
    save: (callback?: (err?: any) => void) => void;
    destroy: (callback?: (err?: any) => void) => void;
  } & session.Session;
}

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Clean expired codes
function cleanExpiredCodes() {
  const now = new Date();
  const expiredKeys: string[] = [];
  
  for (const [phone, data] of verificationCodes.entries()) {
    if (data.expires < now) {
      expiredKeys.push(phone);
    }
  }
  
  expiredKeys.forEach(key => verificationCodes.delete(key));
}

// Send SMS (mock implementation - replace with actual SMS service like Twilio)
async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  // In production, integrate with Twilio, AWS SNS, or another SMS service
  console.log(`SMS to ${phoneNumber}: ${message}`);
  
  // For development, log the code for testing
  console.log(`🔐 Verification code for ${phoneNumber}: ${message.match(/\d{6}/)?.[0]}`);
  
  return true;
}

// Request verification code
export const requestVerificationCode: RequestHandler = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber || !/^\+?[1-9]\d{1,14}$/.test(phoneNumber.replace(/\s/g, ""))) {
      return res.status(400).json({ message: "Valid phone number is required" });
    }

    const normalizedPhone = phoneNumber.replace(/\s/g, "");
    
    // Clean expired codes
    cleanExpiredCodes();
    
    // Rate limiting: max 3 attempts per hour
    const existing = verificationCodes.get(normalizedPhone);
    if (existing && existing.attempts >= 3) {
      return res.status(429).json({ 
        message: "Too many verification attempts. Please try again later." 
      });
    }

    const code = generateVerificationCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    verificationCodes.set(normalizedPhone, {
      code,
      expires,
      attempts: existing ? existing.attempts + 1 : 1
    });

    const message = `Your ACHIEVEMOR verification code is: ${code}. Valid for 10 minutes.`;
    const sent = await sendSMS(normalizedPhone, message);
    
    if (!sent) {
      return res.status(500).json({ message: "Failed to send verification code" });
    }

    res.json({ 
      message: "Verification code sent",
      expiresIn: 600 // 10 minutes in seconds
    });
    
  } catch (error) {
    console.error("Error sending verification code:", error);
    res.status(500).json({ message: "Failed to send verification code" });
  }
};

// Verify code and authenticate
export const verifyCode: RequestHandler = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    
    if (!phoneNumber || !code) {
      return res.status(400).json({ message: "Phone number and code are required" });
    }

    const normalizedPhone = phoneNumber.replace(/\s/g, "");
    
    // Clean expired codes
    cleanExpiredCodes();
    
    const storedData = verificationCodes.get(normalizedPhone);
    if (!storedData) {
      return res.status(400).json({ message: "No verification code found or code expired" });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    // Code is valid, remove it
    verificationCodes.delete(normalizedPhone);

    // Find or create user
    let user = await storage.getUserByPhone(normalizedPhone);
    if (!user) {
      // Create new user with phone number
      user = await storage.upsertUser({
        id: `phone_${normalizedPhone.replace(/\+/g, "")}`,
        name: `User ${normalizedPhone}`, // Required field
        phoneNumber: normalizedPhone,
        role: "driver",
        status: "pending-verification",
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Set session
    const authReq = req as SMSAuthRequest;
    authReq.session.userId = user.id;
    authReq.session.phoneNumber = normalizedPhone;
    authReq.session.isAuthenticated = true;
    
    authReq.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: "Authentication failed" });
      }
      
      res.json({ 
        message: "Authentication successful",
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          role: user.role,
          status: user.status
        }
      });
    });
    
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

// Check authentication middleware
export const isAuthenticated: RequestHandler = (req, res, next) => {
  const authReq = req as SMSAuthRequest;
  
  if (!authReq.session.isAuthenticated || !authReq.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  next();
};

// Get current user
export const getCurrentUser: RequestHandler = async (req, res) => {
  try {
    const authReq = req as SMSAuthRequest;
    const userId = authReq.session.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.id,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      profileImageUrl: user.profileImageUrl
    });
    
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Failed to get user" });
  }
};

// Logout
export const logout: RequestHandler = (req, res) => {
  const authReq = req as SMSAuthRequest;
  
  authReq.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    
    res.json({ message: "Logged out successfully" });
  });
};

// Session configuration for SMS auth
export function getSMSAuthSession() {
  return session({
    secret: process.env.SESSION_SECRET || "achievemor-sms-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  });
}