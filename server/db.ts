import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon for serverless environment with error handling
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

// Add WebSocket error handling
const originalWebSocket = ws;
ws.prototype.on = function(event, handler) {
  if (event === 'error') {
    const wrappedHandler = function(error) {
      console.error('WebSocket error:', error);
      // Don't throw, just log
    };
    return originalWebSocket.prototype.on.call(this, event, wrappedHandler);
  }
  return originalWebSocket.prototype.on.call(this, event, handler);
};

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with better error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1, // Limit connections for serverless
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 5000,
});

// Add error handling for pool
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export const db = drizzle({ client: pool, schema });