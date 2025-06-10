import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  FileText,
  GraduationCap,
  DollarSign,
  Wrench,
  Users,
  ChevronRight,
  Lightbulb,
  BarChart3,
  Shield,
  Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NextStepSuggestion {
  id: string;
  type: 'document' | 'compliance' | 'opportunity' | 'training' | 'financial' | 'maintenance';
  title: string;
  description: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
  potentialImpact: string;
  dueDate?: string;
  category: string;
}

interface PerformanceInsight {
  metric: string;
  value: number;
  trend: 'improving' | 'declining' | 'stable';
  comparison: 'above_average' | 'average' | 'below_average';
  recommendation: string;
}

interface RiskFactor {
  type: 'compliance' | 'financial' | 'operational' | 'safety';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
  deadline?: string;
}

interface OpportunitySuggestion {
  type: 'job' | 'training' | 'certification' | 'equipment';
  title: string;
  description: string;
  potentialEarnings?: string;
  requirements: string[];
  matchScore: number;
}

interface ComplianceStatus {
  overallScore: number;
  expiringDocuments: number;
  overdueItems: number;
  nextDeadline?: string;
  criticalIssues: string[];
}

interface ContractorInsights {
  contractorId: number;
  nextSteps: NextStepSuggestion[];
  performanceInsights: PerformanceInsight[];
  riskFactors: RiskFactor[];
  opportunities: OpportunitySuggestion[];
  complianceStatus: ComplianceStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastUpdated: string;
}

interface PersonalizedWidgetsProps {
  contractorId: number;
}

export function PersonalizedWidgets({ contractorId }: PersonalizedWidgetsProps) {
  const { data: insights, isLoading, error, refetch } = useQuery<ContractorInsights>({
    queryKey: [`/api/insights/contractor/${contractorId}`],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'compliance': return <Shield className="h-4 w-4" />;
      case 'opportunity': return <Star className="h-4 w-4" />;
      case 'training': return <GraduationCap className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getComparisonColor = (comparison: string) => {
    switch (comparison) {
      case 'above_average': return 'text-green-600';
      case 'below_average': return 'text-red-600';
      case 'average': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const handleActionClick = (actionUrl?: string) => {
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load personalized insights. Please try refreshing the page.
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">AI Insights & Recommendations</h2>
        </div>
        <Badge variant="secondary" className="text-xs">
          Updated {new Date(insights.lastUpdated).toLocaleTimeString()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Steps Widget */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.nextSteps.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">All caught up! No immediate actions needed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.nextSteps.slice(0, 3).map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border-l-4 ${getPriorityColor(step.priority)} transition-all hover:shadow-md cursor-pointer`}
                    onClick={() => handleActionClick(step.actionUrl)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(step.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {getPriorityIcon(step.priority)}
                            <h4 className="font-medium text-gray-900 truncate">{step.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {step.estimatedTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              {step.potentialImpact}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {step.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
                {insights.nextSteps.length > 3 && (
                  <Button variant="outline" className="w-full">
                    View All {insights.nextSteps.length} Recommendations
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Insights Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.performanceInsights.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No performance data available yet.</p>
            ) : (
              <div className="space-y-4">
                {insights.performanceInsights.map((insight, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{insight.metric}</span>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(insight.trend)}
                        <span className={`text-sm font-bold ${getComparisonColor(insight.comparison)}`}>
                          {insight.value}%
                        </span>
                      </div>
                    </div>
                    <Progress value={insight.value} className="h-2" />
                    <p className="text-xs text-gray-600">{insight.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Status Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Compliance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {insights.complianceStatus.overallScore}%
                </div>
                <div className="text-sm text-gray-600">Overall Compliance Score</div>
                <Progress value={insights.complianceStatus.overallScore} className="mt-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {insights.complianceStatus.expiringDocuments}
                  </div>
                  <div className="text-xs text-gray-600">Expiring Soon</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {insights.complianceStatus.overdueItems}
                  </div>
                  <div className="text-xs text-gray-600">Overdue Items</div>
                </div>
              </div>

              {insights.complianceStatus.criticalIssues.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Critical:</strong> {insights.complianceStatus.criticalIssues[0]}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Opportunities Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.opportunities.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No opportunities available right now.</p>
            ) : (
              <div className="space-y-4">
                {insights.opportunities.slice(0, 2).map((opportunity, index) => (
                  <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{opportunity.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {opportunity.matchScore}% match
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{opportunity.description}</p>
                    {opportunity.potentialEarnings && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-600 font-medium">
                          {opportunity.potentialEarnings}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {opportunity.type}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Alerts Widget */}
        {insights.riskFactors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Risk Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.riskFactors.filter(risk => risk.severity === 'high' || risk.severity === 'critical').slice(0, 2).map((risk, index) => (
                  <Alert key={index} variant={risk.severity === 'critical' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <div className="font-medium mb-1">{risk.description}</div>
                      <div className="text-xs opacity-80">{risk.mitigation}</div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}