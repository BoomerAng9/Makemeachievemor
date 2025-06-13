import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { UniversalNav } from "@/components/UniversalNav";
import { EnhancedVehicleSelection } from "@/components/EnhancedVehicleSelection";
import { EnhancedLocationSettings } from "@/components/EnhancedLocationSettings";
import { AvailabilityScheduler } from "@/components/AvailabilityScheduler";
import { Truck, Shield, FileText, ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

function SubscriptionForm({ onComplete }: { onComplete: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/register/contractor',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription Active",
          description: "Your Choose 2 ACHIEVEMOR Pro subscription is now active!",
        });
        onComplete();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Choose 2 ACHIEVEMOR Pro - $29.99/month</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Access to premium job opportunities</li>
          <li>• Advanced matching algorithms</li>
          <li>• Priority customer support</li>
          <li>• Enhanced profile features</li>
        </ul>
      </div>
      
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? "Processing..." : "Subscribe & Continue"}
      </Button>
    </form>
  );
}

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
    cdlClass: "",
    yearsExperience: "",
    specialEndorsements: [] as string[],
    agreedToTerms: false,
    agreedToBackground: false
  });

  const [vehicleData, setVehicleData] = useState({
    vehicleType: "",
    category: "",
    subType: "",
    capacity: "",
    specialFeatures: [] as string[]
  });

  const [locationData, setLocationData] = useState({
    zipCode: "",
    city: "",
    state: "",
    serviceRadius: 25,
    maxDistance: 100,
    serviceTypes: [] as string[]
  });

  const [availabilityData, setAvailabilityData] = useState({
    schedule: {} as Record<string, { available: boolean; startTime: string; endTime: string }>,
    trustRating: 0,
    weeklyCommitment: 0
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionComplete, setSubscriptionComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  const totalSteps = 7;

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

  const initializeSubscription = async () => {
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNext = async () => {
    if (currentStep === 2 && !subscriptionComplete) {
      await initializeSubscription();
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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
      const registrationData = {
        personal: formData,
        vehicle: vehicleData,
        location: locationData,
        availability: availabilityData
      };

      const response = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      if (response.ok) {
        toast({
          title: "Registration Complete!",
          description: "Welcome to Choose 2 ACHIEVEMOR! You can now access your dashboard."
        });
        window.location.href = '/dashboard';
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "Failed to complete registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Personal Information";
      case 2: return "Subscription";
      case 3: return "Vehicle Selection";
      case 4: return "Location Settings";
      case 5: return "Availability Schedule";
      case 6: return "Professional Details";
      case 7: return "Final Agreement";
      default: return "Registration";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
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
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Address</h3>
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
            <div className="text-center">
              <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Choose Your Plan</h3>
              <p className="text-gray-600">Subscribe to access premium contractor features</p>
            </div>
            
            {clientSecret && !subscriptionComplete ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscriptionForm onComplete={() => setSubscriptionComplete(true)} />
              </Elements>
            ) : subscriptionComplete ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-700">Subscription Active!</h3>
                <p className="text-gray-600">You now have access to all premium features.</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Setting up your subscription...</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Vehicle Information</h3>
            <EnhancedVehicleSelection 
              onVehicleSelect={setVehicleData}
              initialData={vehicleData}
              isOptional={false}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Service Area & Location</h3>
            <EnhancedLocationSettings 
              onLocationUpdate={setLocationData}
              initialData={locationData}
              isRequired={true}
            />
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Availability Schedule</h3>
            <AvailabilityScheduler 
              onAvailabilityUpdate={setAvailabilityData}
              initialData={availabilityData}
              isRequired={true}
            />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="none">No CDL</SelectItem>
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
              <Label className="text-base font-medium">Special Endorsements</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Hazmat", "Passenger", "School Bus", "Double/Triple", "Tanker"].map((endorsement) => (
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
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Terms and Agreements</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreedToTerms", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I agree to the Terms of Service and Privacy Policy *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    You agree to our terms of service and privacy policy.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="background"
                  checked={formData.agreedToBackground}
                  onCheckedChange={(checked) => handleInputChange("agreedToBackground", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="background" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I authorize background check verification *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    You authorize us to conduct background checks as required for contractor verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone;
      case 2:
        return subscriptionComplete;
      case 3:
        return vehicleData.vehicleType && vehicleData.category;
      case 4:
        return locationData.zipCode && locationData.state;
      case 5:
        return Object.keys(availabilityData.schedule).length > 0;
      case 6:
        return formData.cdlClass && formData.yearsExperience;
      case 7:
        return formData.agreedToTerms && formData.agreedToBackground;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UniversalNav />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join as Driver</h1>
            <p className="text-gray-600">Complete your registration to start earning with Choose 2 ACHIEVEMOR</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>

          {/* Main Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                {getStepTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep === totalSteps ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? "Submitting..." : "Complete Registration"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}