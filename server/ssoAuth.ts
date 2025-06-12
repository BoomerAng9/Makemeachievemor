import { Express } from "express";
import { storage } from "./storage";

// SSO configuration for different providers
const SSO_CONFIG = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid email profile'
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:5000/api/auth/github/callback',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scope: 'user:email'
  }
};

export function setupSSOAuth(app: Express) {
  // Google OAuth initiation
  app.get('/api/auth/google', (req, res) => {
    const config = SSO_CONFIG.google;
    if (!config.clientId) {
      return res.status(500).json({ message: 'Google OAuth not configured' });
    }

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set('client_id', config.clientId);
    authUrl.searchParams.set('redirect_uri', config.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', config.scope);
    authUrl.searchParams.set('state', 'google_auth');

    res.redirect(authUrl.toString());
  });

  // GitHub OAuth initiation
  app.get('/api/auth/github', (req, res) => {
    const config = SSO_CONFIG.github;
    if (!config.clientId) {
      return res.status(500).json({ message: 'GitHub OAuth not configured' });
    }

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set('client_id', config.clientId);
    authUrl.searchParams.set('redirect_uri', config.redirectUri);
    authUrl.searchParams.set('scope', config.scope);
    authUrl.searchParams.set('state', 'github_auth');

    res.redirect(authUrl.toString());
  });

  // Google OAuth callback
  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      const config = SSO_CONFIG.google;

      if (!code || state !== 'google_auth') {
        return res.redirect('/login?error=oauth_error');
      }

      // Exchange code for access token
      const tokenResponse = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId!,
          client_secret: config.clientSecret!,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri
        })
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        return res.redirect('/login?error=token_error');
      }

      // Get user info
      const userResponse = await fetch(config.userInfoUrl, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      const userData = await userResponse.json();
      
      // Create or update user
      const user = await createOrUpdateSSOUser({
        email: userData.email,
        name: userData.name,
        firstName: userData.given_name,
        lastName: userData.family_name,
        profileImageUrl: userData.picture,
        provider: 'google',
        providerId: userData.id
      });

      // Log in the user
      req.login(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.redirect('/login?error=login_error');
        }
        res.redirect('/');
      });

    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect('/login?error=oauth_error');
    }
  });

  // GitHub OAuth callback
  app.get('/api/auth/github/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      const config = SSO_CONFIG.github;

      if (!code || state !== 'github_auth') {
        return res.redirect('/login?error=oauth_error');
      }

      // Exchange code for access token
      const tokenResponse = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: new URLSearchParams({
          client_id: config.clientId!,
          client_secret: config.clientSecret!,
          code: code as string,
          redirect_uri: config.redirectUri
        })
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        return res.redirect('/login?error=token_error');
      }

      // Get user info
      const userResponse = await fetch(config.userInfoUrl, {
        headers: { 
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'ACHIEVEMOR-App'
        }
      });

      const userData = await userResponse.json();

      // Get user email if not public
      let email = userData.email;
      if (!email) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: { 
            Authorization: `Bearer ${tokenData.access_token}`,
            'User-Agent': 'ACHIEVEMOR-App'
          }
        });
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e: any) => e.primary);
        email = primaryEmail?.email || userData.email;
      }
      
      // Create or update user
      const user = await createOrUpdateSSOUser({
        email: email,
        name: userData.name || userData.login,
        firstName: userData.name?.split(' ')[0] || userData.login,
        lastName: userData.name?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: userData.avatar_url,
        provider: 'github',
        providerId: userData.id.toString()
      });

      // Log in the user
      req.login(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.redirect('/login?error=login_error');
        }
        res.redirect('/');
      });

    } catch (error) {
      console.error('GitHub OAuth error:', error);
      res.redirect('/login?error=oauth_error');
    }
  });
}

async function createOrUpdateSSOUser(ssoData: {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  provider: string;
  providerId: string;
}) {
  try {
    // Check if user exists by email
    let user = await storage.getUserByEmail(ssoData.email);
    
    if (user) {
      // Update existing user with SSO info
      user = await storage.updateUser(user.id, {
        firstName: ssoData.firstName || user.firstName,
        lastName: ssoData.lastName || user.lastName,
        profileImageUrl: ssoData.profileImageUrl || user.profileImageUrl,
        registrationSource: ssoData.provider,
        lastLoginAt: new Date()
      });
    } else {
      // Create new user
      const userId = `${ssoData.provider}_${ssoData.providerId}`;
      user = await storage.createUser({
        id: userId,
        email: ssoData.email,
        username: ssoData.email, // Use email as username for SSO users
        password: '', // No password for SSO users
        name: ssoData.name,
        firstName: ssoData.firstName,
        lastName: ssoData.lastName,
        profileImageUrl: ssoData.profileImageUrl,
        role: 'contractor',
        status: 'active',
        registrationSource: ssoData.provider,
        lastLoginAt: new Date()
      });
    }

    return user;
  } catch (error) {
    console.error('Error creating/updating SSO user:', error);
    throw error;
  }
}