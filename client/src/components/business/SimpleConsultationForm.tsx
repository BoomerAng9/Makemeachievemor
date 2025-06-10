import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

interface ConsultationFormProps {
  type: 'contractor' | 'company';
  onSuccess: () => void;
}

export function ConsultationForm({ type, onSuccess }: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceType: '',
    description: '',
    timeline: '',
    budget: ''
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
        title: "Request Submitted Successfully!",
        description: "Our team will contact you within 24 hours to discuss your needs.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      requestType: type,
      contactPreference: 'email'
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          {type === 'contractor' ? 'Scale Your Business' : 'Partner with Us'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {type === 'contractor' ? 'Full Name' : 'Contact Person'}
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            {type === 'company' && (
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <Input
                  required
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="ABC Logistics Inc."
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Service Interest</label>
            <Select onValueChange={(value) => handleChange('serviceType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {type === 'contractor' ? (
                  <>
                    <SelectItem value="business_setup">Business Setup & Registration</SelectItem>
                    <SelectItem value="growth">Growth & Scaling Solutions</SelectItem>
                    <SelectItem value="automation">Business Automation</SelectItem>
                    <SelectItem value="marketing">Marketing & Branding</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="dedicated_drivers">Dedicated Driver Network</SelectItem>
                    <SelectItem value="logistics_management">Logistics Management</SelectItem>
                    <SelectItem value="digital_transformation">Digital Transformation</SelectItem>
                    <SelectItem value="operations_support">24/7 Operations Support</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Timeline</label>
              <Select onValueChange={(value) => handleChange('timeline', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate (ASAP)</SelectItem>
                  <SelectItem value="1_month">Within 1 month</SelectItem>
                  <SelectItem value="3_months">Within 3 months</SelectItem>
                  <SelectItem value="6_months">Within 6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Budget Range</label>
              <Select onValueChange={(value) => handleChange('budget', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select budget" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_5k">Under $5,000</SelectItem>
                  <SelectItem value="5k_15k">$5,000 - $15,000</SelectItem>
                  <SelectItem value="15k_50k">$15,000 - $50,000</SelectItem>
                  <SelectItem value="over_50k">Over $50,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project Description</label>
            <Textarea
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Please describe your specific needs and what you're looking to achieve..."
              className="min-h-[100px]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Consultation Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}