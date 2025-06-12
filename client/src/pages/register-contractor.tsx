import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UniversalNav } from "@/components/UniversalNav";
import { Truck, Shield, FileText, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RegisterContractorPage() {
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
    if (!formData.agreedToTerms || !formData.agreedToBackground) {
      toast({
        title: "Agreement Required",
        description: "Please agree to all terms and background check authorization.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Registration Submitted!",
        description: "Your application has been received. We'll contact you within 24 hours to begin the verification process."
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
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Address Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    required
                  />
                </div>
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
                      <SelectItem value="GA">Georgia</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="SC">South Carolina</SelectItem>
                      <SelectItem value="NC">North Carolina</SelectItem>
                      <SelectItem value="TN">Tennessee</SelectItem>
                      <SelectItem value="AL">Alabama</SelectItem>
                    </SelectContent>
                  </Select>
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
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="dotNumber">DOT Number</Label>
                <Input
                  id="dotNumber"
                  value={formData.dotNumber}
                  onChange={(e) => handleInputChange("dotNumber", e.target.value)}
                  placeholder="Optional if not yet obtained"
                />
              </div>
              <div>
                <Label htmlFor="mcNumber">MC Number</Label>
                <Input
                  id="mcNumber"
                  value={formData.mcNumber}
                  onChange={(e) => handleInputChange("mcNumber", e.target.value)}
                  placeholder="Optional if not yet obtained"
                />
              </div>
              <div>
                <Label htmlFor="cdlClass">CDL Class *</Label>
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
                <Label htmlFor="yearsExperience">Years of Experience *</Label>
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

            <div>
              <Label htmlFor="vehicleType">Primary Vehicle Type *</Label>
              <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange("vehicleType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="van">Cargo Van</SelectItem>
                  <SelectItem value="box_truck">Box Truck</SelectItem>
                  <SelectItem value="semi_truck">Semi Truck</SelectItem>
                  <SelectItem value="pickup_truck">Pickup Truck</SelectItem>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Special Endorsements (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {["Hazmat", "Passenger", "School Bus", "Double/Triple", "Tank Vehicle", "Motorcycle"].map(endorsement => (
                  <div key={endorsement} className="flex items-center space-x-2">
                    <Checkbox
                      id={endorsement}
                      checked={formData.specialEndorsements.includes(endorsement)}
                      onCheckedChange={(checked) => handleEndorsementChange(endorsement, !!checked)}
                    />
                    <Label htmlFor={endorsement} className="text-sm">{endorsement}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-4">Required Documentation</h4>
              <div className="space-y-3 text-blue-800">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Valid Commercial Driver's License (CDL)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>DOT Medical Certificate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Vehicle Registration & Title</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Commercial Insurance Certificate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Clean Driving Record (MVR)</span>
                </div>
              </div>
              <p className="text-sm text-blue-700 mt-4">
                * You'll be able to upload these documents after submitting your initial application
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreedToTerms", !!checked)}
                />
                <Label htmlFor="agreedToTerms" className="text-sm leading-relaxed">
                  I agree to the <span className="text-primary underline cursor-pointer">Terms of Service</span> and 
                  <span className="text-primary underline cursor-pointer"> Privacy Policy</span>. I understand that 
                  all information provided is subject to verification and that false information may result in 
                  disqualification.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreedToBackground"
                  checked={formData.agreedToBackground}
                  onCheckedChange={(checked) => handleInputChange("agreedToBackground", !!checked)}
                />
                <Label htmlFor="agreedToBackground" className="text-sm leading-relaxed">
                  I authorize ACHIEVEMOR to conduct background checks, drug screening, and verification of 
                  employment history as required by DOT regulations and company policy.
                </Label>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-2">Next Steps After Submission</h4>
              <ol className="list-decimal list-inside space-y-2 text-green-800 text-sm">
                <li>Application review within 24 hours</li>
                <li>Phone interview scheduling</li>
                <li>Document upload and verification</li>
                <li>Background check and drug screening</li>
                <li>Vehicle inspection (if applicable)</li>
                <li>Onboarding and first load assignment</li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UniversalNav />
      
      {/* Main Content with proper top padding */}
      <main className="max-w-4xl mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Join as an Independent Contractor
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Start your journey with ACHIEVEMOR's verified driver network and access premium freight opportunities
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 text-sm ${currentStep >= step ? 'text-primary' : 'text-gray-500'}`}>
                  {step === 1 ? 'Personal Info' : step === 2 ? 'Professional Details' : 'Review & Submit'}
                </span>
                {step < 3 && <div className="w-16 h-0.5 bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-primary" />
              {currentStep === 1 ? 'Personal Information' : 
               currentStep === 2 ? 'Professional Qualifications' : 
               'Review & Agreement'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-primary hover:bg-primary/90"
                  disabled={
                    (currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.phone)) ||
                    (currentStep === 2 && (!formData.cdlClass || !formData.yearsExperience || !formData.vehicleType))
                  }
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.agreedToTerms || !formData.agreedToBackground}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Need help with your application? 
            <a href="tel:912-742-9459" className="text-primary hover:underline ml-1">
              Call (912) 742-9459
            </a> or 
            <a href="mailto:delivered@byachievemor.com" className="text-primary hover:underline ml-1">
              email us
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}