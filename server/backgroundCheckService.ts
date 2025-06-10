import { 
  BackgroundCheckProvider as DBBackgroundCheckProvider, 
  BackgroundCheckRequest, 
  BackgroundCheckResult,
  InsertBackgroundCheckRequest,
  InsertBackgroundCheckResult,
  InsertBackgroundCheckAlert,
  InsertBackgroundCheckAuditLog
} from "@shared/schema";
import { storage } from "./storage";

export interface BackgroundCheckProviderAPI {
  name: string;
  processCheck(request: BackgroundCheckRequestData): Promise<BackgroundCheckResponse>;
  getStatus(externalId: string): Promise<BackgroundCheckStatus>;
}

export interface BackgroundCheckRequestData {
  contractorId: number;
  checkType: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  drivingLicense?: {
    number: string;
    state: string;
    expiryDate: string;
  };
  consent: boolean;
  priority: 'urgent' | 'standard' | 'low';
}

export interface BackgroundCheckResponse {
  externalRequestId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  estimatedCompletion?: Date;
  cost?: number;
  trackingUrl?: string;
}

export interface BackgroundCheckStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  results?: {
    checkType: string;
    status: 'clear' | 'flagged' | 'failed' | 'inconclusive';
    overallResult: 'pass' | 'fail' | 'review_required';
    score?: number;
    findings: any[];
    documents: string[];
  };
  completedAt?: Date;
}

// Mock provider for demonstration - replace with real integrations
class MockBackgroundCheckProvider implements BackgroundCheckProvider {
  name = "MockProvider";

  async processCheck(request: BackgroundCheckRequestData): Promise<BackgroundCheckResponse> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      externalRequestId: `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      estimatedCompletion: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      cost: this.calculateCost(request.checkType),
      trackingUrl: `https://mock-provider.com/track/${Date.now()}`
    };
  }

  async getStatus(externalId: string): Promise<BackgroundCheckStatus> {
    // Simulate status check
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock completion for demo
    return {
      status: 'completed',
      results: {
        checkType: 'mvr',
        status: 'clear',
        overallResult: 'pass',
        score: 85,
        findings: [],
        documents: []
      },
      completedAt: new Date()
    };
  }

  private calculateCost(checkType: string): number {
    const costs = {
      'mvr': 15.00,
      'criminal': 25.00,
      'employment': 20.00,
      'drug_test': 45.00,
      'full': 80.00
    };
    return costs[checkType as keyof typeof costs] || 25.00;
  }
}

// Real provider integrations would go here
class CheckrProvider implements BackgroundCheckProvider {
  name = "Checkr";
  private apiKey: string;
  private baseUrl = "https://api.checkr.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async processCheck(request: BackgroundCheckRequestData): Promise<BackgroundCheckResponse> {
    // Implementation would integrate with Checkr API
    throw new Error("Checkr integration requires API key configuration");
  }

  async getStatus(externalId: string): Promise<BackgroundCheckStatus> {
    // Implementation would check Checkr API status
    throw new Error("Checkr integration requires API key configuration");
  }
}

class SterlingProvider implements BackgroundCheckProvider {
  name = "Sterling";
  private apiKey: string;
  private baseUrl = "https://api.sterlingcheck.com/v2";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async processCheck(request: BackgroundCheckRequestData): Promise<BackgroundCheckResponse> {
    // Implementation would integrate with Sterling API
    throw new Error("Sterling integration requires API key configuration");
  }

  async getStatus(externalId: string): Promise<BackgroundCheckStatus> {
    // Implementation would check Sterling API status
    throw new Error("Sterling integration requires API key configuration");
  }
}

export class BackgroundCheckService {
  private providers: Map<string, BackgroundCheckProvider> = new Map();

  constructor() {
    // Initialize with mock provider for demo
    this.providers.set('mock', new MockBackgroundCheckProvider());
    
    // Real providers would be initialized with API keys from environment
    // this.providers.set('checkr', new CheckrProvider(process.env.CHECKR_API_KEY!));
    // this.providers.set('sterling', new SterlingProvider(process.env.STERLING_API_KEY!));
  }

  async submitBackgroundCheck(
    contractorId: number, 
    checkType: string, 
    personalInfo: any,
    providerId: number = 1, // Default to mock provider
    requestedBy: string
  ): Promise<BackgroundCheckRequest> {
    try {
      // Get provider configuration
      const providerConfig = await storage.getBackgroundCheckProvider(providerId);
      if (!providerConfig) {
        throw new Error('Provider not found');
      }

      const provider = this.providers.get(providerConfig.name.toLowerCase());
      if (!provider) {
        throw new Error('Provider not configured');
      }

      // Create request data
      const requestData: BackgroundCheckRequestData = {
        contractorId,
        checkType,
        personalInfo,
        consent: true,
        priority: 'standard'
      };

      // Submit to provider
      const response = await provider.processCheck(requestData);

      // Save request to database
      const request = await storage.createBackgroundCheckRequest({
        contractorId,
        providerId,
        requestType: checkType,
        status: response.status,
        externalRequestId: response.externalRequestId,
        requestData: requestData as any,
        estimatedCompletion: response.estimatedCompletion,
        cost: response.cost?.toString(),
        requestedBy
      });

      // Log audit trail
      await storage.createBackgroundCheckAuditLog({
        contractorId,
        requestId: request.id,
        action: 'requested',
        performedBy: requestedBy,
        details: { checkType, provider: provider.name },
        ipAddress: '', // Would be passed from request
        userAgent: '' // Would be passed from request
      });

      return request;
    } catch (error) {
      console.error('Background check submission failed:', error);
      throw error;
    }
  }

  async checkStatus(requestId: number): Promise<void> {
    try {
      const request = await storage.getBackgroundCheckRequest(requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      const providerConfig = await storage.getBackgroundCheckProvider(request.providerId);
      if (!providerConfig) {
        throw new Error('Provider not found');
      }

      const provider = this.providers.get(providerConfig.name.toLowerCase());
      if (!provider) {
        throw new Error('Provider not configured');
      }

      // Check status with provider
      const status = await provider.getStatus(request.externalRequestId!);

      // Update request status
      await storage.updateBackgroundCheckRequest(requestId, {
        status: status.status,
        actualCompletion: status.completedAt
      });

      // If completed, save results
      if (status.status === 'completed' && status.results) {
        await storage.createBackgroundCheckResult({
          requestId,
          contractorId: request.contractorId,
          checkType: status.results.checkType,
          status: status.results.status,
          overallResult: status.results.overallResult,
          score: status.results.score,
          findings: status.results.findings,
          documents: status.results.documents,
          verificationDate: new Date(),
          expiryDate: this.calculateExpiryDate(status.results.checkType),
          isValid: true
        });

        // Check if alerts need to be created
        await this.evaluateResults(request.contractorId, status.results);
      }
    } catch (error) {
      console.error('Status check failed:', error);
      throw error;
    }
  }

  async processWebhook(providerId: number, payload: any): Promise<void> {
    // Handle webhook notifications from providers
    try {
      const externalRequestId = payload.id || payload.request_id;
      const request = await storage.getBackgroundCheckRequestByExternalId(externalRequestId);
      
      if (request) {
        await this.checkStatus(request.id);
      }
    } catch (error) {
      console.error('Webhook processing failed:', error);
    }
  }

  private calculateExpiryDate(checkType: string): Date {
    const expiryPeriods = {
      'mvr': 12, // 12 months
      'criminal': 24, // 24 months
      'employment': 36, // 36 months
      'drug_test': 6, // 6 months
      'full': 12 // 12 months
    };

    const months = expiryPeriods[checkType as keyof typeof expiryPeriods] || 12;
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);
    return expiryDate;
  }

  private async evaluateResults(contractorId: number, results: any): Promise<void> {
    // Create alerts based on results
    if (results.overallResult === 'fail') {
      await storage.createBackgroundCheckAlert({
        contractorId,
        alertType: 'failed',
        severity: 'high',
        title: 'Background Check Failed',
        message: `Background check of type ${results.checkType} has failed`,
        actionRequired: 'Review findings and determine next steps',
        isResolved: false
      });
    } else if (results.overallResult === 'review_required') {
      await storage.createBackgroundCheckAlert({
        contractorId,
        alertType: 'review_required',
        severity: 'medium',
        title: 'Background Check Requires Review',
        message: `Background check of type ${results.checkType} requires manual review`,
        actionRequired: 'Review findings and approve or reject',
        isResolved: false
      });
    }
  }

  async scheduleRenewalAlerts(): Promise<void> {
    // Check for expiring background checks and create alerts
    const expiringResults = await storage.getExpiringBackgroundCheckResults(30); // 30 days
    
    for (const result of expiringResults) {
      await storage.createBackgroundCheckAlert({
        contractorId: result.contractorId,
        resultId: result.id,
        alertType: 'expiring',
        severity: 'medium',
        title: 'Background Check Expiring Soon',
        message: `Background check of type ${result.checkType} expires on ${result.expiryDate}`,
        actionRequired: 'Schedule renewal background check',
        dueDate: result.expiryDate,
        isResolved: false
      });
    }
  }
}

export const backgroundCheckService = new BackgroundCheckService();