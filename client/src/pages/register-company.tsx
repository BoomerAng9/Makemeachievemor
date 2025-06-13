import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { UniversalNav } from "@/components/UniversalNav";
import { Building2, Users, MapPin, ArrowLeft, Package, CreditCard, CheckCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

function CompanySubscriptionForm({ onComplete }: { onComplete: () => void }) {
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
          return_url: window.location.origin + '/register/company',
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
          description: "Your Choose 2 ACHIEVEMOR Business subscription is now active!",
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
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">Buy the office coffee - $3.48/month</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Access to contractor network</li>
          <li>• Basic job posting capabilities</li>
          <li>• Standard communications</li>
          <li>• Essential business features</li>
          <li>• Community support</li>
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

export default function RegisterCompanyPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactFirstName: "",
    contactLastName: "",
    contactTitle: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    companySize: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    serviceAreas: [] as string[],
    deliveryVolume: "",
    deliveryTypes: [] as string[],
    specialRequirements: "",
    integrationType: "",
    agreedToTerms: false,
    agreedToCredit: false
  });

  const [jobRequirements, setJobRequirements] = useState({
    vehicleTypes: [] as string[],
    serviceTypes: [] as string[],
    minTrustRating: 80,
    maxDistance: 100,
    preferredSchedule: [] as string[],
    paymentTerms: "",
    insuranceMinimum: "1000000"
  });

  const [serviceCustomization, setServiceCustomization] = useState({
    automatedMatching: true,
    realTimeTracking: true,
    customerNotifications: true,
    routeOptimization: false,
    bulkJobPosting: false,
    apiIntegration: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionComplete, setSubscriptionComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  const totalSteps = 6;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: "serviceAreas" | "deliveryTypes", item: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], item]
        : prev[field].filter(i => i !== item)
    }));
  };

  const handleJobRequirementChange = (field: string, value: any) => {
    setJobRequirements(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceCustomizationChange = (field: string, value: boolean) => {
    setServiceCustomization(prev => ({ ...prev, [field]: value }));
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
    if (!formData.agreedToTerms || !formData.agreedToCredit) {
      toast({
        title: "Agreement Required",
        description: "Please agree to all terms and credit check authorization.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const registrationData = {
        company: formData,
        jobRequirements,
        serviceCustomization
      };

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      if (response.ok) {
        toast({
          title: "Registration Complete!",
          description: "Welcome to Choose 2 ACHIEVEMOR! You can now start posting jobs and connecting with contractors."
        });
        window.location.href = '/admin';
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
      case 1: return "Company Information";
      case 2: return "Subscription Plan";
      case 3: return "Service Requirements";
      case 4: return "Job Requirements";
      case 5: return "Service Customization";
      case 6: return "Final Agreement";
      default: return "Registration";
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactFirstName">Contact First Name *</Label>
                  <Input
                    id="contactFirstName"
                    value={formData.contactFirstName}
                    onChange={(e) => handleInputChange("contactFirstName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactLastName">Contact Last Name *</Label>
                  <Input
                    id="contactLastName"
                    value={formData.contactLastName}
                    onChange={(e) => handleInputChange("contactLastName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactTitle">Contact Title</Label>
                  <Input
                    id="contactTitle"
                    value={formData.contactTitle}
                    onChange={(e) => handleInputChange("contactTitle", e.target.value)}
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
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthcare">Healthcare & Medical</SelectItem>
                      <SelectItem value="logistics">Logistics & Transportation</SelectItem>
                      <SelectItem value="retail">Retail & E-commerce</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="food">Food & Beverage</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="companySize">Company Size *</Label>
                  <Select value={formData.companySize} onValueChange={(value) => handleInputChange("companySize", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-1000">201-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company Address</h3>
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
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Business Subscription</h3>
              <p className="text-gray-600">Access our contractor network and business tools</p>
            </div>
            
            <div className="space-y-4">
              {/* Basic Plan */}
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-900">Buy the office coffee - $3.48/month</h3>
                  <input type="radio" name="businessPlan" value="basic" className="text-blue-600" defaultChecked />
                </div>
                <ul className="text-sm text-blue-800 space-y-1 mb-3">
                  <li>• Access to contractor network</li>
                  <li>• Basic job posting capabilities</li>
                  <li>• Standard communications</li>
                  <li>• Essential business features</li>
                </ul>
              </div>

              {/* Professional Plan */}
              <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-900">Business Professional - $25.99/month</h3>
                  <input type="radio" name="businessPlan" value="professional" className="text-green-600" />
                </div>
                <ul className="text-sm text-green-800 space-y-1 mb-3">
                  <li>• Enhanced contractor matching</li>
                  <li>• Advanced job posting features</li>
                  <li>• Performance analytics</li>
                  <li>• Priority customer support</li>
                  <li>• Multiple job management</li>
                </ul>
              </div>

              {/* Premium Plan */}
              <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-purple-900">Enterprise - $49.99/month</h3>
                  <input type="radio" name="businessPlan" value="enterprise" className="text-purple-600" />
                </div>
                <ul className="text-sm text-purple-800 space-y-1 mb-3">
                  <li>• All Professional features</li>
                  <li>• Dedicated account manager</li>
                  <li>• Custom integrations</li>
                  <li>• Volume discounts</li>
                  <li>• Advanced reporting & analytics</li>
                </ul>
              </div>

              {/* Complete Later Option */}
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Complete Later</h3>
                  <input type="radio" name="businessPlan" value="later" className="text-gray-600" />
                </div>
                <p className="text-sm text-gray-700">
                  Skip subscription for now and complete your registration. You can upgrade your plan anytime from your dashboard.
                </p>
              </div>
              
              <div className="flex items-center space-x-3 mt-4">
                <Checkbox
                  id="agreeBusinessSubscription"
                  checked={subscriptionComplete}
                  onCheckedChange={(checked) => setSubscriptionComplete(checked as boolean)}
                />
                <Label htmlFor="agreeBusinessSubscription" className="text-sm">
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
            <h3 className="text-lg font-semibold mb-4">Service Requirements</h3>
            
            <div>
              <Label className="text-base font-medium">Service Areas</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Georgia", "Florida", "South Carolina", "North Carolina", "Tennessee", "Alabama"].map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={formData.serviceAreas.includes(area)}
                      onCheckedChange={(checked) => handleArrayChange("serviceAreas", area, checked as boolean)}
                    />
                    <Label htmlFor={area}>{area}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Delivery Types</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Medical Transport", "Package Delivery", "Freight Transport", "Food Delivery", "Caregiving Services", "Special Transport"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.deliveryTypes.includes(type)}
                      onCheckedChange={(checked) => handleArrayChange("deliveryTypes", type, checked as boolean)}
                    />
                    <Label htmlFor={type}>{type}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deliveryVolume">Expected Monthly Volume *</Label>
                <Select value={formData.deliveryVolume} onValueChange={(value) => handleInputChange("deliveryVolume", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select volume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-50">1-50 deliveries</SelectItem>
                    <SelectItem value="51-200">51-200 deliveries</SelectItem>
                    <SelectItem value="201-500">201-500 deliveries</SelectItem>
                    <SelectItem value="500+">500+ deliveries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="integrationType">Integration Needs</Label>
                <Select value={formData.integrationType} onValueChange={(value) => handleInputChange("integrationType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select integration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No integration needed</SelectItem>
                    <SelectItem value="api">API integration</SelectItem>
                    <SelectItem value="webhook">Webhook notifications</SelectItem>
                    <SelectItem value="full">Full system integration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="specialRequirements">Special Requirements</Label>
              <Textarea
                id="specialRequirements"
                value={formData.specialRequirements}
                onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                placeholder="Describe any special requirements, equipment needs, or service specifications..."
                rows={4}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Job Requirements & Preferences</h3>
            
            <div>
              <Label className="text-base font-medium">Required Vehicle Types</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Standard Van", "Cargo Van", "Box Truck", "Wheelchair Van", "Refrigerated Vehicle", "Ambulette"].map((vehicle) => (
                  <div key={vehicle} className="flex items-center space-x-2">
                    <Checkbox
                      id={vehicle}
                      checked={jobRequirements.vehicleTypes.includes(vehicle)}
                      onCheckedChange={(checked) => {
                        const newTypes = checked 
                          ? [...jobRequirements.vehicleTypes, vehicle]
                          : jobRequirements.vehicleTypes.filter(v => v !== vehicle);
                        handleJobRequirementChange("vehicleTypes", newTypes);
                      }}
                    />
                    <Label htmlFor={vehicle}>{vehicle}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Service Types</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {["Medical Transport", "Caregiving", "Package Delivery", "Freight Transport", "Emergency Services"].map((service) => (
                  <div key={service} className="flex items-center space-x-2">
                    <Checkbox
                      id={service}
                      checked={jobRequirements.serviceTypes.includes(service)}
                      onCheckedChange={(checked) => {
                        const newTypes = checked 
                          ? [...jobRequirements.serviceTypes, service]
                          : jobRequirements.serviceTypes.filter(s => s !== service);
                        handleJobRequirementChange("serviceTypes", newTypes);
                      }}
                    />
                    <Label htmlFor={service}>{service}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minTrustRating">Minimum Trust Rating: {jobRequirements.minTrustRating}%</Label>
                <input
                  type="range"
                  id="minTrustRating"
                  min="50"
                  max="100"
                  step="5"
                  value={jobRequirements.minTrustRating}
                  onChange={(e) => handleJobRequirementChange("minTrustRating", parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
              <div>
                <Label htmlFor="maxDistance">Maximum Distance: {jobRequirements.maxDistance} miles</Label>
                <input
                  type="range"
                  id="maxDistance"
                  min="25"
                  max="500"
                  step="25"
                  value={jobRequirements.maxDistance}
                  onChange={(e) => handleJobRequirementChange("maxDistance", parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentTerms">Payment Terms *</Label>
                <Select value={jobRequirements.paymentTerms} onValueChange={(value) => handleJobRequirementChange("paymentTerms", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate payment</SelectItem>
                    <SelectItem value="weekly">Weekly payment</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly payment</SelectItem>
                    <SelectItem value="net30">Net 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="insuranceMinimum">Minimum Insurance Coverage</Label>
                <Select value={jobRequirements.insuranceMinimum} onValueChange={(value) => handleJobRequirementChange("insuranceMinimum", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select coverage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000000">$1,000,000</SelectItem>
                    <SelectItem value="2000000">$2,000,000</SelectItem>
                    <SelectItem value="5000000">$5,000,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Service Customization</h3>
            
            <div className="space-y-4">
              {[
                { key: "automatedMatching", label: "Automated Contractor Matching", description: "Automatically match jobs with qualified contractors" },
                { key: "realTimeTracking", label: "Real-time Job Tracking", description: "Live updates on job progress and location" },
                { key: "customerNotifications", label: "Customer Notifications", description: "Automated notifications to your customers" },
                { key: "routeOptimization", label: "Route Optimization", description: "Optimize delivery routes for efficiency" },
                { key: "bulkJobPosting", label: "Bulk Job Posting", description: "Upload multiple jobs via CSV or API" },
                { key: "apiIntegration", label: "API Integration", description: "Connect with your existing systems" }
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id={key}
                    checked={serviceCustomization[key as keyof typeof serviceCustomization]}
                    onCheckedChange={(checked) => handleServiceCustomizationChange(key, checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={key} className="font-medium">{label}</Label>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
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
                    I agree to the Business Terms of Service and Privacy Policy *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    You agree to our business terms of service and privacy policy.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="credit"
                  checked={formData.agreedToCredit}
                  onCheckedChange={(checked) => handleInputChange("agreedToCredit", checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="credit" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I authorize credit and business verification *
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    You authorize us to conduct credit and business verification checks as required.
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
        return formData.companyName && formData.contactFirstName && formData.contactLastName && formData.email && formData.phone && formData.industry && formData.companySize;
      case 2:
        return subscriptionComplete;
      case 3:
        return formData.serviceAreas.length > 0 && formData.deliveryTypes.length > 0 && formData.deliveryVolume;
      case 4:
        return jobRequirements.vehicleTypes.length > 0 && jobRequirements.serviceTypes.length > 0 && jobRequirements.paymentTerms;
      case 5:
        return true; // Service customization is optional
      case 6:
        return formData.agreedToTerms && formData.agreedToCredit;
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner with Us</h1>
            <p className="text-gray-600">Join Choose 2 ACHIEVEMOR's network and connect with verified contractors</p>
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
                <Building2 className="w-5 h-5 mr-2" />
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