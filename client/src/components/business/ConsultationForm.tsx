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
  const { toast } = useToast();
  
  const schema = type === 'contractor' ? contractorFormSchema : companyFormSchema;
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      contactPreference: "email",
      currentChallenges: [],
      goals: [],
      operationalAreas: [],
      technologyNeeds: []
    }
  });

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

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };

  const contractorChallenges = [
    "Getting started with business setup",
    "Finding consistent loads",
    "Managing compliance and regulations",
    "Scaling operations efficiently",
    "Financial management and cash flow",
    "Technology and automation",
    "Marketing and customer acquisition",
    "Route optimization"
  ];

  const contractorGoals = [
    "Start my own trucking business",
    "Increase revenue and profitability",
    "Expand my fleet",
    "Automate operations",
    "Improve efficiency",
    "Build brand recognition",
    "Achieve work-life balance",
    "Long-term financial security"
  ];

  const companyChallenges = [
    "Finding reliable drivers",
    "Managing logistics operations",
    "Controlling transportation costs",
    "Ensuring compliance",
    "Technology integration",
    "Scaling operations",
    "Customer service quality",
    "Real-time visibility"
  ];

  const companyGoals = [
    "Reduce transportation costs",
    "Improve delivery reliability",
    "Scale operations efficiently",
    "Enhance customer satisfaction",
    "Implement digital solutions",
    "Expand service areas",
    "Optimize fleet utilization",
    "Achieve operational excellence"
  ];

  const challenges = type === 'contractor' ? contractorChallenges : companyChallenges;
  const goals = type === 'contractor' ? contractorGoals : companyGoals;

  const handleArrayFieldChange = (fieldName: keyof typeof form.formState.defaultValues, value: string, checked: boolean) => {
    const currentValues = (form.getValues(fieldName) as string[]) || [];
    if (checked) {
      form.setValue(fieldName, [...currentValues, value] as any);
    } else {
      form.setValue(fieldName, currentValues.filter((item: string) => item !== value) as any);
    }
  };

  if (step === 1) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Contact Information
            <Badge variant="outline">Step 1 of 3</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
              {type === 'contractor' ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC Logistics Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  Continue to Services
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  if (step === 2) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Service Requirements
            <Badge variant="outline">Step 2 of 3</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6">
              <FormField
                control={form.control}
                name={type === 'contractor' ? 'requestType' : 'serviceType'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {type === 'contractor' ? (
                          <>
                            <SelectItem value="business_setup">Business Setup & Registration</SelectItem>
                            <SelectItem value="growth">Growth & Scaling Solutions</SelectItem>
                            <SelectItem value="automation">Complete Business Automation</SelectItem>
                            <SelectItem value="marketing">Marketing & Brand Development</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="dedicated_drivers">Dedicated Driver Network</SelectItem>
                            <SelectItem value="logistics_management">Logistics Management Platform</SelectItem>
                            <SelectItem value="digital_transformation">Digital Transformation</SelectItem>
                            <SelectItem value="operations_support">24/7 Operations Support</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {type === 'contractor' ? (
                <FormField
                  control={form.control}
                  name="businessStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your business stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="startup">Just Getting Started</SelectItem>
                          <SelectItem value="established">Established Business</SelectItem>
                          <SelectItem value="scaling">Ready to Scale</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small">1-50 employees</SelectItem>
                            <SelectItem value="medium">51-200 employees</SelectItem>
                            <SelectItem value="large">201+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentFleetSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Fleet Size (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 25 trucks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate (ASAP)</SelectItem>
                          <SelectItem value="1_month">Within 1 month</SelectItem>
                          <SelectItem value="3_months">Within 3 months</SelectItem>
                          <SelectItem value="6_months">Within 6 months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under_5k">Under $5,000</SelectItem>
                          <SelectItem value="5k_15k">$5,000 - $15,000</SelectItem>
                          <SelectItem value="15k_50k">$15,000 - $50,000</SelectItem>
                          <SelectItem value="over_50k">Over $50,000</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  Continue to Details
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Project Details
          <Badge variant="outline">Step 3 of 3</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe your specific needs and what you're looking to achieve..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="text-base font-semibold">Current Challenges (Select all that apply)</FormLabel>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                {challenges.map((challenge) => (
                  <div key={challenge} className="flex items-center space-x-2">
                    <Checkbox
                      id={challenge}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('currentChallenges', challenge, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={challenge}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {challenge}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <FormLabel className="text-base font-semibold">Goals (Select all that apply)</FormLabel>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                {goals.map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      onCheckedChange={(checked) => 
                        handleArrayFieldChange('goals', goal, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={goal}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {goal}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {type === 'company' && (
              <div>
                <FormLabel className="text-base font-semibold">Operational Areas (Select all that apply)</FormLabel>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  {['Local/Regional Delivery', 'Long-haul Transportation', 'Last Mile Delivery', 'Freight Brokerage', 'Warehousing', 'Cold Chain', 'Hazmat Transportation', 'Oversized Loads'].map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        onCheckedChange={(checked) => 
                          handleArrayFieldChange('operationalAreas', area, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={area}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {area}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}