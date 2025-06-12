import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { securityAuditLogs, deviceTrust, accessControls, complianceEvents } from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import crypto from "crypto";

interface SecurityRequest extends Request {
  securityContext?: {
    deviceId: string;
    trustLevel: string;
    riskScore: number;
    ipAddress: string;
    userAgent: string;
    location?: any;
  };
}

// Device fingerprinting based on headers and characteristics
function generateDeviceFingerprint(req: Request): string {
  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    req.headers['accept'] || '',
    req.ip || '',
    req.headers['x-forwarded-for'] || ''
  ];
  
  return crypto.createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
}

// Risk assessment based on various factors
function calculateRiskScore(req: SecurityRequest, deviceRecord?: any): number {
  let riskScore = 0;
  
  // New device
  if (!deviceRecord) {
    riskScore += 30;
  }
  
  // Suspicious user agent patterns
  const userAgent = req.headers['user-agent'] || '';
  if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler')) {
    riskScore += 40;
  }
  
  // Multiple rapid requests (basic rate limiting check)
  if (req.headers['x-request-count'] && parseInt(req.headers['x-request-count'] as string) > 10) {
    riskScore += 20;
  }
  
  // Unknown or suspicious IP patterns
  const ip = req.ip || '';
  if (ip.includes('tor') || ip.includes('vpn') || ip.includes('proxy')) {
    riskScore += 25;
  }
  
  // Time-based anomalies (accessing during unusual hours)
  const hour = new Date().getHours();
  if (hour < 5 || hour > 23) {
    riskScore += 10;
  }
  
  return Math.min(riskScore, 100);
}

// SOC 2.0 compliance audit logging
async function logSecurityEvent(
  userId: string | null,
  action: string,
  resource: string | null,
  success: boolean,
  req: SecurityRequest,
  failureReason?: string
) {
  try {
    await db.insert(securityAuditLogs).values({
      userId,
      sessionId: req.sessionID || crypto.randomUUID(),
      action,
      resource,
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      deviceId: req.securityContext?.deviceId || 'unknown',
      location: req.securityContext?.location || null,
      riskScore: req.securityContext?.riskScore || 0,
      success,
      failureReason,
      metadata: {
        headers: req.headers,
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Zero Trust device verification middleware
export async function zeroTrustMiddleware(
  req: SecurityRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const deviceFingerprint = generateDeviceFingerprint(req);
    const deviceId = crypto.createHash('md5').update(deviceFingerprint).digest('hex');
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Check if device is known and trusted
    const [deviceRecord] = await db
      .select()
      .from(deviceTrust)
      .where(eq(deviceTrust.deviceFingerprint, deviceFingerprint))
      .limit(1);
    
    // Calculate risk score
    const riskScore = calculateRiskScore(req, deviceRecord);
    
    // Determine trust level
    let trustLevel = 'unknown';
    if (deviceRecord) {
      if (deviceRecord.trustLevel === 'blocked') {
        await logSecurityEvent(
          null,
          'blocked_device_access',
          req.path,
          false,
          req,
          'Device is blocked'
        );
        
        return res.status(403).json({ 
          message: 'Access denied',
          code: 'DEVICE_BLOCKED'
        });
      }
      
      trustLevel = deviceRecord.trustLevel || 'unknown';
      
      // Update last seen
      await db
        .update(deviceTrust)
        .set({ 
          lastSeen: new Date(),
          accessCount: (deviceRecord.accessCount || 0) + 1
        })
        .where(eq(deviceTrust.id, deviceRecord.id));
    } else {
      // New device - create record with conflict handling
      try {
        await db.insert(deviceTrust).values({
          deviceId,
          deviceFingerprint,
          deviceType: detectDeviceType(userAgent),
          browser: detectBrowser(userAgent),
          operatingSystem: detectOS(userAgent),
          trustLevel: 'unknown',
          isActive: true,
          accessCount: 1
        });
      } catch (error: any) {
        if (error.code === '23505') {
          // Device already exists, just continue
          console.log('Device already registered');
        } else {
          throw error;
        }
      }
    }
    
    // High risk - require additional verification
    if (riskScore > 70) {
      await logSecurityEvent(
        null,
        'high_risk_access_attempt',
        req.path,
        false,
        req,
        `High risk score: ${riskScore}`
      );
      
      return res.status(429).json({
        message: 'Additional verification required',
        code: 'HIGH_RISK_DETECTED',
        riskScore
      });
    }
    
    // Set security context
    req.securityContext = {
      deviceId,
      trustLevel,
      riskScore,
      ipAddress,
      userAgent,
      location: await getLocationFromIP(ipAddress)
    };
    
    next();
  } catch (error) {
    console.error('Zero Trust middleware error:', error);
    
    // Log the error but don't block the request in production
    await logSecurityEvent(
      null,
      'security_middleware_error',
      req.path,
      false,
      req,
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    next();
  }
}

// Compliance event tracking for SOC 2.0
export async function trackComplianceEvent(
  eventType: string,
  category: string,
  userId: string | null,
  description: string,
  riskLevel: string = 'low',
  dataTypes: string[] = [],
  systemsAffected: string[] = []
) {
  try {
    await db.insert(complianceEvents).values({
      eventType,
      category,
      userId,
      affectedUsers: userId ? [userId] : [],
      description,
      riskLevel,
      dataTypes,
      systemsAffected,
      complianceStatus: 'pending'
    });
  } catch (error) {
    console.error('Failed to track compliance event:', error);
  }
}

// Access control verification
export async function verifyAccess(
  userId: string,
  resource: string,
  permission: string
): Promise<boolean> {
  try {
    const [accessRecord] = await db
      .select()
      .from(accessControls)
      .where(
        and(
          eq(accessControls.userId, userId),
          eq(accessControls.resource, resource),
          eq(accessControls.permission, permission),
          eq(accessControls.granted, true)
        )
      )
      .limit(1);
    
    if (!accessRecord) {
      return false;
    }
    
    // Check if access has expired
    if (accessRecord.expiresAt && accessRecord.expiresAt < new Date()) {
      return false;
    }
    
    // Update usage tracking
    await db
      .update(accessControls)
      .set({
        lastUsed: new Date(),
        usageCount: (accessRecord.usageCount || 0) + 1
      })
      .where(eq(accessControls.id, accessRecord.id));
    
    return true;
  } catch (error) {
    console.error('Access verification error:', error);
    return false;
  }
}

// Helper functions
function detectDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return /iPad/.test(userAgent) ? 'tablet' : 'mobile';
  }
  return 'desktop';
}

function detectBrowser(userAgent: string): string {
  if (/Chrome/.test(userAgent)) return 'Chrome';
  if (/Firefox/.test(userAgent)) return 'Firefox';
  if (/Safari/.test(userAgent)) return 'Safari';
  if (/Edge/.test(userAgent)) return 'Edge';
  return 'Unknown';
}

function detectOS(userAgent: string): string {
  if (/Windows/.test(userAgent)) return 'Windows';
  if (/Mac/.test(userAgent)) return 'macOS';
  if (/Linux/.test(userAgent)) return 'Linux';
  if (/Android/.test(userAgent)) return 'Android';
  if (/iOS/.test(userAgent)) return 'iOS';
  return 'Unknown';
}

async function getLocationFromIP(ip: string): Promise<any> {
  // In production, integrate with a geolocation service
  // For now, return null to avoid external dependencies
  try {
    // This would typically call an IP geolocation API
    // const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&ip=${ip}`);
    // return await response.json();
    return null;
  } catch (error) {
    return null;
  }
}

// Enhanced authentication middleware with Zero Trust principles
export function enhancedAuth(req: SecurityRequest, res: Response, next: NextFunction) {
  // Log authentication attempt
  logSecurityEvent(
    req.user?.id || null,
    'authentication_attempt',
    req.path,
    !!req.user,
    req,
    req.user ? undefined : 'No authenticated user'
  );
  
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }
  
  // Check device trust level for sensitive operations
  if (req.securityContext?.trustLevel === 'suspicious' && isSensitiveOperation(req)) {
    return res.status(403).json({
      message: 'Additional verification required for this operation',
      code: 'ADDITIONAL_VERIFICATION_REQUIRED'
    });
  }
  
  next();
}

function isSensitiveOperation(req: Request): boolean {
  const sensitivePaths = [
    '/api/payment',
    '/api/subscription',
    '/api/user/delete',
    '/api/admin',
    '/api/documents/share'
  ];
  
  return sensitivePaths.some(path => req.path.startsWith(path));
}