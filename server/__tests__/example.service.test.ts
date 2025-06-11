// In server/__tests__/example.service.test.ts
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import type { Server } from 'http';
import { registerRoutes } from '../routes';
import { storage } from '../storage'; // Import the actual storage to get its type, then mock

vi.mock('../storage'); // Auto-mocks all exports

// Cast the auto-mocked storage to have the correct types for mockResolvedValue etc.
const mockedStorage = storage as {
  getContractor: ReturnType<typeof vi.fn>;
  getUser: ReturnType<typeof vi.fn>; // For isAdmin middleware
  // Add other storage methods if needed by routes in example.service.test.ts
};

// Provide a default implementation for storage.getUser immediately
// This will be used when server/routes.ts is first imported and isAdmin is defined.
mockedStorage.getUser.mockImplementation(async (userId: string) => {
  // Default mock for tests in this file, can be overridden in specific test cases if needed
  if (userId === 'admin-user-id') {
    return { id: userId, role: 'admin' } as any;
  }
  return null;
});

let app: express.Express;
let server: Server;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  // Simple mock for user if any route requires it via requireAuth/isAdmin
  app.use((req, res, next) => {
    if (req.headers['x-test-user-id']) {
      (req as any).user = {
        userId: req.headers['x-test-user-id'],
        claims: { sub: req.headers['x-test-user-id'] }
      };
    }
    next();
  });
  server = await registerRoutes(app);
  await new Promise(resolve => server.listen(0, () => resolve(null)));
});

afterAll(async () => {
  await new Promise(resolve => server.close(() => resolve(null)));
  vi.resetAllMocks(); // Reset all mocks after tests run
});

describe('GET /api/contractors/:id', () => {
  it('should return a contractor if found (mocked)', async () => {
    const mockContractorData = { id: 1, firstName: 'Test', lastName: 'User', email: 'test@example.com' };
    mockedStorage.getContractor.mockResolvedValue(mockContractorData);

    const response = await request(server).get('/api/contractors/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockContractorData);
    expect(mockedStorage.getContractor).toHaveBeenCalledWith(1);
  });

  it('should return 404 if contractor not found (mocked)', async () => {
    mockedStorage.getContractor.mockResolvedValue(null);

    const response = await request(server).get('/api/contractors/999');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Contractor not found');
  });
});
