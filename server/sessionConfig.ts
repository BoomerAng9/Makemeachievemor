import session from "express-session";

export function createSessionConfig() {
  return session({
    secret: process.env.SESSION_SECRET || "achievemor-session-secret-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  });
}