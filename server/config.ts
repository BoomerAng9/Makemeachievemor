import dotenv from 'dotenv';
dotenv.config();

const stringToBool = (s?: string, defaultValue = false): boolean => {
  if (s === undefined) return defaultValue;
  return s.toLowerCase() === 'true';
};

export const config = {
  // General
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),

  // Platform Settings
  PLATFORM_NAME: process.env.PLATFORM_NAME || 'Choose 2 ACHIEVEMOR',
  PLATFORM_DESCRIPTION: process.env.PLATFORM_DESCRIPTION || 'Peer - 2 - Peer Deployment Platform',
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'contactus@achievemor.io',
  SUPPORT_PHONE: process.env.SUPPORT_PHONE || '912-742-9459',
  ADMIN_EMAIL_RECIPIENT: process.env.ADMIN_EMAIL_RECIPIENT || process.env.SUPPORT_EMAIL || 'contactus@achievemor.io',

  // Pricing Tiers
  PRICE_TIER_COFFEE: process.env.PRICE_TIER_COFFEE || '4.30',
  PRICE_TIER_STANDARD: process.env.PRICE_TIER_STANDARD || '29.99',
  PRICE_TIER_PROFESSIONAL: process.env.PRICE_TIER_PROFESSIONAL || '59.99',
  PRICE_TIER_OWNER_OPERATOR: process.env.PRICE_TIER_OWNER_OPERATOR || '99.99',

  // Feature Flags
  FEATURE_SMS_AUTH_ENABLED: stringToBool(process.env.FEATURE_SMS_AUTH_ENABLED, true),
  FEATURE_STRIPE_PAYMENTS_ENABLED: stringToBool(process.env.FEATURE_STRIPE_PAYMENTS_ENABLED, true),
  FEATURE_BACKGROUND_CHECKS_ENABLED: stringToBool(process.env.FEATURE_BACKGROUND_CHECKS_ENABLED, true),
  FEATURE_GOOGLE_MAPS_ENABLED: stringToBool(process.env.FEATURE_GOOGLE_MAPS_ENABLED, true),
  FEATURE_AI_INSIGHTS_ENABLED: stringToBool(process.env.FEATURE_AI_INSIGHTS_ENABLED, true),

  // Business Logic Settings
  MAX_ACTIVE_LOADS_BASIC: process.env.MAX_ACTIVE_LOADS_BASIC || '1',
  MAX_ACTIVE_LOADS_STANDARD: process.env.MAX_ACTIVE_LOADS_STANDARD || '3',
  MAX_ACTIVE_LOADS_PROFESSIONAL: process.env.MAX_ACTIVE_LOADS_PROFESSIONAL || '10',
  JOB_LOCK_TIMEOUT_MINUTES: process.env.JOB_LOCK_TIMEOUT_MINUTES || '5',
  UPLOAD_MAX_FILE_SIZE_MB: parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || '10', 10),

  // Security / Keys
  MASTER_ADMIN_SETUP_KEY: process.env.MASTER_ADMIN_SETUP_KEY || 'ACHIEVEMOR_MASTER_SETUP_2024_REPLACE_ME',
  SESSION_COOKIE_MAX_AGE_HOURS: parseInt(process.env.SESSION_COOKIE_MAX_AGE_HOURS || '24', 10),
  SESSION_COOKIE_SECURE: stringToBool(process.env.SESSION_COOKIE_SECURE, process.env.NODE_ENV === 'production'),
  DEFAULT_EMAIL_DOMAIN_FOR_PHONE_USERS: process.env.DEFAULT_EMAIL_DOMAIN_FOR_PHONE_USERS || 'app.achievemor.io', // Changed from achievemor.io to avoid conflict with main site

  // External Service API Keys (already used from process.env but listed for completeness)
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'noreply@achievemor.io',
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL_NAME: process.env.OPENAI_MODEL_NAME || 'gpt-4o',

  // Background Check
  BACKGROUND_CHECK_DEFAULT_PROVIDER_ID: parseInt(process.env.BACKGROUND_CHECK_DEFAULT_PROVIDER_ID || '1', 10),
  CHECKR_API_KEY: process.env.CHECKR_API_KEY,
  STERLING_API_KEY: process.env.STERLING_API_KEY,

  // Database URL (example, if Drizzle uses it directly)
  DATABASE_URL: process.env.DATABASE_URL,

  // File Storage
  FILE_STORAGE_PROVIDER: process.env.FILE_STORAGE_PROVIDER || 'local', // 'local', 'mock-cloud', 's3', 'gcs'
};
