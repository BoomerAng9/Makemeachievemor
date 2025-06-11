import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Truck, Shield, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UniversalNav } from "@/components/UniversalNav";

export default function RegisterDriverPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    dotNumber: "",
    mcNumber: "",
    vehicleType: "",
    cdlClass: "",
    yearsExperience: "",
    specialEndorsements: [] as string[],
    agreedToTerms: false,
    agreedToBackground: false
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEndorsementChange = (endorsement: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialEndorsements: checked 
        ? [...prev.specialEndorsements, endorsement]
        : prev.specialEndorsements.filter(e => e !== endorsement)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Submit to backend API
      const response = await fetch('/api/drivers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: "Registration Successful!",
          description: "Welcome to ACHIEVEMOR! Check your email for next steps."
        });
        
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          dotNumber: "",
          mcNumber: "",
          vehicleType: "",
          cdlClass: "",
          yearsExperience: "",
          specialEndorsements: [],
          agreedToTerms: false,
          agreedToBackground: false
        });
        setCurrentStep(1);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "There was an issue with your registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return formData.street && formData.city && formData.state && formData.zipCode;
      case 3:
        return formData.agreedToTerms && formData.agreedToBackground;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <UniversalNav />

      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Driver Registration
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Join the ACHIEVEMOR network as an Owner Operator Driver
            </p>
            
            {/* Progress Indicators */}
            <div className="flex items-center justify-center mt-6 space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-1 ${
                      step < currentStep ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Address & Professional Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address & Professional Information</h3>
                
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AL">Alabama</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="GA">Georgia</SelectItem>
                        <SelectItem value="SC">South Carolina</SelectItem>
                        <SelectItem value="NC">North Carolina</SelectItem>
                        <SelectItem value="TN">Tennessee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange("zipCode", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dotNumber">DOT Number</Label>
                    <Input
                      id="dotNumber"
                      value={formData.dotNumber}
                      onChange={(e) => handleInputChange("dotNumber", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mcNumber">MC Number</Label>
                    <Input
                      id="mcNumber"
                      value={formData.mcNumber}
                      onChange={(e) => handleInputChange("mcNumber", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cdlClass">CDL Class</Label>
                  <Select value={formData.cdlClass} onValueChange={(value) => handleInputChange("cdlClass", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CDL class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Class A</SelectItem>
                      <SelectItem value="B">Class B</SelectItem>
                      <SelectItem value="C">Class C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Select value={formData.yearsExperience} onValueChange={(value) => handleInputChange("yearsExperience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Agreements */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Agreements</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreedToTerms", checked)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="background"
                      checked={formData.agreedToBackground}
                      onCheckedChange={(checked) => handleInputChange("agreedToBackground", checked)}
                    />
                    <Label htmlFor="background" className="text-sm leading-relaxed">
                      I consent to background checks and verification processes as required for driver onboarding
                    </Label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Email verification and account setup</li>
                    <li>• Document upload and verification</li>
                    <li>• Background check process</li>
                    <li>• Welcome to the ACHIEVEMOR network!</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button 
                  onClick={nextStep} 
                  disabled={!isStepValid()}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!isStepValid() || isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? "Submitting..." : "Complete Registration"}
                  <Shield className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}