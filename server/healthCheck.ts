import { db } from "./db";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: { status: string; responseTime?: number };
    email: { status: string; provider?: string };
    maps: { status: string; provider?: string };
    ai: { status: string; provider?: string };
    payment: { status: string; provider?: string };
  };
  version: string;
  uptime: number;
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const services = {
    database: { status: 'unknown' },
    email: { status: 'unknown' },
    maps: { status: 'unknown' },
    ai: { status: 'unknown' },
    payment: { status: 'unknown' }
  };

  // Database health check
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    services.database = {
      status: 'healthy',
      responseTime: Date.now() - dbStart
    };
  } catch (error) {
    services.database = { status: 'unhealthy' };
    console.error('Database health check failed:', error);
  }

  // Email service check
  if (process.env.RESEND_API_KEY) {
    services.email = { status: 'healthy', provider: 'Resend' };
  } else if (process.env.SENDGRID_API_KEY) {
    services.email = { status: 'healthy', provider: 'SendGrid' };
  } else {
    services.email = { status: 'degraded' };
  }

  // Maps service check
  if (process.env.GOOGLE_MAPS_API_KEY) {
    services.maps = { status: 'healthy', provider: 'Google Maps' };
  } else {
    services.maps = { status: 'degraded' };
  }

  // AI service check
  if (process.env.OPENAI_API_KEY) {
    services.ai = { status: 'healthy', provider: 'OpenAI' };
  } else {
    services.ai = { status: 'degraded' };
  }

  // Payment service check
  if (process.env.STRIPE_SECRET_KEY) {
    services.payment = { status: 'healthy', provider: 'Stripe' };
  } else {
    services.payment = { status: 'degraded' };
  }

  // Determine overall status
  const hasUnhealthy = Object.values(services).some(s => s.status === 'unhealthy');
  const hasDegraded = Object.values(services).some(s => s.status === 'degraded');
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (hasUnhealthy) {
    overallStatus = 'unhealthy';
  } else if (hasDegraded) {
    overallStatus = 'degraded';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  };
}