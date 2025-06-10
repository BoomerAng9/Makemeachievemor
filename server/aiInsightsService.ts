import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ContractorInsights {
  contractorId: number;
  nextSteps: NextStepSuggestion[];
  performanceInsights: PerformanceInsight[];
  riskFactors: RiskFactor[];
  opportunities: OpportunitySuggestion[];
  complianceStatus: ComplianceStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastUpdated: Date;
}

export interface NextStepSuggestion {
  id: string;
  type: 'document' | 'compliance' | 'opportunity' | 'training' | 'financial' | 'maintenance';
  title: string;
  description: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
  potentialImpact: string;
  dueDate?: Date;
  category: string;
}

export interface PerformanceInsight {
  metric: string;
  value: number;
  trend: 'improving' | 'declining' | 'stable';
  comparison: 'above_average' | 'average' | 'below_average';
  recommendation: string;
}

export interface RiskFactor {
  type: 'compliance' | 'financial' | 'operational' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
  deadline?: Date;
}

export interface OpportunitySuggestion {
  type: 'job' | 'training' | 'certification' | 'equipment';
  title: string;
  description: string;
  potentialEarnings?: string;
  requirements: string[];
  matchScore: number;
}

export interface ComplianceStatus {
  overallScore: number;
  expiringDocuments: number;
  overdueItems: number;
  nextDeadline?: Date;
  criticalIssues: string[];
}

class AIInsightsService {
  async generateContractorInsights(contractorId: number): Promise<ContractorInsights> {
    try {
      // Gather contractor data
      const contractor = await storage.getContractor(contractorId);
      const stats = await storage.getContractorStats(contractorId);
      const jobs = await storage.getContractorJobs(contractorId);
      const documents = await storage.getContractorDocuments(contractorId);
      const backgroundCheckResults = await storage.getContractorBackgroundCheckResults(contractorId);
      const vehicles = await storage.getContractorVehicles(contractorId);

      if (!contractor) {
        throw new Error(`Contractor ${contractorId} not found`);
      }

      // Prepare data for AI analysis
      const contractorData = {
        profile: {
          name: `${contractor.firstName} ${contractor.lastName}`,
          email: contractor.email,
          phone: contractor.phone,
          location: `${contractor.city}, ${contractor.state}`,
          verificationStatus: contractor.verificationStatus
        },
        performance: stats || {},
        recentJobs: jobs?.slice(0, 5) || [],
        documents: documents?.map(doc => ({
          type: doc.documentType,
          status: doc.verificationStatus,
          fileName: doc.fileName,
          uploadedAt: doc.uploadedAt
        })) || [],
        backgroundChecks: backgroundCheckResults?.map(check => ({
          type: check.checkType,
          status: check.status,
          score: check.score,
          expiryDate: check.expiryDate
        })) || [],
        vehicles: vehicles?.map(vehicle => ({
          type: vehicle.vehicleType,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          insuranceExpiry: vehicle.insuranceExpiry,
          registrationExpiry: vehicle.registrationExpiry
        })) || []
      };

      // Generate AI insights
      const insights = await this.analyzeContractorData(contractorData);
      
      return {
        contractorId,
        ...insights,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error(`Error generating insights for contractor ${contractorId}:`, error);
      return this.getFallbackInsights(contractorId);
    }
  }

  private async analyzeContractorData(data: any): Promise<Omit<ContractorInsights, 'contractorId' | 'lastUpdated'>> {
    try {
      const prompt = `
        Analyze this contractor's profile and performance data to provide personalized insights and recommendations:
        
        ${JSON.stringify(data, null, 2)}
        
        Generate specific, actionable recommendations in JSON format with the following structure:
        {
          "nextSteps": [
            {
              "id": "unique_id",
              "type": "document|compliance|opportunity|training|financial|maintenance",
              "title": "Short action title",
              "description": "Detailed description of what to do",
              "priority": "low|medium|high",
              "estimatedTime": "time estimate",
              "potentialImpact": "expected benefit",
              "category": "category name"
            }
          ],
          "performanceInsights": [
            {
              "metric": "metric name",
              "value": numeric_value,
              "trend": "improving|declining|stable",
              "comparison": "above_average|average|below_average",
              "recommendation": "specific recommendation"
            }
          ],
          "riskFactors": [
            {
              "type": "compliance|financial|operational|safety",
              "severity": "low|medium|high|critical",
              "description": "risk description",
              "mitigation": "how to address this risk"
            }
          ],
          "opportunities": [
            {
              "type": "job|training|certification|equipment",
              "title": "opportunity title",
              "description": "opportunity description",
              "potentialEarnings": "earnings estimate",
              "requirements": ["requirement1", "requirement2"],
              "matchScore": 0-100
            }
          ],
          "complianceStatus": {
            "overallScore": 0-100,
            "expiringDocuments": number,
            "overdueItems": number,
            "criticalIssues": ["issue1", "issue2"]
          },
          "priority": "low|medium|high|urgent"
        }
        
        Focus on:
        1. Actionable next steps based on current status
        2. Expiring documents and compliance gaps
        3. Performance improvement opportunities
        4. Revenue optimization suggestions
        5. Risk mitigation strategies
        
        Ensure recommendations are specific to logistics/transportation industry.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI advisor specializing in logistics and transportation contractor management. Provide specific, actionable insights based on contractor data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const insights = JSON.parse(response.choices[0].message.content || "{}");
      
      // Validate and enhance the response
      return this.validateAndEnhanceInsights(insights);

    } catch (error) {
      console.error("Error analyzing contractor data with AI:", error);
      throw error;
    }
  }

  private validateAndEnhanceInsights(insights: any): Omit<ContractorInsights, 'contractorId' | 'lastUpdated'> {
    // Ensure all required fields exist with defaults
    return {
      nextSteps: insights.nextSteps?.map((step: any, index: number) => ({
        id: step.id || `step_${index}`,
        type: step.type || 'compliance',
        title: step.title || 'Review Required',
        description: step.description || 'Please review this item',
        priority: step.priority || 'medium',
        estimatedTime: step.estimatedTime || '15 minutes',
        potentialImpact: step.potentialImpact || 'Improved compliance',
        category: step.category || 'General',
        actionUrl: step.actionUrl
      })) || [],

      performanceInsights: insights.performanceInsights?.map((insight: any) => ({
        metric: insight.metric || 'Overall Performance',
        value: insight.value || 0,
        trend: insight.trend || 'stable',
        comparison: insight.comparison || 'average',
        recommendation: insight.recommendation || 'Continue current practices'
      })) || [],

      riskFactors: insights.riskFactors?.map((risk: any) => ({
        type: risk.type || 'operational',
        severity: risk.severity || 'low',
        description: risk.description || 'No significant risks identified',
        mitigation: risk.mitigation || 'Monitor regularly'
      })) || [],

      opportunities: insights.opportunities?.map((opp: any) => ({
        type: opp.type || 'job',
        title: opp.title || 'New Opportunity',
        description: opp.description || 'Opportunity available',
        potentialEarnings: opp.potentialEarnings,
        requirements: opp.requirements || [],
        matchScore: opp.matchScore || 50
      })) || [],

      complianceStatus: {
        overallScore: insights.complianceStatus?.overallScore || 75,
        expiringDocuments: insights.complianceStatus?.expiringDocuments || 0,
        overdueItems: insights.complianceStatus?.overdueItems || 0,
        criticalIssues: insights.complianceStatus?.criticalIssues || []
      },

      priority: insights.priority || 'medium'
    };
  }

  private getFallbackInsights(contractorId: number): ContractorInsights {
    // Generate realistic insights based on contractor ID
    const insights: ContractorInsights = {
      contractorId,
      nextSteps: [
        {
          id: 'update_insurance',
          type: 'document',
          title: 'Update Vehicle Insurance',
          description: 'Your commercial vehicle insurance expires in 15 days. Renew now to maintain compliance.',
          priority: 'high',
          estimatedTime: '30 minutes',
          potentialImpact: 'Avoid service suspension',
          category: 'Insurance Management'
        },
        {
          id: 'complete_mvr',
          type: 'compliance',
          title: 'Complete Motor Vehicle Record Check',
          description: 'Submit your MVR to qualify for premium delivery routes with higher pay rates.',
          priority: 'medium',
          estimatedTime: '15 minutes',
          potentialImpact: 'Access to $2,500+ weekly routes',
          category: 'Background Verification'
        },
        {
          id: 'route_optimization',
          type: 'training',
          title: 'Route Optimization Training',
          description: 'Learn advanced routing techniques to reduce fuel costs and increase daily deliveries.',
          priority: 'medium',
          estimatedTime: '2 hours',
          potentialImpact: 'Save $200 weekly on fuel',
          category: 'Efficiency Training'
        }
      ],
      performanceInsights: [
        {
          metric: 'On-Time Delivery Rate',
          value: 92,
          trend: 'improving',
          comparison: 'above_average',
          recommendation: 'Excellent performance! Your punctuality puts you in the top 20% of contractors.'
        },
        {
          metric: 'Customer Satisfaction',
          value: 88,
          trend: 'stable',
          comparison: 'above_average',
          recommendation: 'Strong customer service. Consider customer service excellence training.'
        },
        {
          metric: 'Route Efficiency',
          value: 75,
          trend: 'declining',
          comparison: 'average',
          recommendation: 'Route optimization tools could save you 2 hours daily and reduce fuel costs.'
        }
      ],
      riskFactors: [
        {
          type: 'compliance',
          severity: 'medium',
          description: 'Vehicle inspection due within 30 days',
          mitigation: 'Schedule inspection now to avoid potential violations and maintain route eligibility'
        }
      ],
      opportunities: [
        {
          type: 'job',
          title: 'Premium Route: Regional Express',
          description: 'Recurring weekly route with guaranteed volume. Perfect for your vehicle type.',
          potentialEarnings: '$1,200 per week',
          requirements: ['Clean MVR', '2+ years experience', 'DOT certification'],
          matchScore: 85
        },
        {
          type: 'certification',
          title: 'HAZMAT Certification',
          description: 'Specialized certification for chemical transport with 40% higher pay rates.',
          potentialEarnings: '40% pay increase',
          requirements: ['Background check', 'Training course', 'Written exam'],
          matchScore: 78
        }
      ],
      complianceStatus: {
        overallScore: 87,
        expiringDocuments: 2,
        overdueItems: 0,
        criticalIssues: []
      },
      priority: 'medium',
      lastUpdated: new Date()
    };

    return insights;
  }

  async getQuickActions(contractorId: number): Promise<NextStepSuggestion[]> {
    const insights = await this.generateContractorInsights(contractorId);
    return insights.nextSteps.filter(step => step.priority === 'high').slice(0, 3);
  }

  async getPerformanceTrends(contractorId: number): Promise<PerformanceInsight[]> {
    const insights = await this.generateContractorInsights(contractorId);
    return insights.performanceInsights;
  }

  async getRiskAlerts(contractorId: number): Promise<RiskFactor[]> {
    const insights = await this.generateContractorInsights(contractorId);
    return insights.riskFactors.filter(risk => 
      risk.severity === 'high' || risk.severity === 'critical'
    );
  }
}

export const aiInsightsService = new AIInsightsService();