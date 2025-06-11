import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import type { Server } from 'http';
import { registerRoutes } from '../routes'; // Adjust path as needed
import { config } from '../config'; // To use configured port or other settings

import { storage } from '../storage'; // Import the actual storage to get its type, then mock
import * as simpleAuth from '../simpleAuth'; // Import to mock
import { OpportunityService } from '../services/opportunityService'; // Import service to mock its methods

vi.mock('../storage'); // Auto-mocks all exports

// Mock OpportunityService methods
vi.mock('../services/opportunityService');

// Mock simpleAuth.requireAuth
vi.mock('../simpleAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof simpleAuth>();
  return {
    ...actual,
    requireAuth: vi.fn((req: any, res: any, next: any) => {
      // Simulate requireAuth: if x-test-user-id is set, consider authenticated
      // and set req.user. Otherwise, simulate unauthorized.
      if (req.headers['x-test-user-id']) {
        // This is what the actual requireAuth in simpleAuth.ts does: adds 'user' to 'req'.
        // The isAdmin middleware then uses req.user.claims.sub.
        req.user = {
          userId: req.headers['x-test-user-id'], // Used by isAdmin if it looks at req.user.userId
          claims: { sub: req.headers['x-test-user-id'] } // Used by isAdmin via req.user.claims.sub
        };
        return next();
      }
      // If no x-test-user-id, simulate unauthorized as requireAuth would
      return res.status(401).json({ message: "Mocked Auth: Unauthorized (No x-test-user-id header)" });
    }),
  };
});

// Cast the auto-mocked storage to have the correct types for mockResolvedValue etc.
const mockedStorage = storage as {
  getAllApplicationSettings: ReturnType<typeof vi.fn>;
  saveApplicationSetting: ReturnType<typeof vi.fn>;
  getUser: ReturnType<typeof vi.fn>;
  // Add other storage methods used by routes if any, with their vi.fn types
  // No need to mock opportunity methods here as OpportunityService itself is mocked
};

// Provide a default implementation for storage.getUser immediately
// This will be used when server/routes.ts is first imported and isAdmin is defined.
mockedStorage.getUser.mockImplementation(async (userId: string) => {
  if (userId === 'admin-user-id' || userId === 'super-admin-user-id') {
    return { id: userId, role: userId.includes('super') ? 'super_admin' : 'admin' } as any;
  }
  return null;
});

let app: express.Express;
let server: Server;

beforeAll(async () => {
  app = express();
  app.use(express.json());
  // The custom middleware for setting req.user is no longer needed because
  // the mocked requireAuth now handles setting req.user based on the header.
  server = await registerRoutes(app); // registerRoutes returns the http.Server
  await new Promise(resolve => server.listen(0, () => resolve(null)));
});

afterAll(async () => {
  await new Promise(resolve => server.close(() => resolve(null)));
  vi.resetAllMocks();
});

describe('Admin Settings Routes', () => {
  describe('GET /api/admin/settings', () => {
    it('should return merged settings with DB values taking precedence', async () => {
      mockedStorage.getAllApplicationSettings.mockResolvedValue([
        { key: 'PLATFORM_NAME', value: 'DB Platform Name' },
        { key: 'FEATURE_SMS_AUTH_ENABLED', value: 'false' }, // DB stores as string 'false'
      ]);

      const response = await request(server).get('/api/admin/settings');

      expect(response.status).toBe(200);
      expect(response.body.platformName).toBe('DB Platform Name'); // DB overrides config
      expect(response.body.supportEmail).toBe(config.SUPPORT_EMAIL); // From config (not in DB mock)
      expect(response.body.featureSmsAuthEnabled).toBe(false); // DB 'false' string parsed to boolean
      expect(mockedStorage.getAllApplicationSettings).toHaveBeenCalled();
    });

    it('should return config defaults if DB is empty', async () => {
      mockedStorage.getAllApplicationSettings.mockResolvedValue([]);
      const response = await request(server).get('/api/admin/settings');
      expect(response.status).toBe(200);
      expect(response.body.platformName).toBe(config.PLATFORM_NAME);
      expect(response.body.featureSmsAuthEnabled).toBe(config.FEATURE_SMS_AUTH_ENABLED);
    });
  });

  describe('POST /api/admin/settings', () => {
    beforeEach(() => {
      // Clear mocks before each test, but the default implementation above still stands
      // if a specific test doesn't override mockedStorage.getUser again.
      mockedStorage.saveApplicationSetting.mockClear();
      mockedStorage.getUser.mockClear();
      // Re-apply or adjust default mock for getUser if needed, or set specific mocks per test
      // For this test, we rely on the x-test-user-id header and the default mock
      // or we can be more specific:
      mockedStorage.getUser.mockImplementation(async (userId: string) => {
         if (userId === 'admin-user-id') return { id: userId, role: 'admin' } as any;
         if (userId === 'super-admin-user-id') return { id: userId, role: 'super_admin' } as any;
         if (userId === 'non-admin-user-id') return { id: userId, role: 'driver' } as any;
         return null;
      });
    });

    it('should save valid settings and return success for admin role', async () => {
      const newSettings = {
        PLATFORM_NAME: 'New Test Name',
        SUPPORT_EMAIL: 'newsupport@example.com',
        INVALID_KEY: 'should_be_ignored',
      };

      const response = await request(server)
        .post('/api/admin/settings')
        .set('x-test-user-id', 'admin-user-id') // Simulate authenticated admin user
        .send(newSettings);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Settings updated successfully');
      expect(mockedStorage.saveApplicationSetting).toHaveBeenCalledWith('PLATFORM_NAME', 'New Test Name');
      expect(mockedStorage.saveApplicationSetting).toHaveBeenCalledWith('SUPPORT_EMAIL', 'newsupport@example.com');
      expect(mockedStorage.saveApplicationSetting).not.toHaveBeenCalledWith('INVALID_KEY', 'should_be_ignored');
      expect(mockedStorage.saveApplicationSetting).toHaveBeenCalledTimes(2); // Only allowed keys
    });

    it('should save valid settings for super_admin role', async () => {
      const newSettings = { PLATFORM_NAME: 'Super Admin Name' };
      const response = await request(server)
        .post('/api/admin/settings')
        .set('x-test-user-id', 'super-admin-user-id')
        .send(newSettings);

      expect(response.status).toBe(200);
      expect(mockedStorage.saveApplicationSetting).toHaveBeenCalledWith('PLATFORM_NAME', 'Super Admin Name');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(server)
        .post('/api/admin/settings')
        .send({ PLATFORM_NAME: 'No Auth' });
      expect(response.status).toBe(401); // requireAuth middleware
    });

    it('should return 403 if authenticated but not admin', async () => {
      mockedStorage.getUser.mockResolvedValueOnce({ id: 'non-admin-user-id', role: 'driver' } as any);
      const response = await request(server)
        .post('/api/admin/settings')
        .set('x-test-user-id', 'non-admin-user-id')
        .send({ PLATFORM_NAME: 'No Admin Role' });
      expect(response.status).toBe(403); // isAdmin middleware
    });
  });
});


describe('GET /api/auth/user (Unauthenticated)', () => {
  it('should return 401 if not authenticated', async () => {
    const response = await request(server).get('/api/auth/user');
    expect(response.status).toBe(401);
    // The message might come from the mocked requireAuth if no x-test-user-id is set
    expect(response.body.message).toBe('Mocked Auth: Unauthorized (No x-test-user-id header)');
  });
});

// New tests for Job routes using mocked OpportunityService
describe('Job Routes with OpportunityService', () => {
  let mockRequestJob: ReturnType<typeof vi.fn>;
  let mockUpdateJobStatus: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    // Get the mocked constructor and its prototype
    const MockedOpportunityService = OpportunityService as vi.MockedClass<typeof OpportunityService>;

    // Ensure the prototype and its methods are properly mocked if they weren't already
    // by the top-level vi.mock('../services/opportunityService').
    // This is to get a handle on the mock methods for individual test configuration.
    if (!MockedOpportunityService.prototype.requestJob) {
        MockedOpportunityService.prototype.requestJob = vi.fn();
    }
    if (!MockedOpportunityService.prototype.updateJobStatus) {
        MockedOpportunityService.prototype.updateJobStatus = vi.fn();
    }

    mockRequestJob = MockedOpportunityService.prototype.requestJob;
    mockUpdateJobStatus = MockedOpportunityService.prototype.updateJobStatus;
  });

  beforeEach(() => {
    mockRequestJob.mockReset();
    mockUpdateJobStatus.mockReset();
    // Reset storage mocks that might be used by other routes if necessary
    mockedStorage.getUser.mockClear();
    // Setup default for isAdmin used in updateJobStatus if not covered by requireAuth mock alone
    mockedStorage.getUser.mockImplementation(async (userId: string) => {
      if (userId === 'admin-user-id') return { id: userId, role: 'admin', claims: { sub: userId } } as any;
      if (userId === 'driver-user-id') return { id: userId, role: 'driver', claims: { sub: userId } } as any;
      return null;
    });
  });

  describe('POST /api/jobs/:jobId/accept', () => {
    it('should successfully request a job', async () => {
      const mockJobId = 'job-123';
      const mockUserId = 'driver-user-id';
      const mockUpdatedJob = { id: mockJobId, status: 'requested', assigned_to: mockUserId };
      mockRequestJob.mockResolvedValue(mockUpdatedJob);

      const response = await request(server)
        .post(`/api/jobs/${mockJobId}/accept`)
        .set('x-test-user-id', mockUserId); // Simulate authenticated user

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedJob);
      expect(mockRequestJob).toHaveBeenCalledWith(mockJobId, mockUserId);
    });

    it('should return 404 if job not found', async () => {
      const mockJobId = 'job-notfound';
      const mockUserId = 'driver-user-id';
      mockRequestJob.mockRejectedValue(new (await import('../services/opportunityService')).JobNotFoundError());

      const response = await request(server)
        .post(`/api/jobs/${mockJobId}/accept`)
        .set('x-test-user-id', mockUserId);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Job not found');
    });
     it('should return 401 if not authenticated', async () => {
      const response = await request(server).post('/api/jobs/job-123/accept');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/jobs/:jobId/status', () => {
    it('should successfully update job status to picked_up by assigned driver', async () => {
      const mockJobId = 'job-123';
      const mockUserId = 'driver-user-id'; // This user is the assigned driver
      const newStatus = 'picked_up';
      const mockUpdatedJob = { id: mockJobId, status: newStatus, assigned_to: mockUserId };

      mockUpdateJobStatus.mockResolvedValue(mockUpdatedJob);
      // Ensure isAdmin check passes or is not relevant for this user's action
      // The mocked requireAuth sets up req.user.claims.sub = mockUserId
      // The mocked storage.getUser will return a 'driver' role for mockUserId

      const response = await request(server)
        .patch(`/api/jobs/${mockJobId}/status`)
        .set('x-test-user-id', mockUserId)
        .send({ status: newStatus });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedJob);
      // In `updateJobStatus(jobId, status, actingUserId, authenticatedUser)`
      // `actingUserId` comes from `req.user.claims.sub`
      // `authenticatedUser` is `req.user`
      expect(mockUpdateJobStatus).toHaveBeenCalledWith(mockJobId, newStatus, mockUserId, expect.objectContaining({ userId: mockUserId }));
    });

    it('should allow admin to assign a job', async () => {
      const mockJobId = 'job-123';
      const adminUserId = 'admin-user-id';
      const targetUserIdForAssignment = 'driver-user-id'; // Admin might assign to a specific driver (though service logic might need this explicitly)
      const newStatus = 'assigned';
      const mockUpdatedJob = { id: mockJobId, status: newStatus, assigned_to: targetUserIdForAssignment };

      mockUpdateJobStatus.mockResolvedValue(mockUpdatedJob);
      // mockedStorage.getUser will return 'admin' role for adminUserId

      const response = await request(server)
        .patch(`/api/jobs/${mockJobId}/status`)
        .set('x-test-user-id', adminUserId) // Admin user
        .send({ status: newStatus /*, userId: targetUserIdForAssignment */ }); // Body might need userId if admin assigns to specific user

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedJob);
      expect(mockUpdateJobStatus).toHaveBeenCalledWith(mockJobId, newStatus, adminUserId, expect.objectContaining({ userId: adminUserId }));
    });

    it('should return 403 if non-admin tries to assign', async () => {
        const mockJobId = 'job-123';
        const driverUserId = 'driver-user-id';
        const newStatus = 'assigned';

        mockUpdateJobStatus.mockRejectedValue(new (await import('../services/opportunityService')).PermissionDeniedError('User does not have permission to assign job'));
        // mockedStorage.getUser will return 'driver' role

        const response = await request(server)
            .patch(`/api/jobs/${mockJobId}/status`)
            .set('x-test-user-id', driverUserId)
            .send({ status: newStatus });

        expect(response.status).toBe(403);
    });
  });
});
