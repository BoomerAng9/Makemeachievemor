import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Truck, CheckCircle, Loader2 } from "lucide-react";
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
    cdlClass: "",
    yearsExperience: "",
    agreedToTerms: false,
    agreedToBackground: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.phone && 
           formData.street && 
           formData.city && 
           formData.state && 
           formData.zipCode && 
           formData.agreedToTerms && 
           formData.agreedToBackground;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        country: "US",
        dateOfBirth: formData.dateOfBirth || "1990-01-01",
        dotNumber: formData.dotNumber || "",
        mcNumber: formData.mcNumber || "",
        cdlClass: formData.cdlClass || "A",
        yearsExperience: formData.yearsExperience || "2-5"
      };

      const response = await fetch('/api/drivers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast({
          title: "Registration Successful!",
          description: "Welcome to ACHIEVEMOR! Our team will contact you soon."
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
          cdlClass: "",
          yearsExperience: "",
          agreedToTerms: false,
          agreedToBackground: false
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
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
                    placeholder="your.email@example.com"
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
                    placeholder="(555) 123-4567"
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

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
                
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    placeholder="123 Main Street"
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
                      placeholder="Atlanta"
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
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="OH">Ohio</SelectItem>
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
                    placeholder="30309"
                    required
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dotNumber">DOT Number</Label>
                    <Input
                      id="dotNumber"
                      value={formData.dotNumber}
                      onChange={(e) => handleInputChange("dotNumber", e.target.value)}
                      placeholder="123456 (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mcNumber">MC Number</Label>
                    <Input
                      id="mcNumber"
                      value={formData.mcNumber}
                      onChange={(e) => handleInputChange("mcNumber", e.target.value)}
                      placeholder="789012 (optional)"
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
                      <SelectItem value="A">Class A - Heavy trucks, tractor-trailers</SelectItem>
                      <SelectItem value="B">Class B - Large trucks, buses</SelectItem>
                      <SelectItem value="C">Class C - Regular vehicles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="yearsExperience">Years of Driving Experience</Label>
                  <Select value={formData.yearsExperience} onValueChange={(value) => handleInputChange("yearsExperience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years (New driver)</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years (Experienced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Terms & Agreements */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Terms & Agreements</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.agreedToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreedToTerms", !!checked)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the <span className="text-primary hover:underline font-medium">Terms of Service</span> and <span className="text-primary hover:underline font-medium">Privacy Policy</span>
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="background"
                      checked={formData.agreedToBackground}
                      onCheckedChange={(checked) => handleInputChange("agreedToBackground", !!checked)}
                    />
                    <Label htmlFor="background" className="text-sm leading-relaxed cursor-pointer">
                      I consent to background checks and verification processes as required for driver onboarding and compliance
                    </Label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Next Steps After Registration</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Email verification and account activation</li>
                        <li>• Document upload and verification process</li>
                        <li>• Background check completion</li>
                        <li>• Orientation and onboarding session</li>
                        <li>• Start receiving job opportunities</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <Button 
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}