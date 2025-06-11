# DEPLOYMENT

This document provides instructions for deploying the ACHIEVEMOR Owner Operator Platform.

## Overview
This platform is a full-stack application with a React frontend (Vite) and an Express.js backend (Node.js/TypeScript). It requires a PostgreSQL database and uses various external services.

## Prerequisites
- Node.js (version specified in `package.json` or latest LTS)
- npm (usually comes with Node.js)
- A PostgreSQL database instance (local or cloud-hosted)
- API keys for any integrated services you plan to use (OpenAI, Google Maps, SendGrid, Stripe, etc.)

## Environment Variables
The application requires several environment variables to be set for proper functioning. These are typically managed via a `.env` file in local development or through your hosting provider's secrets management system (like Replit Secrets) in production.

Create a `.env` file by copying `.env.example` (located in the project root) and fill in the appropriate values:
```bash
cp .env.example .env
```

Below is a list of required and optional environment variables. Refer to `server/config.ts` for defaults and how these are used.

*   `NODE_ENV`: Set to `production` for deployment. (Default: `development`)
*   `PORT`: The port the application will run on. (Default: `5000`)
*   `DATABASE_URL`: **Required.** Connection string for your PostgreSQL database. Example: `postgresql://user:password@host:port/database`

*   `PLATFORM_NAME`: Name of the platform. (Default: "Choose 2 ACHIEVEMOR")
*   `PLATFORM_DESCRIPTION`: Description of the platform. (Default: "Peer - 2 - Peer Deployment Platform")
*   `SUPPORT_EMAIL`: Support email address. (Default: "contactus@achievemor.io")
*   `SUPPORT_PHONE`: Support phone number. (Default: "912-742-9459")
*   `ADMIN_EMAIL_RECIPIENT`: Email address for admin notifications. (Defaults to `SUPPORT_EMAIL` or "contactus@achievemor.io")

*   `PRICE_TIER_COFFEE`: Price for the "coffee" tier. (Default: "4.30")
*   `PRICE_TIER_STANDARD`: Price for the "standard" tier. (Default: "29.99")
*   `PRICE_TIER_PROFESSIONAL`: Price for the "professional" tier. (Default: "59.99")
*   `PRICE_TIER_OWNER_OPERATOR`: Price for the "owner_operator" tier. (Default: "99.99")

*   `FEATURE_SMS_AUTH_ENABLED`: Enable/disable SMS authentication. (Default: `true`)
*   `FEATURE_STRIPE_PAYMENTS_ENABLED`: Enable/disable Stripe. (Default: `true`)
*   `FEATURE_BACKGROUND_CHECKS_ENABLED`: Enable/disable background checks. (Default: `true`)
*   `FEATURE_GOOGLE_MAPS_ENABLED`: Enable/disable Google Maps. (Default: `true`)
*   `FEATURE_AI_INSIGHTS_ENABLED`: Enable/disable AI insights. (Default: `true`)

*   `MAX_ACTIVE_LOADS_BASIC`: Max active loads for basic tier. (Default: "1")
*   `MAX_ACTIVE_LOADS_STANDARD`: Max active loads for standard tier. (Default: "3")
*   `MAX_ACTIVE_LOADS_PROFESSIONAL`: Max active loads for professional tier. (Default: "10")
*   `JOB_LOCK_TIMEOUT_MINUTES`: Job lock timeout in minutes. (Default: "5")
*   `UPLOAD_MAX_FILE_SIZE_MB`: Max file upload size in MB. (Default: `10`)

*   `MASTER_ADMIN_SETUP_KEY`: Secure key for initial admin setup. **Change this for production!** (Default: "ACHIEVEMOR_MASTER_SETUP_2024_REPLACE_ME")
*   `SESSION_COOKIE_MAX_AGE_HOURS`: Session duration in hours. (Default: `24`)
*   `SESSION_COOKIE_SECURE`: Set to `true` in production if served over HTTPS. (Default: `true` if `NODE_ENV=production`, else `false`)
*   `DEFAULT_EMAIL_DOMAIN_FOR_PHONE_USERS`: Default email domain for phone users. (Default: "app.achievemor.io")

*   `SENDGRID_API_KEY`: **Required if email features are used.** API key for SendGrid.
*   `SENDGRID_FROM_EMAIL`: Email address for sending system emails. (Default: "noreply@achievemor.io")
*   `OPENAI_API_KEY`: **Required for AI features.** API key for OpenAI.
*   `OPENAI_MODEL_NAME`: OpenAI model to use. (Default: `gpt-4o`)
*   `GOOGLE_MAPS_API_KEY`: **Required for map features.** API key for Google Maps.

*   `BACKGROUND_CHECK_DEFAULT_PROVIDER_ID`: Default provider ID for background checks. (Default: `1`)
*   `CHECKR_API_KEY`: API key for Checkr (if used as background check provider).
*   `STERLING_API_KEY`: API key for Sterling (if used as background check provider).

*   `FILE_STORAGE_PROVIDER`: Storage provider for uploads (`local` or `mock-cloud`). (Default: `local`)
*   (Add any S3/GCS specific keys here if they were implemented, e.g. `S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`, etc.)

Ensure these are set correctly in your deployment environment. For Replit, use the Secrets tab. For other hosting providers, consult their documentation for managing environment variables.

## Database Setup

Ensure your PostgreSQL database is running and accessible. The `DATABASE_URL` environment variable must be configured with the correct connection string.

To apply the latest database schema, run the following command in your terminal:
```bash
npm run db:push
```
This command uses Drizzle ORM and Drizzle Kit to synchronize your schema (defined in `shared/schema.ts`) with the database. It's recommended to run this during your deployment process or as a separate migration step.

## Installing Dependencies
Before building or running, ensure all project dependencies are installed. For a production deployment, you typically want to install only production dependencies:
```bash
npm install --omit=dev
```
If your build process requires devDependencies (e.g., TypeScript for building server code), you might need to run `npm install` without the `--omit=dev` flag before the build step, and then potentially prune devDependencies afterwards.

## Building the Application

To create a production build, run:
```bash
npm run build
```
This command typically performs the following:
1.  Builds the client-side React application using Vite (output to `dist/client`).
2.  Builds the server-side TypeScript code using esbuild (output to `dist/server` or similar, based on `tsconfig.json` and build scripts).

The exact output structure might be defined in `vite.config.ts` (for client) and `package.json` scripts or `tsconfig.json` (for server). The goal is to have a `dist/` directory with all necessary assets and compiled code.

## Running in Production

After building the application and ensuring all environment variables are correctly set, start the server using:
```bash
npm run start
```
This command usually executes a script like `node dist/server/index.js` (or similar, check `package.json`'s `scripts.start` field). This will run the optimized production server.

Monitor application logs for any startup errors or runtime issues.

## Replit Deployment
This project is well-suited for deployment on Replit.
- **Environment Variables:** Use Replit's "Secrets" tab to set all the environment variables listed above. `DATABASE_URL` might be auto-configured if using a Replit PostgreSQL database.
- **Build Command:** Replit typically infers this from `npm run build`.
- **Run Command:** Replit typically infers this from `npm run start`.
- **Database:** You can use Replit's built-in PostgreSQL databases. Run `npm run db:push` in the Replit shell after setting up the database and `DATABASE_URL` secret.
- **Health Checks & Auto-scaling:** Replit provides these features automatically for deployed applications.
- **Custom Domains:** Can be configured in Replit deployment settings.
