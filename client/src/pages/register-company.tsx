import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Users, MapPin, ArrowLeft, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Partnership Application Submitted!",
        description: "Your application has been received. Our partnership team will contact you within 24 hours to discuss next steps."
      });

      // Reset form
      setFormData({
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
        serviceAreas: [],
        deliveryVolume: "",
        deliveryTypes: [],
        specialRequirements: "",
        integrationType: "",
        agreedToTerms: false,
        agreedToCredit: false
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
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="website">Company Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail & E-commerce</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="food">Food & Beverage</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
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

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Primary Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="contactTitle">Job Title *</Label>
                  <Input
                    id="contactTitle"
                    value={formData.contactTitle}
                    onChange={(e) => handleInputChange("contactTitle", e.target.value)}
                    placeholder="e.g., Operations Manager, CEO"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Business Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Business Phone *</Label>
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

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Business Address</h4>
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
            <div>
              <Label>Service Areas Needed (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {["Atlanta Metro", "Savannah", "Augusta", "Macon", "Columbus", "Southeast Region", "Florida", "South Carolina", "North Carolina", "Tennessee", "Alabama", "Nationwide"].map(area => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={formData.serviceAreas.includes(area)}
                      onCheckedChange={(checked) => handleArrayChange("serviceAreas", area, !!checked)}
                    />
                    <Label htmlFor={area} className="text-sm">{area}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="deliveryVolume">Expected Monthly Delivery Volume *</Label>
                <Select value={formData.deliveryVolume} onValueChange={(value) => handleInputChange("deliveryVolume", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select volume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-50">1-50 deliveries</SelectItem>
                    <SelectItem value="51-200">51-200 deliveries</SelectItem>
                    <SelectItem value="201-500">201-500 deliveries</SelectItem>
                    <SelectItem value="501-1000">501-1000 deliveries</SelectItem>
                    <SelectItem value="1000+">1000+ deliveries</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="integrationType">Integration Preference</Label>
                <Select value={formData.integrationType} onValueChange={(value) => handleInputChange("integrationType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select integration type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Order Entry</SelectItem>
                    <SelectItem value="api">API Integration</SelectItem>
                    <SelectItem value="webhook">Webhook Integration</SelectItem>
                    <SelectItem value="custom">Custom Solution</SelectItem>
                    <SelectItem value="discuss">Discuss Later</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Types of Deliveries (Select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {["Standard Packages", "Large Items", "Fragile Items", "Food & Beverage", "Medical Supplies", "Construction Materials", "Automotive Parts", "Electronics", "Documents", "Time-Critical", "White Glove", "Assembly Required"].map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={formData.deliveryTypes.includes(type)}
                      onCheckedChange={(checked) => handleArrayChange("deliveryTypes", type, !!checked)}
                    />
                    <Label htmlFor={type} className="text-sm">{type}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="specialRequirements">Special Requirements or Notes</Label>
              <Textarea
                id="specialRequirements"
                value={formData.specialRequirements}
                onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
                placeholder="Please describe any special handling requirements, delivery windows, or other specific needs..."
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-4">Partnership Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 text-blue-800">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Access to verified driver network</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Real-time tracking & updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Flexible delivery options</span>
                  </div>
                </div>
                <div className="space-y-3 text-blue-800">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4" />
                    <span>Dedicated account management</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>24/7 customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Competitive pricing</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-4">Partnership Process</h4>
              <ol className="list-decimal list-inside space-y-2 text-green-800 text-sm">
                <li>Application review and initial consultation call</li>
                <li>Custom pricing proposal based on your needs</li>
                <li>Integration planning and setup</li>
                <li>Driver network allocation in your service areas</li>
                <li>Testing phase with sample deliveries</li>
                <li>Full partnership activation and ongoing support</li>
              </ol>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreedToTerms", !!checked)}
                />
                <Label htmlFor="agreedToTerms" className="text-sm leading-relaxed">
                  I agree to the <span className="text-primary underline cursor-pointer">Partnership Terms</span> and 
                  <span className="text-primary underline cursor-pointer"> Service Agreement</span>. I understand that 
                  pricing will be customized based on delivery volume, service areas, and specific requirements.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreedToCredit"
                  checked={formData.agreedToCredit}
                  onCheckedChange={(checked) => handleInputChange("agreedToCredit", !!checked)}
                />
                <Label htmlFor="agreedToCredit" className="text-sm leading-relaxed">
                  I authorize ACHIEVEMOR to conduct credit checks and business verification as part of the 
                  partnership approval process. This information will be used solely for partnership evaluation.
                </Label>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h4 className="font-semibold text-amber-900 mb-2">Partnership Requirements</h4>
              <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
                <li>Established business with valid business license</li>
                <li>Minimum monthly delivery volume requirements may apply</li>
                <li>Net 30 payment terms (negotiable for high-volume partners)</li>
                <li>Compliance with all applicable shipping and handling regulations</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="text-white h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-gray-900">ACHIEVEMOR</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Partner with ACHIEVEMOR
          </h1>
          <p className="text-xl text-gray-600">
            Access our verified driver network for your delivery needs
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step ? 'bg-accent text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 text-sm ${currentStep >= step ? 'text-accent' : 'text-gray-500'}`}>
                  {step === 1 ? 'Company Details' : step === 2 ? 'Service Requirements' : 'Partnership Terms'}
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
              <Building2 className="h-5 w-5 mr-2 text-accent" />
              {currentStep === 1 ? 'Company Information' : 
               currentStep === 2 ? 'Service Requirements' : 
               'Partnership Agreement'}
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
                  className="bg-accent hover:bg-accent/90"
                  disabled={
                    (currentStep === 1 && (!formData.companyName || !formData.contactFirstName || !formData.contactLastName || !formData.email || !formData.phone)) ||
                    (currentStep === 2 && (!formData.deliveryVolume || formData.serviceAreas.length === 0))
                  }
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.agreedToTerms || !formData.agreedToCredit}
                  className="bg-accent hover:bg-accent/90"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Partnership Application'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Questions about partnerships? 
            <a href="tel:912-742-9459" className="text-accent hover:underline ml-1">
              Call (912) 742-9459
            </a> or 
            <a href="mailto:delivered@byachievemor.com" className="text-accent hover:underline ml-1">
              email our partnership team
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}