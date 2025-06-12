import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Building2, Clock, MapPin, DollarSign, Users, Star } from "lucide-react";

const jobRequirementsSchema = z.object({
  estimatedJobsPerWeek: z.number().min(1, "Must estimate at least 1 job per week").max(100, "Maximum 100 jobs per week"),
  deliveryFrequency: z.enum(["daily", "weekly", "monthly", "as_needed"]),
  deliveryRange: z.object({
    minMiles: z.number().min(10, "Minimum 10 miles"),
    maxMiles: z.number().min(50, "Minimum 50 miles"),
    regions: z.array(z.string()).min(1, "Select at least one region")
  }),
  maxPayoutPerJob: z.number().min(100, "Minimum $100 payout").max(10000, "Maximum $10,000 payout"),
  requiredEquipmentTypes: z.array(z.string()).min(1, "Select at least one equipment type"),
  requiredCertifications: z.array(z.string()).optional(),
  minimumExperience: z.number().min(0).max(20, "Maximum 20 years"),
  backgroundCheckRequired: z.boolean().default(true),
  consistencyDiscountOffered: z.number().min(5).max(10, "Discount must be between 5-10%").default(10),
  longTermContractDiscount: z.number().min(5).max(15, "Discount must be between 5-15%").default(10)
});

type JobRequirementsFormData = z.infer<typeof jobRequirementsSchema>;

interface CompanyJobRequirementsSetupProps {
  companyId: string;
  onComplete: () => void;
}

const EQUIPMENT_TYPES = [
  "Dry Van",
  "Refrigerated",
  "Flatbed", 
  "Step Deck",
  "Lowboy",
  "Box Truck",
  "Cargo Van",
  "Tanker",
  "Car Hauler",
  "Dump Truck"
];

const CERTIFICATIONS = [
  "CDL Class A",
  "CDL Class B", 
  "CDL Class C",
  "Hazmat Endorsement",
  "Double/Triple Trailers",
  "Passenger Endorsement",
  "School Bus Endorsement",
  "Tanker Endorsement",
  "DOT Medical Certificate",
  "TWIC Card"
];

const US_REGIONS = [
  "Northeast",
  "Southeast", 
  "Midwest",
  "Southwest",
  "West Coast",
  "Pacific Northwest",
  "Mountain West",
  "Great Plains",
  "Gulf Coast",
  "Great Lakes"
];

export function CompanyJobRequirementsSetup({ companyId, onComplete }: CompanyJobRequirementsSetupProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<JobRequirementsFormData>({
    resolver: zodResolver(jobRequirementsSchema),
    defaultValues: {
      estimatedJobsPerWeek: 5,
      deliveryFrequency: "weekly",
      deliveryRange: {
        minMiles: 50,
        maxMiles: 500,
        regions: []
      },
      maxPayoutPerJob: 1000,
      requiredEquipmentTypes: [],
      requiredCertifications: [],
      minimumExperience: 2,
      backgroundCheckRequired: true,
      consistencyDiscountOffered: 10,
      longTermContractDiscount: 10
    }
  });

  const createJobRequirementsMutation = useMutation({
    mutationFn: async (data: JobRequirementsFormData) => {
      return apiRequest("POST", "/api/company/job-requirements", {
        companyId,
        ...data
      });
    },
    onSuccess: () => {
      toast({
        title: "Job Requirements Setup Complete",
        description: "Your job posting preferences have been saved successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/company/job-requirements"] });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Setup Failed",
        description: error.message || "Failed to save job requirements",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: JobRequirementsFormData) => {
    createJobRequirementsMutation.mutate(data);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Job Volume & Frequency</h3>
        <p className="text-gray-600">Define your expected job volume and delivery patterns</p>
      </div>

      <Alert>
        <Star className="h-4 w-4" />
        <AlertDescription>
          <strong>Consistency Benefit:</strong> If you find consistency with a contractor, 
          we will reduce our platform fees by 10%.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="estimatedJobsPerWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Jobs Per Week</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="5"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deliveryFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delivery Frequency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="as_needed">As Needed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="deliveryRange"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Delivery Range (without revealing destinations)</FormLabel>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Minimum Miles</label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={field.value.minMiles}
                    onChange={(e) => field.onChange({
                      ...field.value,
                      minMiles: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Maximum Miles</label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={field.value.maxMiles}
                    onChange={(e) => field.onChange({
                      ...field.value,
                      maxMiles: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Service Regions</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {US_REGIONS.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={region}
                        checked={field.value.regions.includes(region)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange({
                              ...field.value,
                              regions: [...field.value.regions, region]
                            });
                          } else {
                            field.onChange({
                              ...field.value,
                              regions: field.value.regions.filter(r => r !== region)
                            });
                          }
                        }}
                      />
                      <label htmlFor={region} className="text-sm">{region}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="maxPayoutPerJob"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Payout Per Job</FormLabel>
            <FormControl>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  placeholder="1000"
                  className="pl-10"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Users className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Contractor Requirements</h3>
        <p className="text-gray-600">Set your minimum requirements for contractors</p>
      </div>

      <FormField
        control={form.control}
        name="requiredEquipmentTypes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Required Equipment Types</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EQUIPMENT_TYPES.map((equipment) => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment}
                    checked={field.value.includes(equipment)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        field.onChange([...field.value, equipment]);
                      } else {
                        field.onChange(field.value.filter(item => item !== equipment));
                      }
                    }}
                  />
                  <label htmlFor={equipment} className="text-sm">{equipment}</label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requiredCertifications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Required Certifications (Optional)</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CERTIFICATIONS.map((cert) => (
                <div key={cert} className="flex items-center space-x-2">
                  <Checkbox
                    id={cert}
                    checked={field.value?.includes(cert) || false}
                    onCheckedChange={(checked) => {
                      const current = field.value || [];
                      if (checked) {
                        field.onChange([...current, cert]);
                      } else {
                        field.onChange(current.filter(item => item !== cert));
                      }
                    }}
                  />
                  <label htmlFor={cert} className="text-sm">{cert}</label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="minimumExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Experience (years)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="backgroundCheckRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Background Check Required</FormLabel>
                <p className="text-sm text-gray-600">
                  Require contractors to complete background verification
                </p>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Consistency Incentives</h3>
        <p className="text-gray-600">Set discounts for consistent and long-term relationships</p>
      </div>

      <Alert>
        <Star className="h-4 w-4" />
        <AlertDescription>
          <strong>Platform Fee Reduction:</strong> Companies that maintain consistent relationships 
          with contractors receive a 10% reduction in platform fees.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="consistencyDiscountOffered"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Consistent Work Discount (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="5"
                  max="10"
                  placeholder="10"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <p className="text-sm text-gray-600">
                Discount offered for contractors with consistent work (5-10%)
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longTermContractDiscount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Long-term Contract Discount (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="5"
                  max="15"
                  placeholder="10"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <p className="text-sm text-gray-600">
                Additional discount for dedicated long-term contracts (5-15%)
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium">Your Job Requirements Summary:</h4>
        <div className="space-y-2 text-sm">
          <div><strong>Jobs Per Week:</strong> {form.getValues("estimatedJobsPerWeek")}</div>
          <div><strong>Frequency:</strong> {form.getValues("deliveryFrequency")}</div>
          <div><strong>Distance Range:</strong> {form.getValues("deliveryRange.minMiles")}-{form.getValues("deliveryRange.maxMiles")} miles</div>
          <div><strong>Max Payout:</strong> ${form.getValues("maxPayoutPerJob")}</div>
          <div><strong>Equipment:</strong> {form.getValues("requiredEquipmentTypes").join(", ")}</div>
          <div><strong>Min Experience:</strong> {form.getValues("minimumExperience")} years</div>
          <div>
            <strong>Regions:</strong>
            {form.getValues("deliveryRange.regions").map((region, i) => (
              <Badge key={i} variant="outline" className="ml-1">
                {region}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Job Requirements Setup - Step {currentStep} of 3
        </CardTitle>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex justify-between">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Previous
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="ml-auto"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto"
                  disabled={createJobRequirementsMutation.isPending}
                >
                  {createJobRequirementsMutation.isPending ? "Saving..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}