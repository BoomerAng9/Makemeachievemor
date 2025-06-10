import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

interface ConsultationFormProps {
  type: 'contractor' | 'company';
  onSuccess: () => void;
}

export function ConsultationForm({ type, onSuccess }: ConsultationFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    requestType: "",
    serviceType: "",
    businessStage: "",
    companySize: "",
    currentFleetSize: "",
    timeline: "",
    budget: "",
    currentChallenges: [] as string[],
    goals: [] as string[],
    operationalAreas: [] as string[],
    technologyNeeds: [] as string[],
    contactPreference: "email",
    description: ""
  });
  
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = type === 'contractor' 
        ? '/api/consultation/contractor'
        : '/api/consultation/company';
      return apiRequest(endpoint, 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Consultation Request Submitted",
        description: "We'll contact you within 24 hours to schedule your consultation.",
      });
      setStep(5);
      setTimeout(onSuccess, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  };

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        if (type === 'contractor') {
          return formData.firstName && formData.lastName && formData.email && formData.phone;
        } else {
          return formData.companyName && formData.contactPerson && formData.email && formData.phone;
        }
      case 2:
        if (type === 'contractor') {
          return formData.requestType && formData.businessStage;
        } else {
          return formData.serviceType && formData.companySize;
        }
      case 3:
        return formData.timeline && formData.budget;
      case 4:
        return formData.currentChallenges.length > 0 && 
               formData.goals.length > 0 && 
               formData.operationalAreas.length > 0 && 
               formData.technologyNeeds.length > 0 &&
               formData.contactPreference;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    mutation.mutate(formData);
  };

  // Step 1: Basic Information
  if (step === 1) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">Step 1 of 4</Badge>
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {type === 'contractor' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium">Company Name</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Person</label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="Enter contact person name"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => setStep(2)}
              disabled={!isStepValid(1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Service/Business Details
  if (step === 2) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">Step 2 of 4</Badge>
            {type === 'contractor' ? 'Business Details' : 'Service Requirements'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {type === 'contractor' ? (
            <>
              <div>
                <label className="text-sm font-medium">Request Type</label>
                <Select value={formData.requestType} onValueChange={(value) => handleInputChange('requestType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business-setup">Business Setup & Registration</SelectItem>
                    <SelectItem value="growth-automation">Growth & Automation Services</SelectItem>
                    <SelectItem value="compliance">Compliance & Documentation</SelectItem>
                    <SelectItem value="fleet-management">Fleet Management Solutions</SelectItem>
                    <SelectItem value="marketing">Marketing & Lead Generation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Business Stage</label>
                <Select value={formData.businessStage} onValueChange={(value) => handleInputChange('businessStage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Just Starting Out</SelectItem>
                    <SelectItem value="established">Established (1-3 years)</SelectItem>
                    <SelectItem value="growing">Growing (3-5 years)</SelectItem>
                    <SelectItem value="mature">Mature (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium">Service Type</label>
                <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dedicated-drivers">Dedicated Drivers</SelectItem>
                    <SelectItem value="logistics-operations">Logistics Operations Management</SelectItem>
                    <SelectItem value="fleet-outsourcing">Fleet Outsourcing</SelectItem>
                    <SelectItem value="route-optimization">Route Optimization</SelectItem>
                    <SelectItem value="last-mile-delivery">Last Mile Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Company Size</label>
                <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Startup (1-10 employees)</SelectItem>
                    <SelectItem value="small">Small (11-50 employees)</SelectItem>
                    <SelectItem value="medium">Medium (51-200 employees)</SelectItem>
                    <SelectItem value="large">Large (200+ employees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          <div>
            <label className="text-sm font-medium">Current Fleet Size (Optional)</label>
            <Input
              value={formData.currentFleetSize}
              onChange={(e) => handleInputChange('currentFleetSize', e.target.value)}
              placeholder="Number of vehicles or 'None'"
            />
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button 
              onClick={() => setStep(3)}
              disabled={!isStepValid(2)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 3: Timeline & Budget
  if (step === 3) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">Step 3 of 4</Badge>
            Timeline & Budget
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Timeline</label>
            <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate (Within 1 week)</SelectItem>
                <SelectItem value="short">Short Term (1-4 weeks)</SelectItem>
                <SelectItem value="medium">Medium Term (1-3 months)</SelectItem>
                <SelectItem value="long">Long Term (3+ months)</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Budget Range</label>
            <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-5k">Under $5,000</SelectItem>
                <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                <SelectItem value="15k-50k">$15,000 - $50,000</SelectItem>
                <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                <SelectItem value="over-100k">Over $100,000</SelectItem>
                <SelectItem value="discuss">Prefer to Discuss</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button 
              onClick={() => setStep(4)}
              disabled={!isStepValid(3)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 4: Detailed Requirements
  if (step === 4) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">Step 4 of 4</Badge>
            Detailed Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Challenges */}
          <div>
            <label className="text-sm font-medium mb-3 block">Current Challenges (Select all that apply)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Driver Recruitment",
                "Fleet Management", 
                "Route Optimization",
                "Compliance Issues",
                "Technology Integration",
                "Cost Management",
                "Customer Service",
                "Documentation"
              ].map((challenge) => (
                <div key={challenge} className="flex items-center space-x-2">
                  <Checkbox
                    id={challenge}
                    checked={formData.currentChallenges.includes(challenge)}
                    onCheckedChange={(checked) => 
                      handleArrayChange('currentChallenges', challenge, checked as boolean)
                    }
                  />
                  <label htmlFor={challenge} className="text-sm">{challenge}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="text-sm font-medium mb-3 block">Primary Goals (Select all that apply)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Increase Revenue",
                "Reduce Costs",
                "Improve Efficiency", 
                "Scale Operations",
                "Enhance Technology",
                "Better Compliance",
                "Market Expansion",
                "Automation"
              ].map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={formData.goals.includes(goal)}
                    onCheckedChange={(checked) => 
                      handleArrayChange('goals', goal, checked as boolean)
                    }
                  />
                  <label htmlFor={goal} className="text-sm">{goal}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Areas */}
          <div>
            <label className="text-sm font-medium mb-3 block">Operational Areas (Select all that apply)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Local Delivery",
                "Long Haul",
                "Regional Transport",
                "Last Mile",
                "Freight Brokerage",
                "Warehousing",
                "Cross Docking",
                "Specialized Cargo"
              ].map((area) => (
                <div key={area} className="flex items-center space-x-2">
                  <Checkbox
                    id={area}
                    checked={formData.operationalAreas.includes(area)}
                    onCheckedChange={(checked) => 
                      handleArrayChange('operationalAreas', area, checked as boolean)
                    }
                  />
                  <label htmlFor={area} className="text-sm">{area}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Technology Needs */}
          <div>
            <label className="text-sm font-medium mb-3 block">Technology Needs (Select all that apply)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Fleet Tracking",
                "Route Planning",
                "Load Boards",
                "ELD Compliance",
                "Driver Apps",
                "Customer Portal",
                "Invoicing System",
                "Analytics Dashboard"
              ].map((tech) => (
                <div key={tech} className="flex items-center space-x-2">
                  <Checkbox
                    id={tech}
                    checked={formData.technologyNeeds.includes(tech)}
                    onCheckedChange={(checked) => 
                      handleArrayChange('technologyNeeds', tech, checked as boolean)
                    }
                  />
                  <label htmlFor={tech} className="text-sm">{tech}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Preference */}
          <div>
            <label className="text-sm font-medium">Preferred Contact Method</label>
            <Select value={formData.contactPreference} onValueChange={(value) => handleInputChange('contactPreference', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select contact preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="text">Text Message</SelectItem>
                <SelectItem value="video">Video Call</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Information */}
          <div>
            <label className="text-sm font-medium">Additional Information (Optional)</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Any additional details you'd like to share..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isStepValid(4) || mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 5: Success
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Request Submitted Successfully!</h3>
        <p className="text-gray-600 mb-4">
          Thank you for your consultation request. Our team will review your information and contact you within 24 hours.
        </p>
        <Badge variant="secondary" className="mb-4">
          Reference ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
        </Badge>
        <p className="text-sm text-gray-500">
          You can expect to hear from us via {formData.contactPreference} at the contact information provided.
        </p>
      </CardContent>
    </Card>
  );
}