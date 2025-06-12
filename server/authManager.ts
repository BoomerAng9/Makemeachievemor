import { Express } from "express";
import { setupAuth } from "./replitAuth";

export async function setupAuthenticationSystem(app: Express) {
  // Setup Replit Auth as primary authentication
  console.log("Setting up Replit authentication...");
  await setupAuth(app);
  console.log("✓ Replit Auth configured");
}