import { storage } from "./storage";
import { backgroundCheckService } from "./backgroundCheckService";

export async function initializeBackgroundCheckDemo() {
  try {
    console.log("Initializing background check demo data...");

    // Create default background check provider
    const provider = await storage.createBackgroundCheckProvider({
      name: "MockProvider",
      apiEndpoint: "https://mock-background-check-api.com",
      isActive: true,
      supportedChecks: ['mvr', 'criminal', 'employment', 'drug_test', 'full'],
      averageProcessingTime: 120, // 2 hours
      costPerCheck: "25.00",
      configuration: {
        webhookUrl: "/api/background-check/webhook/1",
        apiKey: "mock_api_key",
        sandboxMode: true
      }
    });

    console.log(`Created background check provider: ${provider.name} (ID: ${provider.id})`);

    // Create sample background check template
    const template = await storage.createBackgroundCheckTemplate({
      name: "Standard Owner Operator Check",
      description: "Comprehensive background check for owner operator contractors",
      checkTypes: ['mvr', 'criminal', 'employment'],
      isDefault: true,
      isActive: true,
      requirements: {
        mvr: {
          lookbackYears: 3,
          includeSuspensions: true,
          includeViolations: true
        },
        criminal: {
          lookbackYears: 7,
          includeCounty: true,
          includeState: true,
          includeFederal: true
        },
        employment: {
          verificationPeriod: 2,
          contactPreviousEmployers: true
        }
      },
      automatedTriggers: {
        onContractorRegistration: true,
        renewalPeriodDays: 365
      }
    });

    console.log(`Created background check template: ${template.name} (ID: ${template.id})`);

    // Create sample background check results for demonstration
    const sampleResults = [
      {
        contractorId: 1,
        checkType: "mvr",
        status: "clear" as const,
        overallResult: "pass" as const,
        score: 92,
        findings: [],
        documents: ["mvr_report_001.pdf"],
        verificationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        expiryDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // 335 days from now
        isValid: true
      },
      {
        contractorId: 1,
        checkType: "criminal",
        status: "clear" as const,
        overallResult: "pass" as const,
        score: 95,
        findings: [],
        documents: ["criminal_report_001.pdf"],
        verificationDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
        expiryDate: new Date(Date.now() + 700 * 24 * 60 * 60 * 1000), // 700 days from now
        isValid: true
      },
      {
        contractorId: 1,
        checkType: "employment",
        status: "flagged" as const,
        overallResult: "review_required" as const,
        score: 78,
        findings: [
          "Previous employer contact information outdated",
          "Employment gap of 3 months identified in 2023"
        ],
        documents: ["employment_report_001.pdf"],
        verificationDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
        expiryDate: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000), // 345 days from now
        isValid: true
      }
    ];

    for (const result of sampleResults) {
      // Create a mock request first
      const request = await storage.createBackgroundCheckRequest({
        contractorId: result.contractorId,
        providerId: provider.id,
        requestType: result.checkType,
        status: "completed",
        externalRequestId: `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestData: {
          contractorId: result.contractorId,
          checkType: result.checkType,
          personalInfo: {
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1985-06-15",
            ssn: "1234"
          }
        },
        priority: "standard",
        estimatedCompletion: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        actualCompletion: result.verificationDate,
        cost: "25.00",
        requestedBy: "system"
      });

      // Create the result
      const backgroundResult = await storage.createBackgroundCheckResult({
        ...result,
        requestId: request.id
      });

      console.log(`Created background check result: ${result.checkType} for contractor ${result.contractorId}`);

      // Create alerts for flagged results
      if (result.overallResult === 'review_required') {
        await storage.createBackgroundCheckAlert({
          contractorId: result.contractorId,
          resultId: backgroundResult.id,
          alertType: 'review_required',
          severity: 'medium',
          title: 'Background Check Requires Review',
          message: `${result.checkType.toUpperCase()} background check has flagged items that require manual review`,
          actionRequired: 'Review findings and approve or reject the contractor',
          isResolved: false
        });
      }

      // Create audit log
      await storage.createBackgroundCheckAuditLog({
        contractorId: result.contractorId,
        requestId: request.id,
        action: 'completed',
        performedBy: 'system',
        details: {
          checkType: result.checkType,
          status: result.status,
          score: result.score
        },
        ipAddress: '127.0.0.1',
        userAgent: 'BackgroundCheckService/1.0'
      });
    }

    // Create expiration alerts for demonstration
    await storage.createBackgroundCheckAlert({
      contractorId: 1,
      alertType: 'expiring',
      severity: 'medium',
      title: 'Background Check Expiring Soon',
      message: 'Your MVR background check will expire in 30 days',
      actionRequired: 'Schedule a renewal background check',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      isResolved: false
    });

    console.log("Background check demo initialization completed successfully!");
    
    return {
      providerId: provider.id,
      templateId: template.id,
      resultsCreated: sampleResults.length,
      alertsCreated: 2
    };

  } catch (error) {
    console.error("Failed to initialize background check demo:", error);
    throw error;
  }
}

// Helper function to create background check template
async function createBackgroundCheckTemplate(data: any) {
  // This would be implemented in the storage layer
  // For now, returning a mock template
  return {
    id: 1,
    name: data.name,
    description: data.description,
    checkTypes: data.checkTypes,
    isDefault: data.isDefault,
    isActive: data.isActive,
    requirements: data.requirements,
    automatedTriggers: data.automatedTriggers,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Add this method to the storage interface and implementation
declare module "./storage" {
  interface IStorage {
    createBackgroundCheckTemplate(data: any): Promise<any>;
  }
}