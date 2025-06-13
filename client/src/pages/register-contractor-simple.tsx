import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

export default function RegisterContractorPage() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('contractor-registration-form');
    return saved ? JSON.parse(saved) : {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      zipCode: "",
      dotNumber: "",
      mcNumber: "",
      cdlClass: "",
      yearsExperience: "",
      specialEndorsements: [] as string[],
      agreedToTerms: false,
      agreedToBackground: false
    };
  });

  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('contractor-registration-step');
    return savedStep ? parseInt(savedStep) : 1;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('contractor-registration-form', JSON.stringify(formData));
  }, [formData]);

  // Save current step to localStorage
  useEffect(() => {
    localStorage.setItem('contractor-registration-step', currentStep.toString());
  }, [currentStep]);

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

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/contractors/register", formData);
      
      // Clear saved form data on successful submission
      localStorage.removeItem('contractor-registration-form');
      localStorage.removeItem('contractor-registration-step');
      
      toast({
        title: "Registration Complete!",
        description: "Welcome to Choose 2 ACHIEVEMOR. You can now access opportunities.",
      });
      
      // Redirect to dashboard or home
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Tell us about yourself</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
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
                <SelectItem value="AK">Alaska</SelectItem>
                <SelectItem value="AZ">Arizona</SelectItem>
                <SelectItem value="AR">Arkansas</SelectItem>
                <SelectItem value="CA">California</SelectItem>
                <SelectItem value="CO">Colorado</SelectItem>
                <SelectItem value="CT">Connecticut</SelectItem>
                <SelectItem value="DE">Delaware</SelectItem>
                <SelectItem value="FL">Florida</SelectItem>
                <SelectItem value="GA">Georgia</SelectItem>
                <SelectItem value="HI">Hawaii</SelectItem>
                <SelectItem value="ID">Idaho</SelectItem>
                <SelectItem value="IL">Illinois</SelectItem>
                <SelectItem value="IN">Indiana</SelectItem>
                <SelectItem value="IA">Iowa</SelectItem>
                <SelectItem value="KS">Kansas</SelectItem>
                <SelectItem value="KY">Kentucky</SelectItem>
                <SelectItem value="LA">Louisiana</SelectItem>
                <SelectItem value="ME">Maine</SelectItem>
                <SelectItem value="MD">Maryland</SelectItem>
                <SelectItem value="MA">Massachusetts</SelectItem>
                <SelectItem value="MI">Michigan</SelectItem>
                <SelectItem value="MN">Minnesota</SelectItem>
                <SelectItem value="MS">Mississippi</SelectItem>
                <SelectItem value="MO">Missouri</SelectItem>
                <SelectItem value="MT">Montana</SelectItem>
                <SelectItem value="NE">Nebraska</SelectItem>
                <SelectItem value="NV">Nevada</SelectItem>
                <SelectItem value="NH">New Hampshire</SelectItem>
                <SelectItem value="NJ">New Jersey</SelectItem>
                <SelectItem value="NM">New Mexico</SelectItem>
                <SelectItem value="NY">New York</SelectItem>
                <SelectItem value="NC">North Carolina</SelectItem>
                <SelectItem value="ND">North Dakota</SelectItem>
                <SelectItem value="OH">Ohio</SelectItem>
                <SelectItem value="OK">Oklahoma</SelectItem>
                <SelectItem value="OR">Oregon</SelectItem>
                <SelectItem value="PA">Pennsylvania</SelectItem>
                <SelectItem value="RI">Rhode Island</SelectItem>
                <SelectItem value="SC">South Carolina</SelectItem>
                <SelectItem value="SD">South Dakota</SelectItem>
                <SelectItem value="TN">Tennessee</SelectItem>
                <SelectItem value="TX">Texas</SelectItem>
                <SelectItem value="UT">Utah</SelectItem>
                <SelectItem value="VT">Vermont</SelectItem>
                <SelectItem value="VA">Virginia</SelectItem>
                <SelectItem value="WA">Washington</SelectItem>
                <SelectItem value="WV">West Virginia</SelectItem>
                <SelectItem value="WI">Wisconsin</SelectItem>
                <SelectItem value="WY">Wyoming</SelectItem>
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
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Professional Details</CardTitle>
        <CardDescription>Your driving credentials (optional - complete later)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
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
                <SelectItem value="none">No CDL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="yearsExperience">Years of Experience</Label>
            <Input
              id="yearsExperience"
              value={formData.yearsExperience}
              onChange={(e) => handleInputChange("yearsExperience", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>Special Endorsements</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {["Hazmat", "Passenger", "School Bus", "Double/Triple", "Tank Vehicle", "Motorcycle"].map((endorsement) => (
              <div key={endorsement} className="flex items-center space-x-2">
                <Checkbox
                  id={endorsement}
                  checked={formData.specialEndorsements.includes(endorsement)}
                  onCheckedChange={(checked) => handleEndorsementChange(endorsement, checked as boolean)}
                />
                <Label htmlFor={endorsement}>{endorsement}</Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Plan</CardTitle>
        <CardDescription>Subscribe to access contractor features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {/* Basic Plan - with details */}
          <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-900">Buy the office coffee - $3.48/month</h3>
              <input type="radio" name="plan" value="basic" defaultChecked className="text-blue-600" />
            </div>
            <ul className="text-sm text-blue-800 space-y-1 mb-3">
              <li>• Access to job opportunities</li>
              <li>• Basic contractor profile</li>
              <li>• Standard support</li>
              <li>• Essential platform features</li>
            </ul>
          </div>

          {/* Professional Plan - price only */}
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-900">Professional - $15.99/month</h3>
              <input type="radio" name="plan" value="professional" className="text-green-600" />
            </div>
          </div>

          {/* Premium Plan - price only */}
          <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-purple-900">Premium - $29.99/month</h3>
              <input type="radio" name="plan" value="premium" className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreedToTerms}
              onCheckedChange={(checked) => handleInputChange("agreedToTerms", checked as boolean)}
            />
            <Label htmlFor="terms">I agree to the Terms of Service</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="background"
              checked={formData.agreedToBackground}
              onCheckedChange={(checked) => handleInputChange("agreedToBackground", checked as boolean)}
            />
            <Label htmlFor="background">I agree to background check verification</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Choose 2 ACHIEVEMOR</h1>
            <p className="text-gray-600">Register as an Independent Contractor</p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && <div className={`w-12 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Form content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext} className="flex items-center space-x-2">
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.agreedToTerms || !formData.agreedToBackground}
                className="flex items-center space-x-2"
              >
                {isSubmitting ? "Registering..." : "Complete Registration"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}