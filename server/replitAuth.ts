import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  const user = await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    accountStatus: "active", // No waiting period - immediate access
    verificationStatus: "unverified",
    lastLoginAt: new Date(),
  });

  // Create contractor profile if it doesn't exist
  await ensureContractorProfile(user);

  // Send registration notification to admin
  await sendRegistrationNotification(user);
  
  return user;
}

async function ensureContractorProfile(user: any) {
  try {
    // Check if contractor profile exists
    const existingContractor = await storage.getContractor(user.id);
    
    if (!existingContractor) {
      // Create contractor profile
      await storage.createContractor({
        id: user.id,
        userId: user.id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        dateOfBirth: "",
        licenseNumber: "",
        licenseState: "",
        licenseExpiryDate: null,
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
        accountHolderName: "",
        taxId: "",
        businessType: "individual",
        yearsOfExperience: 0,
        preferredRoutes: [],
        availability: "full_time",
        maxDistance: 500,
        profileCompleted: false,
      });
    }
  } catch (error) {
    console.error("Error ensuring contractor profile:", error);
    // Don't throw - allow user creation to continue
  }
}

async function sendRegistrationNotification(user: any) {
  try {
    // Create notification record
    await storage.createRegistrationNotification({
      userId: user.id,
      notificationSent: false,
      adminNotified: false,
      requiresApproval: false, // Auto-approve for immediate access
    });

    // Send email notification to admin
    const { emailService } = await import("./emailService");
    const emailSent = await emailService.sendRegistrationNotification(user);
    
    if (emailSent) {
      console.log("Registration notification sent to admin for:", user.email);
    } else {
      console.log("Registration notification logged (SendGrid not configured) for:", user.email);
    }
    
  } catch (error) {
    console.error("Failed to send registration notification:", error);
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};