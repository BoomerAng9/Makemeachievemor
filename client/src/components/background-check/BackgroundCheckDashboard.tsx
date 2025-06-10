import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Calendar,
  User,
  Car,
  Building
} from "lucide-react";
import { format } from "date-fns";

interface BackgroundCheckResult {
  id: number;
  checkType: string;
  status: 'clear' | 'flagged' | 'failed' | 'inconclusive';
  overallResult: 'pass' | 'fail' | 'review_required';
  score?: number;
  verificationDate: string;
  expiryDate: string;
  isValid: boolean;
  findings: any[];
}

interface BackgroundCheckAlert {
  id: number;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: string;
  dueDate?: string;
  isResolved: boolean;
}

interface BackgroundCheckData {
  results: BackgroundCheckResult[];
  alerts: BackgroundCheckAlert[];
}

interface BackgroundCheckDashboardProps {
  contractorId: number;
}

export function BackgroundCheckDashboard({ contractorId }: BackgroundCheckDashboardProps) {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [checkType, setCheckType] = useState('');
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    ssn: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    drivingLicense: {
      number: '',
      state: '',
      expiryDate: ''
    }
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: backgroundCheckData, isLoading } = useQuery<BackgroundCheckData>({
    queryKey: [`/api/background-check/contractor/${contractorId}`],
    retry: false,
  });

  const submitBackgroundCheckMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/background-check/submit', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Background Check Submitted",
        description: "Your background check request has been submitted successfully.",
      });
      setIsSubmitDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/background-check/contractor/${contractorId}`] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit background check request.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitBackgroundCheck = () => {
    if (!checkType) {
      toast({
        title: "Validation Error",
        description: "Please select a background check type.",
        variant: "destructive",
      });
      return;
    }

    submitBackgroundCheckMutation.mutate({
      contractorId,
      checkType,
      personalInfo
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clear':
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'flagged':
      case 'review_required':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string, variant: 'status' | 'result' = 'status') => {
    const isResult = variant === 'result';
    
    if ((isResult && status === 'pass') || (!isResult && status === 'clear')) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        {isResult ? 'Passed' : 'Clear'}
      </Badge>;
    }
    if ((isResult && status === 'review_required') || (!isResult && status === 'flagged')) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        {isResult ? 'Review Required' : 'Flagged'}
      </Badge>;
    }
    if ((isResult && status === 'fail') || (!isResult && status === 'failed')) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        {isResult ? 'Failed' : 'Failed'}
      </Badge>;
    }
    return <Badge variant="secondary">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-300';
      case 'high': return 'bg-orange-100 border-orange-300';
      case 'medium': return 'bg-yellow-100 border-yellow-300';
      case 'low': return 'bg-blue-100 border-blue-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getCheckTypeIcon = (checkType: string) => {
    switch (checkType.toLowerCase()) {
      case 'mvr':
      case 'driving':
        return <Car className="h-4 w-4" />;
      case 'criminal':
        return <Shield className="h-4 w-4" />;
      case 'employment':
        return <Building className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const calculateOverallScore = () => {
    if (!backgroundCheckData?.results.length) return 0;
    
    const validResults = backgroundCheckData.results.filter(r => r.isValid && r.score);
    if (!validResults.length) return 0;
    
    const totalScore = validResults.reduce((sum, result) => sum + (result.score || 0), 0);
    return Math.round(totalScore / validResults.length);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  const overallScore = calculateOverallScore();
  const alerts = backgroundCheckData?.alerts || [];
  const results = backgroundCheckData?.results || [];

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Background Check Overview
          </CardTitle>
          <CardDescription>
            Monitor your background check status and compliance requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-2">{overallScore}%</div>
              <div className="text-xs sm:text-sm text-gray-600">Overall Score</div>
              <Progress value={overallScore} className="mt-2 h-2" />
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
                {results.filter(r => r.overallResult === 'pass').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Passed Checks</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">{alerts.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Active Alerts</div>
            </div>
          </div>

          <Separator className="my-4 sm:my-6" />

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex-1">
              <h4 className="font-medium text-sm sm:text-base">Quick Actions</h4>
              <p className="text-xs sm:text-sm text-gray-600">Submit new background checks or view detailed reports</p>
            </div>
            <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 w-full sm:w-auto min-h-[44px] text-sm touch-manipulation">
                  <FileText className="h-4 w-4" />
                  Submit New Check
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit Background Check</DialogTitle>
                  <DialogDescription>
                    Complete the form below to submit a new background check request
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 p-1">
                  <div>
                    <Label htmlFor="checkType" className="text-sm font-medium">Check Type</Label>
                    <Select value={checkType} onValueChange={setCheckType}>
                      <SelectTrigger className="min-h-[44px] mt-1 touch-manipulation">
                        <SelectValue placeholder="Select check type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mvr">Motor Vehicle Record (MVR)</SelectItem>
                        <SelectItem value="criminal">Criminal Background Check</SelectItem>
                        <SelectItem value="employment">Employment Verification</SelectItem>
                        <SelectItem value="drug_test">Drug Test</SelectItem>
                        <SelectItem value="full">Comprehensive Background Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        className="min-h-[44px] mt-1 touch-manipulation"
                        value={personalInfo.firstName}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        className="min-h-[44px] mt-1 touch-manipulation"
                        value={personalInfo.lastName}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="min-h-[44px] mt-1 touch-manipulation"
                        value={personalInfo.dateOfBirth}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ssn" className="text-sm font-medium">SSN (Last 4 digits)</Label>
                      <Input
                        id="ssn"
                        className="min-h-[44px] mt-1 touch-manipulation"
                        value={personalInfo.ssn}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, ssn: e.target.value }))}
                        placeholder="####"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="min-h-[44px] w-full sm:w-auto touch-manipulation"
                      onClick={() => setIsSubmitDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="min-h-[44px] w-full sm:w-auto touch-manipulation"
                      onClick={handleSubmitBackgroundCheck}
                      disabled={submitBackgroundCheckMutation.isPending}
                    >
                      {submitBackgroundCheckMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm mt-1">{alert.message}</div>
                      {alert.actionRequired && (
                        <div className="text-sm mt-2 font-medium">
                          Action Required: {alert.actionRequired}
                        </div>
                      )}
                      {alert.dueDate && (
                        <div className="text-sm text-gray-600 mt-1">
                          Due: {format(new Date(alert.dueDate), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {alert.severity}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Background Check Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Background Check History
          </CardTitle>
          <CardDescription>
            View all completed and pending background checks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No background checks yet</h3>
              <p className="text-gray-600 mb-4">
                Submit your first background check to get started with compliance verification
              </p>
              <Button
                onClick={() => setIsSubmitDialogOpen(true)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Submit Background Check
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <Card key={result.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {getCheckTypeIcon(result.checkType)}
                        <div>
                          <h4 className="font-medium capitalize">
                            {result.checkType.replace('_', ' ')} Check
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(result.status)}
                            {getStatusBadge(result.status)}
                            {getStatusBadge(result.overallResult, 'result')}
                          </div>
                          {result.score && (
                            <div className="text-sm text-gray-600 mt-1">
                              Score: {result.score}/100
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Verified: {format(new Date(result.verificationDate), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          Expires: {format(new Date(result.expiryDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </div>
                    
                    {result.findings && result.findings.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <h5 className="text-sm font-medium mb-2">Findings:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {result.findings.map((finding, index) => (
                            <li key={index}>• {finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}