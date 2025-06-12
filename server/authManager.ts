import { Express } from "express";
import session from "express-session";
import passport from "passport";
import { setupGoogleAuth, isGoogleOAuthConfigured } from "./googleAuth";
import { setupSimpleAuth } from "./simpleAuth";
import { setupSSOAuth } from "./ssoAuth";

export function setupAuthenticationSystem(app: Express) {
  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'contractor-platform-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup authentication strategies
  console.log("Setting up authentication strategies...");
  
  // Google OAuth (if configured)
  if (isGoogleOAuthConfigured()) {
    console.log("✓ Google OAuth configured");
    setupGoogleAuth(app);
  } else {
    console.log("⚠ Google OAuth not configured");
    
    // Provide helpful error message for Google OAuth
    app.get('/api/auth/google', (req, res) => {
      res.status(500).json({ 
        message: "Google OAuth not properly configured",
        details: "Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set and the redirect URI is configured in Google Cloud Console",
        redirectUri: `${req.protocol}://${req.get('host')}/api/auth/google/callback`
      });
    });
  }

  // Simple authentication fallback
  setupSimpleAuth(app);
  
  // SSO authentication
  setupSSOAuth(app);

  // GitHub OAuth placeholder
  app.get('/api/auth/github', (req, res) => {
    res.status(500).json({ 
      message: "GitHub OAuth not configured",
      suggestion: "Use Google OAuth or email/password authentication"
    });
  });

  // Universal logout
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Session destruction failed" });
        }
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  // Authentication status endpoint
  app.get('/api/auth/status', (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated(),
      user: req.isAuthenticated() ? req.user : null,
      availableAuthMethods: {
        google: isGoogleOAuthConfigured(),
        github: false,
        email: true,
        sso: true
      }
    });
  });
}