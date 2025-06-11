# Deployment Guide

## Replit Deployment (Recommended)

This project is optimized for deployment on Replit with the following benefits:
- Automatic SSL/TLS certificates
- Built-in health monitoring  
- Auto-scaling capabilities
- Integrated PostgreSQL database
- Environment secrets management

### Pre-deployment Checklist

1. **Environment Variables** - Ensure all secrets are configured in Replit:
   - `DATABASE_URL` - PostgreSQL connection (auto-configured)
   - `OPENAI_API_KEY` - For AI chatbot functionality
   - `GOOGLE_MAPS_API_KEY` - For location services
   - `SESSION_SECRET` - Session encryption key (auto-generated)
   - `SENDGRID_API_KEY` - For sending emails
   - `CHECKR_API_KEY` - For Checkr background checks (if used)
   - `STERLING_API_KEY` - For Sterling background checks (if used)
   - See `.env.example` for a full list of configurable variables.

2. **Database Setup** - Run migrations:
   ```bash
   npm run db:push
   ```

3. **Build Verification** - Test production build:
   ```bash
   npm run build
   ```

### Deploy to Replit

1. Click the "Deploy" button in Replit
2. Configure custom domain (optional)
3. Monitor deployment logs
4. Verify all services are running

## Alternative Deployment Options

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Production Considerations

- Database migrations should be run before deployment
- Monitor application logs for errors
- Set up backup strategies for user data
- Configure CDN for static assets
- Enable database connection pooling
- Set up monitoring and alerting

## Post-deployment Testing

- Verify user registration flow
- Test AI chatbot functionality
- Confirm file upload capabilities
- Validate authentication system
- Check mobile responsiveness

## Environment Variables

This project uses environment variables for configuration. Create a `.env` file in the root of the project (copy from `.env.example`) and populate it with the necessary values for your environment.

Below is a list of environment variables used by the application:

-   `NODE_ENV`: The node environment, e.g., "development", "production".
-   `PORT`: The port the server will listen on.
-   `PLATFORM_NAME`: The name of the platform, displayed in various parts of the UI and communications.
-   `PLATFORM_DESCRIPTION`: A short description of the platform.
-   `SUPPORT_EMAIL`: Email address for user support.
-   `SUPPORT_PHONE`: Phone number for user support.
-   `ADMIN_EMAIL_RECIPIENT`: Email address where admin notifications (e.g., new user registration) are sent.
-   `PRICE_TIER_COFFEE`: Price for the "coffee" tier.
-   `PRICE_TIER_STANDARD`: Price for the "standard" tier.
-   `PRICE_TIER_PROFESSIONAL`: Price for the "professional" tier.
-   `PRICE_TIER_OWNER_OPERATOR`: Price for the "owner_operator" tier.
-   `FEATURE_SMS_AUTH_ENABLED`: ("true" or "false") Enables or disables SMS-based authentication.
-   `FEATURE_STRIPE_PAYMENTS_ENABLED`: ("true" or "false") Enables or disables Stripe integration for payments.
-   `FEATURE_BACKGROUND_CHECKS_ENABLED`: ("true" or "false") Enables or disables background check features.
-   `FEATURE_GOOGLE_MAPS_ENABLED`: ("true" or "false") Enables or disables Google Maps integration.
-   `FEATURE_AI_INSIGHTS_ENABLED`: ("true"or "false") Enables or disables AI-powered insights.
-   `MAX_ACTIVE_LOADS_BASIC`: Maximum number of active loads for basic tier users.
-   `MAX_ACTIVE_LOADS_STANDARD`: Maximum number of active loads for standard tier users.
-   `MAX_ACTIVE_LOADS_PROFESSIONAL`: Maximum number of active loads for professional tier users.
-   `JOB_LOCK_TIMEOUT_MINUTES`: Timeout in minutes for job locks.
-   `UPLOAD_MAX_FILE_SIZE_MB`: Maximum file size for uploads in megabytes.
-   `MASTER_ADMIN_SETUP_KEY`: A secret key used for the initial master admin setup. **Change this in production.**
-   `SESSION_COOKIE_MAX_AGE_HOURS`: Max age for session cookies in hours.
-   `SESSION_COOKIE_SECURE`: ("true" or "false") Whether session cookies should only be sent over HTTPS. Set to "true" in production.
-   `DEFAULT_EMAIL_DOMAIN_FOR_PHONE_USERS`: Default email domain assigned to users who sign up with a phone number.
-   `SENDGRID_API_KEY`: API key for SendGrid email service.
-   `SENDGRID_FROM_EMAIL`: The "from" email address used by SendGrid.
-   `GOOGLE_MAPS_API_KEY`: API key for Google Maps services.
-   `OPENAI_API_KEY`: API key for OpenAI services.
-   `OPENAI_MODEL_NAME`: The OpenAI model to be used (e.g., "gpt-4o", "gpt-3.5-turbo").
-   `BACKGROUND_CHECK_DEFAULT_PROVIDER_ID`: The ID of the default background check provider to use (e.g., 1 for Mock, or ID of Checkr/Sterling if configured).
-   `CHECKR_API_KEY`: API key for Checkr background check service.
-   `STERLING_API_KEY`: API key for Sterling background check service.
-   `DATABASE_URL`: Connection string for the PostgreSQL database.

**Note:** For production deployments, ensure all sensitive keys and production-specific settings are correctly configured in your hosting environment's secrets management, not directly in a `.env` file committed to the repository. The `.env` file is primarily for local development.