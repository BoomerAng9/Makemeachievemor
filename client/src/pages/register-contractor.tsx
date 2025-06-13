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
// Remove problematic imports for now and create simple inline components
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
        <h3 className="font-semibold text-blue-900 mb-2">Buy the office coffee - $3.48/month</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Access to job opportunities</li>
          <li>• Basic contractor profile</li>
          <li>• Standard support</li>
          <li>• Essential platform features</li>
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
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('contractor-registration-form');
    return saved ? JSON.parse(saved) : {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    city: "",
    zipCode: "",
    dotNumber: "",
    mcNumber: "",
    cdlClass: "",
    yearsExperience: "",
    specialEndorsements: [] as string[],
    agreedToTerms: false,
    agreedToBackground: false
  }});

  const [vehicleData, setVehicleData] = useState(() => {
    const saved = localStorage.getItem('contractor-registration-vehicle');
    return saved ? JSON.parse(saved) : {
    vehicleType: "",
    category: "",
    subType: "",
    capacity: "",
    specialFeatures: [] as string[]
  }});

  const [locationData, setLocationData] = useState(() => {
    const saved = localStorage.getItem('contractor-registration-location');
    return saved ? JSON.parse(saved) : {
    zipCode: "",
    city: "",
    state: "",
    serviceRadius: 25,
    maxDistance: 100,
    serviceTypes: [] as string[]
  }});

  const [availabilityData, setAvailabilityData] = useState(() => {
    const saved = localStorage.getItem('contractor-registration-availability');
    return saved ? JSON.parse(saved) : {
    schedule: {} as Record<string, { available: boolean; startTime: string; endTime: string }>,
    trustRating: 0,
    weeklyCommitment: 0
  }});

  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem('contractor-registration-step');
    return savedStep ? parseInt(savedStep) : 1;
  });
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
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 3.48 })
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
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        phone: formData.phone || '',

        city: locationData.city || formData.city || '',
        zipCode: locationData.zipCode || formData.zipCode || '',
        state: locationData.state || '',
        dotNumber: formData.dotNumber || '',
        mcNumber: formData.mcNumber || '',
        cdlClass: formData.cdlClass || '',
        yearsExperience: formData.yearsExperience || '',
        specialEndorsements: formData.specialEndorsements || [],
        vehicleType: vehicleData.vehicleType || '',
        category: vehicleData.category || '',
        subType: vehicleData.subType || '',
        capacity: vehicleData.capacity || '',
        specialFeatures: vehicleData.specialFeatures || [],
        agreedToTerms: formData.agreedToTerms,
        agreedToBackground: formData.agreedToBackground
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

              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <p className="text-gray-600">Subscribe to access contractor features</p>
            </div>
            
            <div className="space-y-4">
              {/* Basic Plan */}
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-900">Buy the office coffee - $3.48/month</h3>
                  <input type="radio" name="plan" value="basic" className="text-blue-600" defaultChecked />
                </div>
                <ul className="text-sm text-blue-800 space-y-1 mb-3">
                  <li>• Access to job opportunities</li>
                  <li>• Basic contractor profile</li>
                  <li>• Standard support</li>
                  <li>• Essential platform features</li>
                </ul>
              </div>

              {/* Professional Plan */}
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-900">Professional - $15.99/month</h3>
                  <input type="radio" name="plan" value="professional" className="text-green-600" />
                </div>
              </div>

              {/* Premium Plan */}
              <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-purple-900">Premium - $29.99/month</h3>
                  <input type="radio" name="plan" value="premium" className="text-purple-600" />
                </div>
              </div>

              {/* Complete Later Option */}
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Complete Later</h3>
                  <input type="radio" name="plan" value="later" className="text-gray-600" />
                </div>
                <p className="text-sm text-gray-700">
                  Skip subscription for now and complete your registration. You can upgrade your plan anytime from your dashboard.
                </p>
              </div>
              
              <div className="flex items-center space-x-3 mt-4">
                <Checkbox
                  id="agreeSubscription"
                  checked={subscriptionComplete}
                  onCheckedChange={(checked) => setSubscriptionComplete(checked as boolean)}
                />
                <Label htmlFor="agreeSubscription" className="text-sm">
                  I understand the subscription terms (payment collected after registration)
                </Label>
              </div>
              
              {subscriptionComplete && (
                <div className="flex items-center space-x-2 text-green-700 mt-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Ready to proceed!</span>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Vehicle Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <Select value={vehicleData.vehicleType} onValueChange={(value) => setVehicleData(prev => ({ ...prev, vehicleType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard-van">Standard Van</SelectItem>
                    <SelectItem value="cargo-van">Cargo Van</SelectItem>
                    <SelectItem value="box-truck">Box Truck</SelectItem>
                    <SelectItem value="wheelchair-van">Wheelchair Accessible Van</SelectItem>
                    <SelectItem value="ambulette">Ambulette</SelectItem>
                    <SelectItem value="refrigerated">Refrigerated Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="capacity">Vehicle Capacity</Label>
                <Select value={vehicleData.capacity} onValueChange={(value) => setVehicleData(prev => ({ ...prev, capacity: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 passengers</SelectItem>
                    <SelectItem value="3-6">3-6 passengers</SelectItem>
                    <SelectItem value="7-12">7-12 passengers</SelectItem>
                    <SelectItem value="cargo">Cargo only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Service Area & Location</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceZip">Service ZIP Code *</Label>
                  <Input
                    id="serviceZip"
                    value={locationData.zipCode}
                    onChange={(e) => setLocationData(prev => ({ ...prev, zipCode: e.target.value }))}
                    placeholder="Primary service ZIP code"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="serviceState">State *</Label>
                  <Select value={locationData.state} onValueChange={(value) => setLocationData(prev => ({ ...prev, state: value }))}>
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
              </div>
              <div>
                <Label htmlFor="serviceRadius">Service Radius: {locationData.serviceRadius} miles</Label>
                <input
                  type="range"
                  id="serviceRadius"
                  min="10"
                  max="100"
                  step="5"
                  value={locationData.serviceRadius}
                  onChange={(e) => setLocationData(prev => ({ ...prev, serviceRadius: parseInt(e.target.value) }))}
                  className="w-full mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Availability Schedule</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Weekly Availability</Label>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <Checkbox
                        id={day}
                        checked={availabilityData.schedule[day]?.available || false}
                        onCheckedChange={(checked) => {
                          setAvailabilityData(prev => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              [day]: {
                                available: checked as boolean,
                                startTime: prev.schedule[day]?.startTime || "09:00",
                                endTime: prev.schedule[day]?.endTime || "17:00"
                              }
                            }
                          }));
                        }}
                      />
                      <Label htmlFor={day} className="font-medium w-20">{day}</Label>
                      {availabilityData.schedule[day]?.available && (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={availabilityData.schedule[day]?.startTime || "09:00"}
                            onChange={(e) => {
                              setAvailabilityData(prev => ({
                                ...prev,
                                schedule: {
                                  ...prev.schedule,
                                  [day]: {
                                    ...prev.schedule[day],
                                    startTime: e.target.value
                                  }
                                }
                              }));
                            }}
                            className="w-24"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={availabilityData.schedule[day]?.endTime || "17:00"}
                            onChange={(e) => {
                              setAvailabilityData(prev => ({
                                ...prev,
                                schedule: {
                                  ...prev.schedule,
                                  [day]: {
                                    ...prev.schedule[day],
                                    endTime: e.target.value
                                  }
                                }
                              }));
                            }}
                            className="w-24"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="weeklyCommitment">Weekly Hours Commitment: {availabilityData.weeklyCommitment} hours</Label>
                <input
                  type="range"
                  id="weeklyCommitment"
                  min="10"
                  max="60"
                  step="5"
                  value={availabilityData.weeklyCommitment}
                  onChange={(e) => setAvailabilityData(prev => ({ ...prev, weeklyCommitment: parseInt(e.target.value) }))}
                  className="w-full mt-2"
                />
              </div>
            </div>
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

            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="completeLater"
                  checked={false}
                  onCheckedChange={() => {
                    toast({
                      title: "Complete Later",
                      description: "You can complete your professional information from your dashboard after registration."
                    });
                    handleNext();
                  }}
                />
                <Label htmlFor="completeLater" className="text-sm font-medium">
                  Complete professional information later
                </Label>
              </div>
              <p className="text-xs text-gray-600 mt-1 ml-6">
                Skip this step and complete your registration. You can add DOT numbers, CDL information, and endorsements from your dashboard.
              </p>
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
        return formData.firstName && formData.lastName && formData.email && formData.phone && formData.city && formData.zipCode;
      case 2:
        return subscriptionComplete;
      case 3:
        return vehicleData.vehicleType;
      case 4:
        return locationData.zipCode;
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